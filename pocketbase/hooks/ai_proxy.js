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
    throw new BadRequestError(
      'A IA ainda nao foi configurada no servidor. Defina o segredo GROQ_API_KEY no PocketBase.',
    )
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
    throw new BadRequestError(
      'Falha ao comunicar com o provedor de IA. ' + JSON.stringify(details),
    )
  }

  return response.json?.choices?.[0]?.message?.content || ''
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

      const raw = callGroq(ANALYSIS_SYSTEM_PROMPT, userMessage, {
        jsonMode: true,
        temperature: 0.4,
        maxTokens: 2048,
      })

      return e.json(200, extractJson(raw, 'Agente de Analise'))
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

      const raw = callGroq(RESULT_SYSTEM_PROMPT, userMessage, {
        jsonMode: true,
        temperature: 0.5,
        maxTokens: 2048,
      })

      return e.json(200, extractJson(raw, 'Agente de Resultado'))
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

      const raw = callGroq(ACTION_PLAN_SYSTEM_PROMPT, userMessage, {
        jsonMode: true,
        temperature: 0.5,
        maxTokens: 2048,
      })

      return e.json(200, extractJson(raw, 'Agente de Plano de Acao'))
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

      const reply = callGroqWithHistory(CHAT_SYSTEM_PROMPT + contextBlock, body.messages, {
        temperature: 0.7,
        maxTokens: 1024,
      })

      return e.json(200, { reply })
    }

    throw new NotFoundError('Agente de IA nao encontrado.')
  },
  $apis.requireAuth(),
)
