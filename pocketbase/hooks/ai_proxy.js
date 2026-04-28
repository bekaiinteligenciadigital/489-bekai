const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

const ANALYSIS_SYSTEM_PROMPT = `Voce e o Agente de Analise do Guardiao Digital Familiar, uma plataforma educativa e preventiva de literacia midiatica e saude digital infantojuvenil.

Sua funcao e analisar dados observaveis de comportamento digital de um jovem e gerar um perfil de risco estruturado para os responsaveis.

REGRAS CRITICAS:
- Nao faca diagnosticos medicos ou psicologicos
- Analise influencias digitais e padroes comportamentais observaveis
- Mantenha tom educativo, preventivo e empatico
- Recomende acompanhamento profissional quando necessario
- Responda em portugues brasileiro

Retorne apenas um JSON valido, sem texto extra, com esta estrutura:
{
  "overallRisk": "Baixo",
  "overallScore": 65,
  "summary": "string com 2-3 frases",
  "scores": [
    {
      "dimension": "Hiperestimulacao Algoritmica",
      "score": 70,
      "label": "Alto",
      "description": "string com 1 frase"
    }
  ],
  "primaryConcern": "string",
  "algorithmicProfile": "string"
}

Os labels e overallRisk possiveis sao: "Baixo", "Moderado", "Alto", "Critico".`

const RESULT_SYSTEM_PROMPT = `Voce e o Agente de Resultado do Guardiao Digital Familiar, especializado em traduzir perfis de risco em insights acionaveis para pais.

REGRAS:
- Tom empatico e construtivo
- Foco em solucoes e substituicao intencional de conteudo
- Linguagem acessivel para pais leigos
- Nunca diagnosticar condicoes medicas
- Responda em portugues brasileiro

Retorne apenas um JSON valido:
{
  "insights": [
    {"type": "danger", "title": "string", "description": "string"},
    {"type": "warning", "title": "string", "description": "string"},
    {"type": "positive", "title": "string", "description": "string"}
  ],
  "safetyFlags": ["string"],
  "positiveOpportunities": ["string"],
  "curatorSuggestion": "string",
  "clinicalNote": "string"
}

Os tipos possiveis sao: "danger", "warning", "positive". Gere pelo menos 3 insights variados.`

const ACTION_PLAN_SYSTEM_PROMPT = `Voce e o Agente de Plano de Acao do Guardiao Digital Familiar, especializado em criar planos operacionais praticos para pais com base em literacia midiatica infantojuvenil.

PRINCIPIOS:
- Foco em substituicao intencional, nao bloqueio
- Intervencoes graduais e respeitosas a autonomia do jovem
- Baseado em evidencias de desenvolvimento infantojuvenil
- Linguagem pratica e executavel
- Responda em portugues brasileiro

Retorne apenas um JSON valido:
{
  "planTitle": "string",
  "planSummary": "string",
  "steps": [
    {
      "title": "string",
      "description": "string",
      "frequency": "string",
      "duration": "string",
      "category": "parental",
      "priority": "alta"
    }
  ],
  "weeklyGoal": "string",
  "expectedOutcome": "string"
}

Categorias: "parental", "digital", "offline", "professional"
Prioridades: "alta", "media", "baixa"
Gere entre 5 e 7 etapas praticas ordenadas por prioridade.`

const CHAT_SYSTEM_PROMPT = `Voce e o Assistente Educacional do Guardiao Digital Familiar, especializado em literacia midiatica, saude digital infantojuvenil e curadoria parental.

Seu papel e ajudar pais a:
- Interpretar relatorios e metricas da plataforma
- Entender conceitos de influencia algoritmica e literacia midiatica
- Encontrar estrategias de substituicao intencional de conteudo
- Navegar pelas funcionalidades do Guardiao Digital

LIMITES:
- Nao oferece diagnosticos, tratamentos ou aconselhamento medico ou psicologico
- Se perguntado sobre questoes clinicas, redirecione para profissionais de saude
- Nao substitui psicologos ou psiquiatras

Tom: Empatico, claro, construtivo e acolhedor.
Idioma: Portugues brasileiro.
Comprimento: respostas concisas com no maximo 200 palavras.`

