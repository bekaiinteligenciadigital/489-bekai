const YOUTUBE_SEARCH_API = 'https://www.googleapis.com/youtube/v3/search'
const YOUTUBE_VIDEOS_API = 'https://www.googleapis.com/youtube/v3/videos'
const YOUTUBE_CHANNELS_API = 'https://www.googleapis.com/youtube/v3/channels'
const YOUTUBE_PLAYLISTS_API = 'https://www.googleapis.com/youtube/v3/playlists'

function hasSecret(name) {
  try {
    if ($secrets.has(name)) return true
  } catch (_) {}

  try {
    return !!$secrets.get(name)
  } catch (_) {
    return false
  }
}

function getCounterText(record) {
  const summary = String(record.get('content_summary') || '')
  const risk = record.get('risk_scores')
  return (
    summary +
    ' ' +
    (typeof risk === 'object' && risk ? JSON.stringify(risk) : '')
  ).toLowerCase()
}

function normalizeTopic(record) {
  return {
    id: record.id,
    name: record.get('name'),
    slug: record.get('slug'),
    description: record.get('description'),
    severity: record.get('severity'),
    keywords: Array.isArray(record.get('keywords_json')) ? record.get('keywords_json') : [],
    counterKeywords: Array.isArray(record.get('counter_keywords_json'))
      ? record.get('counter_keywords_json')
      : [],
    platformScope: Array.isArray(record.get('platform_scope_json'))
      ? record.get('platform_scope_json')
      : [],
    enabled: !!record.get('enabled'),
  }
}

function getTopics() {
  try {
    return $app
      .findRecordsByFilter('harmful_topics', 'enabled = true', 'name', 200, 0)
      .map(normalizeTopic)
  } catch (err) {
    console.log('counterbalance_engine: failed to load harmful_topics', err)
    return []
  }
}

function matchTopic(inputText, platform, topics) {
  const lowered = String(inputText || '').toLowerCase()
  const platformKey = String(platform || '').toLowerCase()

  let best = null

  for (const topic of topics) {
    if (topic.platformScope.length && !topic.platformScope.includes(platformKey)) continue

    const matches = topic.keywords.filter((keyword) => lowered.includes(String(keyword).toLowerCase()))
    if (!matches.length) continue

    if (!best || matches.length > best.matches.length) {
      best = { topic, matches }
    }
  }

  return best
}

function buildYouTubeCounterQuery(topic) {
  const parts = []
  if (topic && topic.counterKeywords && topic.counterKeywords.length) {
    parts.push(topic.counterKeywords.slice(0, 2).join(' '))
  }
  if (topic && topic.name) {
    parts.push(topic.name)
  }
  parts.push('conteudo educativo saudavel')
  return parts.filter(Boolean).join(' ')
}

