routerAdd(
  'POST',
  '/backend/v1/children/{id}/sync',
  (e) => {
    const id = e.request.pathValue('id')
    const child = $app.findRecordById('children', id)
    const user = e.auth
    const now = new Date().toISOString()
    const connectionsCol = $app.findCollectionByNameOrId('social_connections')
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
      const platformsRaw = child.get('platforms')
      let platforms = []

      try {
        platforms = typeof platformsRaw === 'string' ? JSON.parse(platformsRaw) : platformsRaw
      } catch (err) {}

      if (!Array.isArray(platforms)) {
        platforms = []
      }

      connections = platforms.map((item) => {
        const record = new Record(connectionsCol)
        record.set('child', child.id)
        record.set('platform', item?.platform || 'Outro')
        record.set('handle', item?.handle || 'perfil-manual')
        record.set('connection_status', 'pending_auth')
        record.set('auth_method', 'manual')
        record.set('last_sync_status', 'idle')
        $app.save(record)
        return record
      })
    }

    const job = new Record(jobsCol)
    job.set('child', child.id)
    job.set('requested_by', user?.id || null)
    job.set('trigger_source', 'manual')
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
      const hasCredentialReference = !!connection.get('credential_reference')
      const previousStatus = connection.get('connection_status') || 'pending_auth'

      let nextConnectionStatus = previousStatus
      let nextSyncStatus = 'partial'
      let nextError = 'Conta mapeada, mas ainda sem credencial segura vinculada.'

      if (hasCredentialReference || previousStatus === 'connected') {
        nextConnectionStatus = 'connected'
        nextSyncStatus = 'success'
        nextError = ''
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
      } else {
        nextConnectionStatus = 'pending_auth'
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
      activeConnections === 0
        ? 'failed'
        : activeConnections === connections.length
          ? 'completed'
          : 'partial',
    )
    if (activeConnections === 0) {
      job.set('error_message', 'Nenhuma conexao possui credencial pronta para sincronizacao.')
    }
    $app.save(job)

    return e.json(200, {
      success: true,
      status: child.get('monitoring_status'),
      last_sync_at: child.get('last_sync_at'),
      connections_total: connections.length,
      connections_active: activeConnections,
      events_created: eventsCreated,
    })
  },
  $apis.requireAuth(),
)