const NORMALIZED_RISK_LABELS = ['Baixo', 'Moderado', 'Alto', 'Critico']

function clamp(value, min, max) {
  const num = Number(value)
  if (Number.isNaN(num)) return min
  return Math.min(max, Math.max(min, num))
}

function scoreToRiskLabel(score) {
  const normalized = clamp(score, 0, 100)
  if (normalized >= 80) return 'Critico'
  if (normalized >= 60) return 'Alto'
  if (normalized >= 35) return 'Moderado'
  return 'Baixo'
}

function normalizeRiskLabel(label) {
  const value = String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  if (value === 'baixo') return 'Baixo'
  if (value === 'moderado') return 'Moderado'
  if (value === 'alto') return 'Alto'
  if (value === 'critico') return 'Critico'
  return null
}

function normalizeAnalysisResult(result) {
  const scores = Array.isArray(result && result.scores) ? result.scores : []
  const normalizedScores = scores.map((score, index) => {
    const numericScore = clamp(score && score.score, 0, 100)
    return {
      dimension:
        (score && score.dimension) || 'Dimensao ' + String(index + 1),
      score: numericScore,
      label: normalizeRiskLabel(score && score.label) || scoreToRiskLabel(numericScore),
      description: (score && score.description) || 'Sem descricao disponivel.',
    }
  })

  const overallScore = clamp(result && result.overallScore, 0, 100)

  return {
    overallRisk: normalizeRiskLabel(result && result.overallRisk) || scoreToRiskLabel(overallScore),
    overallScore,
    summary: (result && result.summary) || 'Analise concluida com base nos sinais informados.',
    scores: normalizedScores,
    primaryConcern: (result && result.primaryConcern) || 'Nenhum foco principal informado.',
    algorithmicProfile:
      (result && result.algorithmicProfile) ||
      'Perfil em consolidacao a partir dos padroes digitais observados.',
  }
}

function normalizeResultInsights(result) {
  const insights = Array.isArray(result && result.insights) ? result.insights : []
  const normalizedInsights = insights
    .filter((item) => item && item.title && item.description)
    .map((item) => ({
      type: ['danger', 'warning', 'positive'].includes(item.type) ? item.type : 'warning',
      title: String(item.title),
      description: String(item.description),
    }))

  return {
    insights: normalizedInsights,
    safetyFlags: Array.isArray(result && result.safetyFlags) ? result.safetyFlags : [],
    positiveOpportunities: Array.isArray(result && result.positiveOpportunities)
      ? result.positiveOpportunities
      : [],
    curatorSuggestion:
      (result && result.curatorSuggestion) ||
      'Introduza conteudos educativos e pausas digitais em momentos previsiveis da rotina.',
    clinicalNote:
      (result && result.clinicalNote) ||
      'Persistindo sinais de sofrimento, procure avaliacao com profissional de saude.',
  }
}

function normalizeActionPlan(result) {
  const steps = Array.isArray(result && result.steps) ? result.steps : []
  return {
    planTitle: (result && result.planTitle) || 'Plano inicial de reorganizacao digital',
    planSummary:
      (result && result.planSummary) ||
      'Plano estruturado para reduzir friccoes digitais e fortalecer protecoes familiares.',
    steps: steps
      .filter((step) => step && step.title && step.description)
      .map((step) => ({
        title: String(step.title),
        description: String(step.description),
        frequency: String(step.frequency || 'Diariamente'),
        duration: String(step.duration || '2 semanas'),
        category: ['parental', 'digital', 'offline', 'professional'].includes(step.category)
          ? step.category
          : 'parental',
        priority: ['alta', 'media', 'baixa'].includes(step.priority) ? step.priority : 'media',
      })),
    weeklyGoal:
      (result && result.weeklyGoal) ||
      'Criar previsibilidade no uso de telas e reduzir exposicao impulsiva.',
    expectedOutcome:
      (result && result.expectedOutcome) ||
      'Melhor equilibrio entre consumo digital, descanso e convivio familiar.',
  }
}

