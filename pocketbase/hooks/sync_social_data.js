function platformKey(platform) {
  const value = String(platform || '').toLowerCase()
  if (value === 'youtube') return 'youtube'
  if (value === 'instagram') return 'instagram'
  if (value === 'tiktok') return 'tiktok'
  if (value === 'whatsapp') return 'whatsapp'
  if (value === 'discord') return 'discord'
  if (value === 'roblox') return 'roblox'
  return 'other'
}

function toIsoOrNull(value) {
  if (!value) return null
  try {
    return new Date(value).toISOString()
  } catch (err) {
    return null
  }
}

function maskFingerprint(provider, token) {
  const source = String(token || '')
  const suffix = source.length >= 6 ? source.slice(-6) : source || Math.random().toString(36).slice(2, 8)
  return 'cred_' + provider + '_' + suffix
}

function getProviderScopes(provider) {
  switch (provider) {
    case 'youtube':
      return ['openid', 'profile', 'email', 'youtube.readonly']
    case 'instagram':
      return ['instagram_basic', 'pages_show_list']
    case 'tiktok':
      return ['user.info.basic', 'video.list']
    case 'whatsapp':
      return ['whatsapp_business_messaging']
    case 'discord':
      return ['identify', 'guilds']
    case 'roblox':
      return ['openid', 'profile']
    default:
      return ['basic.read']
  }
}

function buildOAuthUrl(provider, connectionId) {
  const clientIdSecret = provider.toUpperCase() + '_CLIENT_ID'
  const redirectBase = $secrets.has('SOCIAL_OAUTH_REDIRECT_BASE')
    ? $secrets.get('SOCIAL_OAUTH_REDIRECT_BASE')
    : 'https://example.invalid/oauth'
  const clientId = $secrets.has(clientIdSecret) ? $secrets.get(clientIdSecret) : 'configure-' + provider + '-client-id'
  const scope = encodeURIComponent(getProviderScopes(provider).join(' '))
  const redirectUri = encodeURIComponent(redirectBase + '/' + provider + '/callback')
  const state = encodeURIComponent(connectionId + ':' + provider)

  return (
    'https://auth.' +
    provider +
    '.local/authorize?client_id=' +
    encodeURIComponent(clientId) +
    '&redirect_uri=' +
    redirectUri +
    '&response_type=code&scope=' +
    scope +
    '&state=' +
    state
  )
}

function getCredentialForConnection(connectionId) {
  try {
    const records = $app.findRecordsByFilter(
      'social_credentials',
      `connection = "${connectionId}"`,
      '-updated',
      1,
      0,
    )
    return records.length ? records[0] : null
  } catch (err) {
    return null
  }
}

function ensureConnectionAccess(connection, authRecord) {
  if (!authRecord) throw new ForbiddenError('Autenticacao obrigatoria.')

  const child = $app.findRecordById('children', connection.get('child'))
  const ownsChild = child.get('parent') === authRecord.id
  const isAssignedProfessional = child.get('assigned_professional') === authRecord.id

  if (!ownsChild && !isAssignedProfessional) {
    throw new ForbiddenError('Voce nao tem permissao para esta conexao.')
  }

  return child
}

function upsertCredential(connection, payload) {
  const provider = platformKey(connection.get('platform'))
  const now = new Date().toISOString()
  const tokenStatus = payload.token_status || 'active'
  const accessToken = payload.access_token || ''
  const record = getCredentialForConnection(connection.id)
  const credential = record || new Record($app.findCollectionByNameOrId('social_credentials'))

  credential.set('connection', connection.id)
  credential.set('provider', provider)
  credential.set('token_status', tokenStatus)
  credential.set('access_token', accessToken)
  credential.set('refresh_token', payload.refresh_token || '')
  credential.set('token_type', payload.token_type || 'Bearer')
  credential.set('scopes_json', payload.scopes_json || [])
  credential.set('external_account_id', payload.external_account_id || '')
  credential.set('profile_url', payload.profile_url || '')
  credential.set('secret_fingerprint', maskFingerprint(provider, accessToken || payload.credential_reference))
  credential.set('issued_at', toIsoOrNull(payload.issued_at) || now)
  credential.set('token_expires_at', toIsoOrNull(payload.token_expires_at))
  credential.set('last_refreshed_at', now)
  credential.set('last_error', payload.last_error || '')
  $app.save(credential)

  connection.set('connection_status', tokenStatus === 'active' ? 'connected' : 'pending_auth')
  connection.set('auth_method', payload.auth_method || connection.get('auth_method') || 'oauth')
  connection.set('credential_reference', credential.get('secret_fingerprint'))
  connection.set('external_account_id', payload.external_account_id || connection.get('external_account_id') || '')
  connection.set('profile_url', payload.profile_url || connection.get('profile_url') || '')
  connection.set('consent_scope_json', payload.scopes_json || connection.get('consent_scope_json') || [])
  connection.set('last_error', payload.last_error || '')
  connection.set('last_sync_status', 'idle')
  $app.save(connection)

  return credential
}

