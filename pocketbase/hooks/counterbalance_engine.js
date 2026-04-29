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

  return {
    harmfulTopic: topic.slug,
    severity: topic.severity,
    urgency,
    triggerText,
    platform,
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
    contentSuggestions: contentHits.length ? contentHits : fallbackCounterContent(topic),
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

    if (!authRecord) throw new ForbiddenError('Autenticacao obrigatoria.')
    if (child.get('parent') !== authRecord.id && child.get('assigned_professional') !== authRecord.id) {
      throw new ForbiddenError('Sem permissao para este jovem.')
    }

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