function heuristicSignals(payload) {
  const platforms = Array.isArray(payload && payload.platforms) ? payload.platforms : []
  const behaviors = Array.isArray(payload && payload.behaviors) ? payload.behaviors : []
  const joined = platforms.concat(behaviors).join(' ').toLowerCase()

  let stimulation = 28
  let social = 20
  let sleep = 18
  let protection = 32

  if (/tiktok|reels|shorts|feed/.test(joined)) stimulation += 24
  if (/youtube|discord|whatsapp|instagram/.test(joined)) social += 18
  if (/madrugada|noite|sono|late|tarde da noite/.test(joined)) sleep += 30
  if (/isolamento|ansiedade|irrita|agress|impuls|compuls/.test(joined)) {
    stimulation += 12
    social += 10
  }
  if (/familia|rotina|esporte|leitura|pausa|curadoria|supervis/.test(joined)) {
    protection += 18
  }

  stimulation = clamp(stimulation, 0, 100)
  social = clamp(social, 0, 100)
  sleep = clamp(sleep, 0, 100)
  protection = clamp(protection, 0, 100)

  const overallScore = clamp(Math.round((stimulation + social + sleep + (100 - protection)) / 4), 0, 100)

  return {
    overallScore,
    scores: [
      {
        dimension: 'Hiperestimulacao Algoritmica',
        score: stimulation,
        label: scoreToRiskLabel(stimulation),
        description: 'Avalia intensidade de estimulos rapidos, scroll e consumo repetitivo.',
      },
      {
        dimension: 'Pressao Social Digital',
        score: social,
        label: scoreToRiskLabel(social),
        description: 'Considera gatilhos de comparacao, resposta social e permanencia em grupos.',
      },
      {
        dimension: 'Impacto no Ritmo e Sono',
        score: sleep,
        label: scoreToRiskLabel(sleep),
        description: 'Observa risco de uso em horarios de descanso e perda de recuperacao emocional.',
      },
      {
        dimension: 'Fatores de Protecao Familiar',
        score: 100 - protection,
        label: scoreToRiskLabel(100 - protection),
        description: 'Mede ausencia de rotina, supervisao e repertorio offline protetivo.',
      },
    ],
  }
}

function buildFallbackAnalysis(body) {
  const signal = heuristicSignals(body)
  const overallRisk = scoreToRiskLabel(signal.overallScore)
  const childName = body && body.childName ? body.childName : 'jovem'

  return normalizeAnalysisResult({
    overallRisk,
    overallScore: signal.overallScore,
    summary:
      'Analise local concluida para ' +
      childName +
      '. Foram identificados sinais de exposicao digital que pedem ajuste gradual de rotina, curadoria e acompanhamento familiar.',
    scores: signal.scores,
    primaryConcern:
      overallRisk === 'Baixo'
        ? 'Manter constancia de supervisao e rotinas digitais saudaveis.'
        : 'Reduzir ciclos de consumo impulsivo e reorganizar horarios, contexto e repertorio digital.',
    algorithmicProfile:
      'Perfil com reforco de recomendacoes automatizadas influenciado pelas plataformas informadas e pelos comportamentos relatados.',
  })
}