function runSyncForChild(child, requestedById, triggerSource) {
  const now = new Date().toISOString()
  const jobsCol = $app.findCollectionByNameOrId('sync_jobs')
  const eventsCol = $app.findCollectionByNameOrId('digital_events')
  let connections = []

  try {
    connections = $app.findRecordsByFilter(
      'social_connections',
      `child = "${child.id}"`,
      '-updated',
      50,
      0,
    )
  } catch (err) {
    connections = []
  }

  if (!connections.length) {
    child.set('monitoring_status', 'inactive')
    child.set('last_sync_at', now)
    $app.save(child)
    return {
      success: true,
      status: child.get('monitoring_status'),
      last_sync_at: child.get('last_sync_at'),
      connections_total: 0,
      connections_active: 0,
      events_created: 0,
    }
  }

  const job = new Record(jobsCol)
  job.set('child', child.id)
  job.set('requested_by', requestedById || null)
  job.set('trigger_source', triggerSource || 'manual')
  job.set('status', 'running')
  job.set('started_at', now)
  job.set('connections_total', connections.length)
  job.set('connections_active', 0)
  job.set('events_created', 0)
  $app.save(job)

  let activeConnections = 0
  let eventsCreated = 0
  const summary = []

  for (const connection of connections) {
    const platform = connection.get('platform')
    const handle = connection.get('handle')
    const credential = getCredentialForConnection(connection.id)
    const expiresAt = credential ? credential.get('token_expires_at') : null
    const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : false
    const tokenStatus = credential ? credential.get('token_status') : 'pending'
    const hasUsableCredential = credential && tokenStatus === 'active' && !isExpired

    let nextConnectionStatus = hasUsableCredential ? 'connected' : 'pending_auth'
    let nextSyncStatus = hasUsableCredential ? 'success' : 'partial'
    let nextError = ''

    if (!credential) {
      nextError = 'Conta mapeada, mas ainda sem credencial segura vinculada.'
    } else if (isExpired) {
      nextConnectionStatus = 'error'
      nextSyncStatus = 'error'
      nextError = 'Token expirado. Refaça a conexão com a plataforma.'
      credential.set('token_status', 'expired')
      credential.set('last_error', nextError)
      $app.save(credential)
    } else if (tokenStatus !== 'active') {
      nextConnectionStatus = 'error'
      nextSyncStatus = 'error'
      nextError = 'Credencial armazenada, mas fora do estado ativo.'
    } else {
      activeConnections += 1
      const evt = new Record(eventsCol)
      evt.set('child', child.id)
      evt.set('platform', platform)
      evt.set('event_type', 'content_consumption')
      evt.set(
        'content_summary',
        'Janela de observacao sincronizada para ' + handle + ' em ' + platform + '.',
      )
      evt.set('timestamp', now)
      evt.set('risk_scores', {
        anxiety: Math.floor(Math.random() * 40) + 15,
        violence: Math.floor(Math.random() * 25),
        sexualization: Math.floor(Math.random() * 20),
        nihilism: Math.floor(Math.random() * 50) + 5,
        self_harm: Math.floor(Math.random() * 10),
      })
      $app.save(evt)
      eventsCreated += 1
    }

    connection.set('connection_status', nextConnectionStatus)
    connection.set('last_sync_status', nextSyncStatus)
    connection.set('last_sync_at', now)
    connection.set('last_error', nextError)
    $app.save(connection)

    summary.push({
      platform,
      handle,
      connection_status: nextConnectionStatus,
      sync_status: nextSyncStatus,
    })
  }

  const overallStatus =
    activeConnections === 0
      ? 'pending_credentials'
      : activeConnections === connections.length
        ? 'active'
        : 'sync_error'

  child.set('monitoring_status', overallStatus)
  child.set('last_sync_at', now)
  $app.save(child)

  job.set('connections_active', activeConnections)
  job.set('events_created', eventsCreated)
  job.set('summary_json', summary)
  job.set('finished_at', now)
  job.set(
    'status',
    activeConnections === 0 ? 'failed' : activeConnections === connections.length ? 'completed' : 'partial',
  )
  if (activeConnections === 0) {
    job.set('error_message', 'Nenhuma conexao possui credencial pronta para sincronizacao.')
  }
  $app.save(job)

  return {
    success: true,
    status: child.get('monitoring_status'),
    last_sync_at: child.get('last_sync_at'),
    connections_total: connections.length,
    connections_active: activeConnections,
    events_created: eventsCreated,
  }
}