function youtubeApiGet(baseUrl, params) {
  if (!hasSecret('YOUTUBE_API_KEY')) return null

  const query = Object.keys(params || {})
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .map((key) => key + '=' + encodeURIComponent(String(params[key])))
    .join('&')

  const response = $http.send({
    url: baseUrl + '?' + query + '&key=' + encodeURIComponent($secrets.get('YOUTUBE_API_KEY')),
    method: 'GET',
    timeout: 30,
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    console.log('counterbalance_engine: youtube request failed', baseUrl, response.statusCode, response.raw)
    return null
  }

  return response.json || {}
}

function fetchYouTubeVideoDetails(videoIds) {
  if (!videoIds.length) return {}

  const body = youtubeApiGet(YOUTUBE_VIDEOS_API, {
    part: 'snippet,contentDetails,statistics,status',
    id: videoIds.join(','),
    maxResults: videoIds.length,
  })

  const items = body && Array.isArray(body.items) ? body.items : []
  const details = {}
  items.forEach((item) => {
    details[item.id] = item
  })
  return details
}

function fetchYouTubeChannelDetails(channelIds) {
  if (!channelIds.length) return {}

  const body = youtubeApiGet(YOUTUBE_CHANNELS_API, {
    part: 'snippet,statistics',
    id: channelIds.join(','),
    maxResults: channelIds.length,
  })

  const items = body && Array.isArray(body.items) ? body.items : []
  const details = {}
  items.forEach((item) => {
    details[item.id] = item
  })
  return details
}

function fetchYouTubePlaylistDetails(playlistIds) {
  if (!playlistIds.length) return {}

  const body = youtubeApiGet(YOUTUBE_PLAYLISTS_API, {
    part: 'snippet,contentDetails',
    id: playlistIds.join(','),
    maxResults: playlistIds.length,
  })

  const items = body && Array.isArray(body.items) ? body.items : []
  const details = {}
  items.forEach((item) => {
    details[item.id] = item
  })
  return details
}

function searchYouTube(query) {
  if (!hasSecret('YOUTUBE_API_KEY')) return []

  const body = youtubeApiGet(YOUTUBE_SEARCH_API, {
    part: 'snippet',
    q: query,
    maxResults: 8,
    safeSearch: 'strict',
    relevanceLanguage: 'pt',
    regionCode: 'BR',
  })

  const items = Array.isArray(body.items) ? body.items : []
  const videoIds = []
  const channelIds = []
  const playlistIds = []

  items.forEach((item) => {
    const kind = item && item.id && item.id.kind ? item.id.kind : ''
    if (kind === 'youtube#video' && item.id.videoId) videoIds.push(item.id.videoId)
    if (kind === 'youtube#channel' && item.id.channelId) channelIds.push(item.id.channelId)
    if (kind === 'youtube#playlist' && item.id.playlistId) playlistIds.push(item.id.playlistId)
  })

  const videoDetails = fetchYouTubeVideoDetails(videoIds)
  const channelDetails = fetchYouTubeChannelDetails(channelIds)
  const playlistDetails = fetchYouTubePlaylistDetails(playlistIds)

  return items
    .map((item) => {
      const snippet = item && item.snippet ? item.snippet : {}
      const kind = item && item.id && item.id.kind ? item.id.kind : ''
      const mediumThumb =
        snippet.thumbnails && snippet.thumbnails.medium ? snippet.thumbnails.medium.url : ''
      const highThumb =
        snippet.thumbnails && snippet.thumbnails.high ? snippet.thumbnails.high.url : ''

      if (kind === 'youtube#video' && item.id.videoId) {
        const detail = videoDetails[item.id.videoId] || {}
        return {
          platform: 'youtube',
          resourceType: 'video',
          title: snippet.title || 'Video recomendado',
          description: snippet.description || '',
          url: 'https://www.youtube.com/watch?v=' + item.id.videoId,
          thumbnail: mediumThumb || highThumb,
          channelTitle: snippet.channelTitle || '',
          publishedAt: snippet.publishedAt || '',
          duration:
            detail.contentDetails && detail.contentDetails.duration
              ? detail.contentDetails.duration
              : '',
          embeddable:
            detail.status && typeof detail.status.embeddable === 'boolean'
              ? detail.status.embeddable
              : null,
          viewCount:
            detail.statistics && detail.statistics.viewCount ? detail.statistics.viewCount : '',
        }
      }

      if (kind === 'youtube#channel' && item.id.channelId) {
        const detail = channelDetails[item.id.channelId] || {}
        return {
          platform: 'youtube',
          resourceType: 'channel',
          title: snippet.title || 'Canal recomendado',
          description: snippet.description || '',
          url: 'https://www.youtube.com/channel/' + item.id.channelId,
          thumbnail: mediumThumb || highThumb,
          channelTitle: snippet.channelTitle || snippet.title || '',
          publishedAt: snippet.publishedAt || '',
          subscriberCount:
            detail.statistics && detail.statistics.subscriberCount
              ? detail.statistics.subscriberCount
              : '',
          videoCount:
            detail.statistics && detail.statistics.videoCount ? detail.statistics.videoCount : '',
        }
      }

      if (kind === 'youtube#playlist' && item.id.playlistId) {
        const detail = playlistDetails[item.id.playlistId] || {}
        return {
          platform: 'youtube',
          resourceType: 'playlist',
          title: snippet.title || 'Playlist recomendada',
          description: snippet.description || '',
          url: 'https://www.youtube.com/playlist?list=' + item.id.playlistId,
          thumbnail: mediumThumb || highThumb,
          channelTitle: snippet.channelTitle || '',
          publishedAt: snippet.publishedAt || '',
          itemCount:
            detail.contentDetails && detail.contentDetails.itemCount
              ? detail.contentDetails.itemCount
              : '',
        }
      }

      return null
    })
    .filter(Boolean)
}

function fallbackCounterContent(topic) {
  return topic.counterKeywords.slice(0, 4).map((keyword, index) => ({
    platform: 'manual_curation',
    resourceType: 'manual',
    title: 'Sugestao ' + String(index + 1) + ': ' + keyword,
    description: 'Use este tema como base para curadoria positiva e contraponto educativo.',
    url: '',
  }))
}

function buildIntervention(topic, triggerText, platform, contentHits) {
  const urgency =
    topic.severity === 'critical'
      ? 'alta'
      : topic.severity === 'high'
        ? 'alta'
        : topic.severity === 'medium'
          ? 'media'
          : 'baixa'

  const youtubeConfigured = hasSecret('YOUTUBE_API_KEY')
  const usedYouTube = contentHits.length > 0
  const contentSuggestions = usedYouTube ? contentHits : fallbackCounterContent(topic)
  const headlineTopic = topic.name || topic.slug
  const guardianSummary =
    'O agente BekAI identificou recorrencia de sinais ligados a "' +
    headlineTopic +
    '" e recomenda uma curadoria de contraponto com conteudos beneficos, linguagem acolhedora e revisao da recorrencia nas proximas sincronizacoes.'
  const deliveryMessage =
    'Identificamos um tema sensivel em alta recorrencia e separamos conteudos positivos sobre ' +
    topic.counterKeywords.slice(0, 2).join(' e ') +
    '. A sugestao e reforcar este repertorio nas proximas interacoes do jovem.'

  return {
    harmfulTopic: topic.slug,
    severity: topic.severity,
    urgency,
    triggerText,
    platform,
    matchedKeywords: topic.keywords,
    counterNarrative:
      topic.slug === 'violencia'
        ? 'Priorizar paz, empatia, resolucao de conflitos, disciplina e seguranca emocional.'
        : topic.slug === 'autolesao'
          ? 'Reforcar acolhimento, cuidado, esperanca e orientacao para apoio humano imediato.'
          : topic.slug === 'sexualizacao'
            ? 'Substituir por autocuidado, autoestima, relacoes saudaveis e desenvolvimento integral.'
            : 'Substituir por repertorio construtivo e regulador.',
    recommendedActions: [
      'Registrar o sinal no prontuario do jovem e notificar o responsavel.',
      'Injetar curadoria de contraponto em canais permitidos e no dashboard.',
      'Reavaliar recorrencia do tema nas proximas sincronizacoes.',
    ],
    guardianSummary,
    algorithmGoal:
      'Aumentar a exposicao recorrente a conteudos beneficos e reduzir a dominancia do tema nocivo nos proximos ciclos do algoritmo.',
    deliveryMessage,
    youtubeConfigured,
    contentSource: usedYouTube ? 'youtube_api' : 'manual_fallback',
    contentSuggestions,
  }
}

function buildYouTubeAgentPayload(topic, query, items, childName, sourceEventId) {
  return {
    agentType: 'youtube',
    matchedTopic: topic ? topic.slug : null,
    matchedTopicName: topic ? topic.name : null,
    youtubeQuery: query,
    contentSource: items.length ? 'youtube_api' : 'manual_fallback',
    guardianSummary:
      'O Agente YouTube montou uma trilha de contraponto para ' +
      childName +
      ', priorizando repertorio benefico e reduzindo a dominancia do tema sensivel nas proximas interacoes.',
    algorithmGoal:
      'Aumentar sinais consistentes de interesse por conteudos construtivos no YouTube para influenciar recomendacoes futuras de forma indireta.',
    recommendedActions: [
      'Apresente os conteudos em contexto acompanhado, com conversa curta sobre o tema.',
      'Repita a exposicao positiva ao longo da semana para fortalecer o novo padrao de interacao.',
      'Observe se novos eventos reduzem a recorrencia do tema nocivo anterior.',
    ],
    sourceEventId: sourceEventId || null,
    contentSuggestions: items.length ? items : topic ? fallbackCounterContent(topic) : [],
  }
}

function saveIntervention(childId, sourceEventId, topicId, triggerText, recommendation) {
  try {
    const collection = $app.findCollectionByNameOrId('counter_interventions')
    const record = new Record(collection)
    record.set('child', childId)
    record.set('source_event', sourceEventId || null)
    record.set('harmful_topic', topicId)
    record.set('trigger_text', triggerText)
    record.set('status', 'suggested')
    record.set('delivery_channel', 'dashboard')
    record.set('recommendation_json', recommendation)
    $app.save(record)
    return record
  } catch (err) {
    console.log('counterbalance_engine: failed to save intervention', err)
    return null
  }
}

function ensureChildAccess(child, authRecord) {
  if (!authRecord) throw new ForbiddenError('Autenticacao obrigatoria.')
  if (child.get('parent') !== authRecord.id && child.get('assigned_professional') !== authRecord.id) {
    throw new ForbiddenError('Sem permissao para este jovem.')
  }
}

function createNotification(userId, title, message, link, priority) {
  try {
    const notifCollection = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifCollection)
    notif.set('user', userId)
    notif.set('title', title)
    notif.set('message', message)
    notif.set('link', link || '/dashboard')
    notif.set('is_read', false)
    notif.set('priority', priority || 'info')
    $app.save(notif)
  } catch (err) {
    console.log('counterbalance_engine: failed to create notification', err)
  }
}