function buildFallbackResultInsights(analysis, childName) {
  const normalized = normalizeAnalysisResult(analysis)
  const highScores = normalized.scores.filter((item) => item.score >= 60)
  const topConcern = highScores.length ? highScores[0].dimension : 'Equilibrio geral de rotina'

  return normalizeResultInsights({
    insights: [
      {
        type: normalized.overallScore >= 75 ? 'danger' : 'warning',
        title: 'Sinal prioritario: ' + topConcern,
        description:
          'Os dados sugerem necessidade de intervencao organizada para ' +
          childName +
          ', com foco em previsibilidade e reducao de gatilhos digitais.',
      },
      {
        type: 'warning',
        title: 'Ajuste ambiental pode gerar ganho rapido',
        description:
          'Mudancas em horario, contexto de uso e substituicao de conteudo costumam reduzir atrito sem depender apenas de bloqueio.',
      },
      {
        type: 'positive',
        title: 'Ha espaco para reequilibrio progressivo',
        description:
          'Com supervisao consistente e repertorio alternativo, o algoritmo tende a responder melhor ao novo padrao de interacao.',
      },
    ],
    safetyFlags:
      normalized.overallScore >= 80
        ? ['Uso com alta intensidade e potencial de escalada emocional.']
        : ['Monitorar sinais de irritabilidade, privacao de sono e isolamento.'],
    positiveOpportunities: [
      'Introduzir consumo guiado de conteudos educativos e interesses do jovem.',
      'Criar janelas sem tela em transicoes importantes da rotina.',
    ],
    curatorSuggestion:
      'Favoreca conteudos de aprendizagem, esporte, ciencia ou criadores de rotina saudavel alinhados ao interesse do jovem.',
    clinicalNote:
      'Se surgirem prejuizos persistentes de humor, sono ou convivio, vale buscar avaliacao profissional complementar.',
  })
}

function buildFallbackActionPlan(analysis, childName, platforms) {
  const normalized = normalizeAnalysisResult(analysis)
  const platformLabel = Array.isArray(platforms) && platforms.length ? platforms.join(', ') : 'as plataformas em uso'

  return normalizeActionPlan({
    planTitle: 'Plano inicial para ' + childName,
    planSummary:
      'Plano pratico para reorganizar a rotina digital e reduzir sobrecarga ligada a ' + platformLabel + '.',
    steps: [
      {
        title: 'Definir janela de uso previsivel',
        description: 'Estabeleca horarios claros para acesso e momentos sem tela nas transicoes do dia.',
        frequency: 'Diariamente',
        duration: '7 dias',
        category: 'parental',
        priority: 'alta',
      },
      {
        title: 'Trocar estimulos de alta intensidade',
        description: 'Substitua parte do feed rapido por conteudos mais longos, educativos ou ligados a interesses positivos.',
        frequency: '5x por semana',
        duration: '2 semanas',
        category: 'digital',
        priority: 'alta',
      },
      {
        title: 'Criar rotina offline de protecao',
        description: 'Inclua atividade fisica, leitura, conversa ou hobby em horario que antes era dominado por tela.',
        frequency: 'Diariamente',
        duration: '2 semanas',
        category: 'offline',
        priority: 'media',
      },
      {
        title: 'Revisar sinais de progresso em familia',
        description: 'Conversem sobre irritabilidade, sono, foco e convivio para ajustar a estrategia com base no que mudou.',
        frequency: 'Semanalmente',
        duration: '4 semanas',
        category: 'parental',
        priority: normalized.overallScore >= 70 ? 'alta' : 'media',
      },
      {
        title: 'Escalar para apoio especializado se necessario',
        description: 'Se os sinais persistirem ou se intensificarem, leve os registros para um profissional de saude ou educacao.',
        frequency: 'Conforme necessidade',
        duration: '30 dias',
        category: 'professional',
        priority: normalized.overallScore >= 80 ? 'alta' : 'baixa',
      },
    ],
    weeklyGoal: 'Reduzir o uso impulsivo e aumentar momentos de consumo mais intencional.',
    expectedOutcome:
      'Melhora de previsibilidade na rotina, menor friccao emocional e maior capacidade de curadoria familiar.',
  })
}

