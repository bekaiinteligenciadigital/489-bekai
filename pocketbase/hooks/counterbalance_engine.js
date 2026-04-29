const YOUTUBE_SEARCH_API = 'https://www.googleapis.com/youtube/v3/search'

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

function searchYouTube(query) {
  if (!$secrets.has('YOUTUBE_API_KEY')) return []

  const response = $http.send({
    url:
      YOUTUBE_SEARCH_API +
      '?part=snippet&type=video&maxResults=5&safeSearch=strict&videoEmbeddable=true&q=' +
      encodeURIComponent(query) +
      '&key=' +
      encodeURIComponent($secrets.get('YOUTUBE_API_KEY')),
    method: 'GET',
    timeout: 30,
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    console.log('counterbalance_engine: youtube search failed', response.statusCode, response.raw)
    return []
  }

  const body = response.json || {}
  const items = Array.isArray(body.items) ? body.items : []
  return items.map((item) => ({
    platform: 'youtube',
    title: item.snippet && item.snippet.title ? item.snippet.title : 'Video recomendado',
    description:
      item.snippet && item.snippet.description ? item.snippet.description : '',
    url:
      item.id && item.id.videoId
        ? 'https://www.youtube.com/watch?v=' + item.id.videoId
        : '',
    thumbnail:
      item.snippet && item.snippet.thumbnails && item.snippet.thumbnails.medium
        ? item.snippet.thumbnails.medium.url
        : '',
  }))
}

function fallbackCounterContent(topic) {
  return topic.counterKeywords.slice(0, 4).map((keyword, index) => ({
    platform: 'manual_curation',
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

  const contentSuggestions = contentHits.length ? contentHits : fallbackCounterContent(topic)
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
    contentSuggestions,
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

    const query = topic.counterKeywords.length ? topic.counterKeywords[0] : topic.name
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
      recommendation,
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
      const query = topic.counterKeywords.length ? topic.counterKeywords[0] : topic.name
      const contentSuggestions = searchYouTube(query)
      const recommendation = buildIntervention(
        topic,
        event.get('content_summary') || matched.matches.join(', '),
        event.get('platform'),
        contentSuggestions,
      )

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