function trySendWhatsApp(userRecord, messageText) {
  try {
    if (!userRecord || !userRecord.get('whatsapp_enabled') || !userRecord.get('phone')) return false

    const sid = $secrets.get('TWILIO_ACCOUNT_SID')
    const token = $secrets.get('TWILIO_AUTH_TOKEN')
    const fromNum = $secrets.get('TWILIO_WHATSAPP_NUMBER')
    if (!sid || !token || !fromNum) return false

    let toNum = String(userRecord.get('phone') || '').replace(/\D/g, '')
    if (!toNum) return false
    if (toNum.charAt(0) !== '+') toNum = '+' + toNum

    $http.send({
      url: 'https://' + sid + ':' + token + '@api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:
        'To=' +
        encodeURIComponent('whatsapp:' + toNum) +
        '&From=' +
        encodeURIComponent('whatsapp:' + fromNum) +
        '&Body=' +
        encodeURIComponent('BekAI: ' + messageText),
      timeout: 30,
    })

    return true
  } catch (err) {
    console.log('counterbalance_engine: failed to send whatsapp', err)
    return false
  }
}

function updateInterventionWorkflow(intervention, actorId, status, deliveryChannel, note, customMessage) {
  const currentRecommendation = intervention.get('recommendation_json')
  const recommendation =
    typeof currentRecommendation === 'object' && currentRecommendation
      ? currentRecommendation
      : {}

  recommendation.reviewNotes = note || recommendation.reviewNotes || ''
  recommendation.reviewedBy = actorId
  recommendation.reviewedAt = new Date().toISOString()

  if (customMessage) {
    recommendation.deliveryMessage = customMessage
  }

  if (status === 'delivered') {
    recommendation.deliveredBy = actorId
    recommendation.deliveredAt = new Date().toISOString()
  }

  intervention.set('status', status)
  intervention.set('delivery_channel', deliveryChannel || intervention.get('delivery_channel') || 'dashboard')
  intervention.set('recommendation_json', recommendation)
  $app.save(intervention)
  return recommendation
}