function buildFallbackChat(messages, context) {
  const conversation = Array.isArray(messages) ? messages : []
  const latest = conversation.length ? conversation[conversation.length - 1].content || '' : ''
  const lower = String(latest).toLowerCase()
  const childName = context && context.childName ? context.childName : 'o jovem'
  const overallRisk = context && context.overallRisk ? context.overallRisk : 'nao informado'
  const platforms =
    context && Array.isArray(context.platforms) && context.platforms.length
      ? context.platforms.join(', ')
      : 'plataformas nao informadas'

  if (lower.includes('score') || lower.includes('risco')) {
    return (
      'O score resume intensidade de exposicao, contexto de uso e fatores de protecao. ' +
      'Hoje o risco de ' +
      childName +
      ' esta em ' +
      overallRisk +
      '. O mais importante nao e o numero isolado, e sim quais dimensoes puxaram esse resultado e o que pode ser ajustado na rotina.'
    )
  }

  if (lower.includes('plano') || lower.includes('acao')) {
    return (
      'O plano de acao deve priorizar tres frentes: previsibilidade de horario, substituicao intencional de conteudo e reforco de rotina offline. ' +
      'Para ' +
      childName +
      ', vale observar especialmente o uso em ' +
      platforms +
      ' e revisar a estrategia semanalmente.'
    )
  }

  if (lower.includes('algoritmo') || lower.includes('feed') || lower.includes('curadoria')) {
    return (
      'Quando a familia muda padrao de interacao, o algoritmo costuma reagir. ' +
      'A melhor estrategia e reduzir cliques impulsivos e aumentar sinais claros de interesse em conteudos mais saudaveis, consistentes com o objetivo educativo.'
    )
  }

  return (
    'Posso te ajudar a interpretar risco, rotina, curadoria e proximo passo pratico. ' +
    'No caso de ' +
    childName +
    ', eu comecaria revendo horarios de uso, tipo de conteudo consumido e fatores de protecao familiar. ' +
    'Se quiser, me pergunte sobre score, plano de acao ou como rebalancear o feed.'
  )
}

function extractJson(raw, agentName) {
  try {
    return JSON.parse(raw)
  } catch (_) {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) {
      throw new BadRequestError('Resposta do ' + agentName + ' nao contem JSON valido.')
    }

    try {
      return JSON.parse(match[0])
    } catch (_) {
      throw new BadRequestError('Resposta do ' + agentName + ' tem JSON malformado.')
    }
  }
}

function postToGroq(body) {
  if (!$secrets.has('GROQ_API_KEY')) {
    throw new Error('GROQ_API_KEY_MISSING')
  }

  const response = $http.send({
    url: GROQ_API_URL,
    method: 'POST',
    timeout: 30,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + $secrets.get('GROQ_API_KEY'),
    },
    body: JSON.stringify(body),
  })

  if (response.statusCode < 200 || response.statusCode >= 300) {
    const details = response.raw || response.body || response.json || {}
    throw new Error('GROQ_REQUEST_FAILED: ' + JSON.stringify(details))
  }

  const responseJson = response.json || {}
  const choices = Array.isArray(responseJson.choices) ? responseJson.choices : []
  const firstChoice = choices.length ? choices[0] : null
  const message = firstChoice && firstChoice.message ? firstChoice.message : null
  return message && message.content ? message.content : ''
}