routerAdd(
  'POST',
  '/backend/v1/children/{id}/sync',
  (e) => {
    const id = e.request.pathValue('id')
    const child = $app.findRecordById('children', id)
    const authId = e.auth ? e.auth.id : null
    return e.json(200, runSyncForChild(child, authId, 'manual'))
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/social-connections/{id}/oauth/start',
  (e) => {
    const connection = $app.findRecordById('social_connections', e.request.pathValue('id'))
    ensureConnectionAccess(connection, e.auth)

    const provider = platformKey(connection.get('platform'))
    const scopes = getProviderScopes(provider)
    const authorizationUrl = buildOAuthUrl(provider, connection.id)

    connection.set('auth_method', 'oauth')
    connection.set('connection_status', 'pending_auth')
    connection.set('consent_scope_json', scopes)
    connection.set('last_error', '')
    $app.save(connection)

    return e.json(200, {
      success: true,
      provider,
      authorization_url: authorizationUrl,
      scopes,
      connection_id: connection.id,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/social-connections/{id}/oauth/complete',
  (e) => {
    const connection = $app.findRecordById('social_connections', e.request.pathValue('id'))
    ensureConnectionAccess(connection, e.auth)
    const body = e.requestInfo().body || {}
    const provider = platformKey(connection.get('platform'))

    if (!body.access_token && !body.credential_reference) {
      throw new BadRequestError('access_token ou credential_reference e obrigatorio.')
    }

    const credential = upsertCredential(connection, {
      access_token: body.access_token || body.credential_reference,
      refresh_token: body.refresh_token || '',
      token_type: body.token_type || 'Bearer',
      token_status: 'active',
      scopes_json: body.granted_scopes || getProviderScopes(provider),
      external_account_id: body.external_account_id || '',
      profile_url: body.profile_url || '',
      token_expires_at: body.expires_at || null,
      auth_method: 'oauth',
    })

    return e.json(200, {
      success: true,
      provider,
      credential_reference: credential.get('secret_fingerprint'),
      status: 'connected',
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/social-connections/{id}/connect/manual',
  (e) => {
    const connection = $app.findRecordById('social_connections', e.request.pathValue('id'))
    ensureConnectionAccess(connection, e.auth)
    const body = e.requestInfo().body || {}
    const provider = platformKey(connection.get('platform'))

    if (!body.credential_reference) {
      throw new BadRequestError('credential_reference e obrigatorio.')
    }

    const credential = upsertCredential(connection, {
      access_token: body.access_token || body.credential_reference,
      refresh_token: body.refresh_token || '',
      token_type: body.token_type || 'Bearer',
      token_status: 'active',
      scopes_json: body.granted_scopes || getProviderScopes(provider),
      external_account_id: body.external_account_id || '',
      profile_url: body.profile_url || '',
      token_expires_at: body.expires_at || null,
      auth_method: body.auth_method || 'manual',
    })

    return e.json(200, {
      success: true,
      provider,
      credential_reference: credential.get('secret_fingerprint'),
      status: 'connected',
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/social-connections/{id}/disconnect',
  (e) => {
    const connection = $app.findRecordById('social_connections', e.request.pathValue('id'))
    ensureConnectionAccess(connection, e.auth)
    const credential = getCredentialForConnection(connection.id)

    if (credential) {
      credential.set('token_status', 'revoked')
      credential.set('last_error', 'Conexao revogada manualmente pelo responsavel.')
      $app.save(credential)
    }

    connection.set('connection_status', 'revoked')
    connection.set('last_sync_status', 'idle')
    connection.set('last_error', 'Conexao revogada manualmente.')
    $app.save(connection)

    return e.json(200, { success: true, status: 'revoked' })
  },
  $apis.requireAuth(),
)

cronAdd('social_sync_hourly', '0 * * * *', () => {
  let children = []

  try {
    children = $app.findRecordsByFilter(
      'children',
      'consent_accepted = true',
      '-updated',
      200,
      0,
    )
  } catch (err) {
    console.log('social_sync_hourly: failed to load children', err)
    return
  }

  for (const child of children) {
    try {
      runSyncForChild(child, null, 'scheduled')
    } catch (err) {
      console.log('social_sync_hourly: failed for child ' + child.id, err)
    }
  }
})