routerAdd(
  'POST',
  '/backend/v1/counterbalance/preview',
  (e) => {
    const body = e.requestInfo().body || {}
    const topics = getTopics()
    const topic = body.topicSlug
      ? topics.find((item) => item.slug === body.topicSlug)
      : (matchTopic(body.triggerText || body.queryText || '', body.platform || '', topics) || {}).topic

    if (!topic) {
      return e.json(200, {
        success: true,
        matched: false,
        message: 'Nenhum topico nocivo configurado foi acionado.',
      })
    }

    const query = buildYouTubeCounterQuery(topic)
    const contentSuggestions = searchYouTube(query)
    const recommendation = buildIntervention(
      topic,
      body.triggerText || body.queryText || '',
      body.platform || 'unknown',
      contentSuggestions,
    )

    return e.json(200, {
      success: true,
      matched: true,
      youtubeQuery: query,
      recommendation,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/youtube/search',
  (e) => {
    const body = e.requestInfo().body || {}
    const query = String(body.query || '').trim()
    if (!query) {
      throw new BadRequestError('query e obrigatoria para busca no YouTube.')
    }

    if (!hasSecret('YOUTUBE_API_KEY')) {
      return e.json(200, {
        success: false,
        configured: false,
        query,
        items: [],
        message: 'YOUTUBE_API_KEY nao configurada no servidor.',
      })
    }

    const items = searchYouTube(query)
    return e.json(200, {
      success: true,
      configured: true,
      query,
      items,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/children/{id}/youtube-agent/run',
  (e) => {
    const childId = e.request.pathValue('id')
    const body = e.requestInfo().body || {}
    const child = $app.findRecordById('children', childId)
    const authRecord = e.auth

    ensureChildAccess(child, authRecord)

    const topics = getTopics()
    const topicSlug = String(body.topicSlug || '').trim()
    const customQuery = String(body.query || '').trim()
    const maxResults = Math.min(Math.max(parseInt(String(body.maxResults || '6'), 10) || 6, 1), 12)

    let matchedTopic = topicSlug ? topics.find((item) => item.slug === topicSlug) || null : null
    let sourceEvent = null

    if (!matchedTopic && !customQuery) {
      const events = $app.findRecordsByFilter(
        'digital_events',
        `child = "${childId}"`,
        '-timestamp',
        20,
        0,
      )

      for (const event of events) {
        const matched = matchTopic(getCounterText(event), event.get('platform'), topics)
        if (matched) {
          matchedTopic = matched.topic
          sourceEvent = event
          break
        }
      }
    }

    if (!matchedTopic && !customQuery) {
      return e.json(200, {
        success: false,
        childId,
        configured: hasSecret('YOUTUBE_API_KEY'),
        message: 'Nenhum topico nocivo configurado foi detectado para acionar o Agente YouTube.',
        items: [],
      })
    }

    const query = customQuery || buildYouTubeCounterQuery(matchedTopic)
    const items = searchYouTube(query).slice(0, maxResults)
    const payload = buildYouTubeAgentPayload(
      matchedTopic,
      query,
      items,
      String(child.get('name') || 'jovem'),
      sourceEvent ? sourceEvent.id : null,
    )

    let interventionId = null
    if (matchedTopic) {
      const saved = saveIntervention(
        childId,
        sourceEvent ? sourceEvent.id : null,
        matchedTopic.id,
        sourceEvent ? sourceEvent.get('content_summary') || query : query,
        payload,
      )
      interventionId = saved ? saved.id : null
    }

    return e.json(200, {
      success: true,
      configured: hasSecret('YOUTUBE_API_KEY'),
      childId,
      interventionId,
      query,
      matchedTopic: matchedTopic
        ? { id: matchedTopic.id, slug: matchedTopic.slug, name: matchedTopic.name, severity: matchedTopic.severity }
        : null,
      sourceEventId: sourceEvent ? sourceEvent.id : null,
      items: payload.contentSuggestions,
      recommendation: payload,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/children/{id}/counterbalance/run',
  (e) => {
    const childId = e.request.pathValue('id')
    const child = $app.findRecordById('children', childId)
    const authRecord = e.auth

    ensureChildAccess(child, authRecord)

    const topics = getTopics()
    const events = $app.findRecordsByFilter(
      'digital_events',
      `child = "${childId}"`,
      '-timestamp',
      20,
      0,
    )

    const interventions = []

    for (const event of events) {
      const matched = matchTopic(getCounterText(event), event.get('platform'), topics)
      if (!matched) continue

      const topic = matched.topic
      const query = buildYouTubeCounterQuery(topic)
      const contentSuggestions = searchYouTube(query)
      const recommendation = buildIntervention(
        topic,
        event.get('content_summary') || matched.matches.join(', '),
        event.get('platform'),
        contentSuggestions,
      )
      recommendation.youtubeQuery = query

      const saved = saveIntervention(childId, event.id, topic.id, recommendation.triggerText, recommendation)
      interventions.push({
        id: saved ? saved.id : null,
        topic: topic.slug,
        sourceEventId: event.id,
        recommendation,
      })
    }

    return e.json(200, {
      success: true,
      childId,
      interventionsCreated: interventions.length,
      interventions,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/counter-interventions/{id}/status',
  (e) => {
    const interventionId = e.request.pathValue('id')
    const body = e.requestInfo().body || {}
    const status = String(body.status || '')
    const deliveryChannel = String(body.deliveryChannel || body.delivery_channel || 'dashboard')
    const note = String(body.note || '')
    const customMessage = String(body.customMessage || '')
    const authRecord = e.auth

    if (['reviewed', 'delivered', 'dismissed', 'suggested'].indexOf(status) === -1) {
      throw new BadRequestError('Status invalido para a intervencao.')
    }

    const intervention = $app.findRecordById('counter_interventions', interventionId)
    const child = $app.findRecordById('children', intervention.get('child'))
    ensureChildAccess(child, authRecord)

    const recommendation = updateInterventionWorkflow(
      intervention,
      authRecord.id,
      status,
      deliveryChannel,
      note,
      customMessage,
    )

    const parentId = child.get('parent')
    const childName = child.get('name')
    const harmfulTopic = recommendation.harmfulTopic || intervention.get('harmful_topic')

    if (status === 'reviewed') {
      createNotification(
        parentId,
        'Contraponto pronto para revisao',
        'Uma nova intervencao sobre "' +
          harmfulTopic +
          '" foi preparada para ' +
          childName +
          ' e esta disponivel no painel BekAI.',
        '/dashboard/parent',
        'warning',
      )
    }

    let whatsappSent = false
    if (status === 'delivered') {
      createNotification(
        parentId,
        'Contraponto entregue',
        'A intervencao de contraponto para "' +
          harmfulTopic +
          '" foi marcada como entregue para ' +
          childName +
          '.',
        '/dashboard/parent',
        'info',
      )

      if (deliveryChannel === 'whatsapp') {
        try {
          const parentUser = $app.findRecordById('Nascimento', parentId)
          whatsappSent = trySendWhatsApp(
            parentUser,
            customMessage || recommendation.deliveryMessage || recommendation.guardianSummary || '',
          )
        } catch (err) {
          console.log('counterbalance_engine: failed to load parent user for whatsapp', err)
        }
      }
    }

    return e.json(200, {
      success: true,
      interventionId,
      status,
      deliveryChannel,
      whatsappSent,
      recommendation,
    })
  },
  $apis.requireAuth(),
)