function callGroq(systemPrompt, userMessage, opts) {
  const body = {
    model: MODEL,
    max_tokens: (opts && opts.maxTokens) || 2048,
    temperature: (opts && opts.temperature) || 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  }

  if (opts && opts.jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  return postToGroq(body)
}

function callGroqWithHistory(systemPrompt, messages, opts) {
  const body = {
    model: MODEL,
    max_tokens: (opts && opts.maxTokens) || 1024,
    temperature: (opts && opts.temperature) || 0.7,
    messages: [{ role: 'system', content: systemPrompt }].concat(messages || []),
  }

  if (opts && opts.jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  return postToGroq(body)
}

function withAgentFallback(runPrimary, runFallback) {
  try {
    return runPrimary()
  } catch (err) {
    console.log('ai_proxy fallback activated:', err && err.message ? err.message : err)
    return runFallback()
  }
}

routerAdd(
  'POST',
  '/backend/v1/ai/{agent}',
  (e) => {
    const agent = e.request.pathValue('agent')
    const body = e.requestInfo().body || {}

    if (agent === 'analysis') {
      if (!body.childName || !Array.isArray(body.platforms) || !Array.isArray(body.behaviors)) {
        throw new BadRequestError('childName, platforms e behaviors sao obrigatorios.')
      }

      const userMessage = `Analise o perfil digital deste jovem e retorne apenas o JSON:

Nome: ${body.childName}
${body.childAge ? `Idade: ${body.childAge} anos` : ''}
Plataformas: ${body.platforms.join(', ')}
Comportamentos observados:
${body.behaviors.map((item) => `- ${item}`).join('\n')}
${body.audioTranscript ? `\nRelato em audio: ${body.audioTranscript}` : ''}
${body.additionalNotes ? `\nObservacoes: ${body.additionalNotes}` : ''}`

      return e.json(
        200,
        withAgentFallback(
          () => {
            const raw = callGroq(ANALYSIS_SYSTEM_PROMPT, userMessage, {
              jsonMode: true,
              temperature: 0.4,
              maxTokens: 2048,
            })

            return normalizeAnalysisResult(extractJson(raw, 'Agente de Analise'))
          },
          () => buildFallbackAnalysis(body),
        ),
      )
    }

    if (agent === 'result') {
      if (!body.analysisResult || !body.childName) {
        throw new BadRequestError('analysisResult e childName sao obrigatorios.')
      }

      const analysis = body.analysisResult
      const userMessage = `Gere insights para os pais de ${body.childName}. Retorne apenas o JSON:

Risco Geral: ${analysis.overallRisk} (score: ${analysis.overallScore}/100)
Resumo: ${analysis.summary}
Principal Preocupacao: ${analysis.primaryConcern}
Perfil Algoritmico: ${analysis.algorithmicProfile}
Dimensoes:
${(analysis.scores || []).map((item) => `- ${item.dimension}: ${item.label} (${item.score}/100) - ${item.description}`).join('\n')}`

      return e.json(
        200,
        withAgentFallback(
          () => {
            const raw = callGroq(RESULT_SYSTEM_PROMPT, userMessage, {
              jsonMode: true,
              temperature: 0.5,
              maxTokens: 2048,
            })

            return normalizeResultInsights(extractJson(raw, 'Agente de Resultado'))
          },
          () => buildFallbackResultInsights(analysis, body.childName),
        ),
      )
    }

    if (agent === 'action-plan') {
      if (!body.analysisResult || !body.childName || !Array.isArray(body.platforms)) {
        throw new BadRequestError('analysisResult, childName e platforms sao obrigatorios.')
      }

      const analysis = body.analysisResult
      const userMessage = `Crie um plano de acao para os pais de ${body.childName}. Retorne apenas o JSON:

Risco Geral: ${analysis.overallRisk} (score: ${analysis.overallScore}/100)
Principal Preocupacao: ${analysis.primaryConcern}
Plataformas: ${body.platforms.join(', ')}
Perfil Algoritmico: ${analysis.algorithmicProfile}
Dimensoes:
${(analysis.scores || []).map((item) => `- ${item.dimension}: ${item.label} - ${item.description}`).join('\n')}`

      return e.json(
        200,
        withAgentFallback(
          () => {
            const raw = callGroq(ACTION_PLAN_SYSTEM_PROMPT, userMessage, {
              jsonMode: true,
              temperature: 0.5,
              maxTokens: 2048,
            })

            return normalizeActionPlan(extractJson(raw, 'Agente de Plano de Acao'))
          },
          () => buildFallbackActionPlan(analysis, body.childName, body.platforms),
        ),
      )
    }

    if (agent === 'chat') {
      if (!Array.isArray(body.messages) || body.messages.length === 0) {
        throw new BadRequestError('messages e obrigatorio.')
      }

      const context = body.context || {}
      const contextBlock = `\n\nCONTEXTO DO USUARIO:
- Filho(a): ${context.childName || 'Nao informado'}
- Plataformas monitoradas: ${(context.platforms || []).join(', ') || 'Nao informado'}
- Nivel de risco atual: ${context.overallRisk || 'Ainda nao analisado'}`

      return e.json(
        200,
        withAgentFallback(
          () => {
            const reply = callGroqWithHistory(CHAT_SYSTEM_PROMPT + contextBlock, body.messages, {
              temperature: 0.7,
              maxTokens: 1024,
            })

            return { reply }
          },
          () => ({ reply: buildFallbackChat(body.messages, context) }),
        ),
      )
    }

    throw new NotFoundError('Agente de IA nao encontrado.')
  },
)
