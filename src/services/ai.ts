import pb from '@/lib/pocketbase/client'

type RiskLabel = 'Baixo' | 'Moderado' | 'Alto' | 'Critico' | 'Crítico'
type PriorityLabel = 'alta' | 'media' | 'média' | 'baixa'

export interface RiskScore {
  dimension: string
  score: number
  label: RiskLabel
  description: string
}

export interface AnalysisResult {
  overallRisk: RiskLabel
  overallScore: number
  summary: string
  scores: RiskScore[]
  primaryConcern: string
  algorithmicProfile: string
}

export interface InsightItem {
  type: 'danger' | 'warning' | 'positive'
  title: string
  description: string
}

export interface ResultoInsights {
  insights: InsightItem[]
  safetyFlags: string[]
  positiveOpportunities: string[]
  curatorSuggestion: string
  clinicalNote: string
}

export interface ActionStep {
  title: string
  description: string
  frequency: string
  duration: string
  category: 'parental' | 'digital' | 'offline' | 'professional'
  priority: PriorityLabel
}

export interface ActionPlanResult {
  planTitle: string
  planSummary: string
  steps: ActionStep[]
  weeklyGoal: string
  expectedOutcome: string
}

function normalizeText(value: unknown) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function normalizeRiskLabel(label: unknown): RiskLabel {
  const value = normalizeText(label)

  if (value === 'baixo') return 'Baixo'
  if (value === 'moderado') return 'Moderado'
  if (value === 'alto') return 'Alto'
  return 'Critico'
}

function normalizePriority(priority: unknown): PriorityLabel {
  const value = normalizeText(priority)
  if (value === 'alta') return 'alta'
  if (value === 'baixa') return 'baixa'
  return 'media'
}

function normalizeAnalysisResult(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    overallRisk: normalizeRiskLabel(result.overallRisk),
    scores: Array.isArray(result.scores)
      ? result.scores.map((score) => ({
          ...score,
          label: normalizeRiskLabel(score.label),
        }))
      : [],
  }
}

function normalizeActionPlan(result: ActionPlanResult): ActionPlanResult {
  return {
    ...result,
    steps: Array.isArray(result.steps)
      ? result.steps.map((step) => ({
          ...step,
          priority: normalizePriority(step.priority),
        }))
      : [],
  }
}

function clamp(value: unknown, min: number, max: number) {
  const num = Number(value)
  if (Number.isNaN(num)) return min
  return Math.min(max, Math.max(min, num))
}

function scoreToRiskLabel(score: number): RiskLabel {
  const normalized = clamp(score, 0, 100)
  if (normalized >= 80) return 'Critico'
  if (normalized >= 60) return 'Alto'
  if (normalized >= 35) return 'Moderado'
  return 'Baixo'
}

function hasMeaningfulInsights(result: unknown) {
  return Array.isArray((result as any)?.insights) && (result as any).insights.length > 0
}

function hasMeaningfulPlan(result: unknown) {
  return Array.isArray((result as any)?.steps) && (result as any).steps.length > 0
}

function shouldUseFallback(error: unknown) {
  const status = Number((error as any)?.status || (error as any)?.response?.status || 0)
  const message = normalizeText(getErrorMessage(error, ''))

  return (
    status === 0 ||
    status === 404 ||
    status === 500 ||
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status >= 502 ||
    message.includes('failed to fetch') ||
    message.includes('request resource was not found') ||
    message.includes('resource wasn\'t found') ||
    message.includes('connection refused') ||
    message.includes('something went wrong') ||
    message.includes('bad request') ||
    message.includes('json malformado') ||
    message.includes('nao contem json valido') ||
    message.includes('grok_api_key_missing') ||
    message.includes('groq_api_key_missing') ||
    message.includes('groq_request_failed')
  )
}

function buildSignalSummary(platforms: string[], behaviors: string[]) {
  const joined = platforms.concat(behaviors).join(' ').toLowerCase()

  let stimulation = 28
  let social = 22
  let sleep = 18
  let protection = 34

  if (/tiktok|reels|shorts|feed/.test(joined)) stimulation += 24
  if (/youtube|discord|whatsapp|instagram/.test(joined)) social += 16
  if (/noite|madrugada|sono|tarde da noite/.test(joined)) sleep += 30
  if (/ansiedade|irrita|isolamento|agress|compuls|impuls/.test(joined)) {
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

  const overallScore = clamp(
    Math.round((stimulation + social + sleep + (100 - protection)) / 4),
    0,
    100,
  )

  return {
    overallScore,
    scores: [
      {
        dimension: 'Hiperestimulacao Algoritmica',
        score: stimulation,
        label: scoreToRiskLabel(stimulation),
        description: 'Mede intensidade de consumo rapido, scroll e reforco de estimulos curtos.',
      },
      {
        dimension: 'Pressao Social Digital',
        score: social,
        label: scoreToRiskLabel(social),
        description: 'Observa comparacao social, resposta constante e permanencia em grupos.',
      },
      {
        dimension: 'Impacto no Ritmo e Sono',
        score: sleep,
        label: scoreToRiskLabel(sleep),
        description: 'Sinaliza risco de uso em horarios de descanso e perda de recuperacao emocional.',
      },
      {
        dimension: 'Fatores de Protecao Familiar',
        score: 100 - protection,
        label: scoreToRiskLabel(100 - protection),
        description: 'Avalia ausencia de rotina, supervisao e repertorio offline protetivo.',
      },
    ] as RiskScore[],
  }
}

function buildLocalAnalysis(data: {
  childName: string
  childAge?: number
  platforms: string[]
  behaviors: string[]
  audioTranscript?: string
  additionalNotes?: string
}): AnalysisResult {
  const signal = buildSignalSummary(data.platforms, data.behaviors)
  const overallRisk = scoreToRiskLabel(signal.overallScore)

  return normalizeAnalysisResult({
    overallRisk,
    overallScore: signal.overallScore,
    summary:
      'Analise local concluida para ' +
      data.childName +
      '. Foram identificados sinais de exposicao digital que pedem ajuste gradual de rotina, curadoria e acompanhamento familiar.',
    scores: signal.scores,
    primaryConcern:
      overallRisk === 'Baixo'
        ? 'Manter supervisao e rotina digital saudavel com constancia.'
        : 'Reduzir consumo impulsivo e reorganizar horarios, contexto e repertorio digital.',
    algorithmicProfile:
      'Perfil estimado a partir das plataformas e comportamentos informados, com reforco de recomendacoes automatizadas.',
  })
}

function buildLocalInsights(analysisResult: AnalysisResult, childName: string): ResultoInsights {
  const normalized = normalizeAnalysisResult(analysisResult)
  const topScore = normalized.scores.slice().sort((a, b) => b.score - a.score)[0]

  return {
    insights: [
      {
        type: normalized.overallScore >= 75 ? 'danger' : 'warning',
        title: 'Sinal prioritario: ' + (topScore?.dimension || 'Rotina digital'),
        description:
          'Os dados indicam necessidade de intervencao organizada para ' +
          childName +
          ', com foco em previsibilidade, curadoria e reducao de gatilhos digitais.',
      },
      {
        type: 'warning',
        title: 'Mudancas ambientais tendem a ajudar rapido',
        description:
          'Ajustar horario, contexto de uso e tipo de conteudo costuma reduzir atrito sem depender apenas de bloqueio.',
      },
      {
        type: 'positive',
        title: 'Ha espaco para reequilibrio progressivo',
        description:
          'Com constancia familiar e substituicao intencional, o algoritmo tende a responder melhor ao novo padrao.',
      },
    ],
    safetyFlags:
      normalized.overallScore >= 80
        ? ['Alta intensidade de uso com potencial de escalada emocional.']
        : ['Monitorar sono, irritabilidade e isolamento ao longo da semana.'],
    positiveOpportunities: [
      'Introduzir conteudos educativos e de interesse positivo do jovem.',
      'Criar janelas sem tela em transicoes importantes da rotina.',
    ],
    curatorSuggestion:
      'Priorize criadores de ciencia, esporte, rotina saudavel ou aprendizagem alinhados ao interesse do jovem.',
    clinicalNote:
      'Se surgirem prejuizos persistentes de humor, sono ou convivio, vale buscar avaliacao profissional complementar.',
  }
}

function buildLocalActionPlan(
  analysisResult: AnalysisResult,
  childName: string,
  platforms: string[],
): ActionPlanResult {
  const normalized = normalizeAnalysisResult(analysisResult)
  const platformLabel = platforms.length ? platforms.join(', ') : 'as plataformas em uso'

  return normalizeActionPlan({
    planTitle: 'Plano inicial para ' + childName,
    planSummary:
      'Plano pratico para reorganizar a rotina digital e reduzir sobrecarga ligada a ' +
      platformLabel +
      '.',
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
        title: 'Revisar progresso em familia',
        description: 'Conversem sobre sono, humor, foco e convivencia para ajustar a estrategia com base no que mudou.',
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
    weeklyGoal: 'Reduzir o uso impulsivo e ampliar momentos de consumo mais intencional.',
    expectedOutcome:
      'Melhora de previsibilidade na rotina, menor friccao emocional e maior capacidade de curadoria familiar.',
  })
}

function buildLocalChatReply(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context?: {
    childName?: string
    platforms?: string[]
    overallRisk?: string
  },
) {
  const latest = messages.length ? String(messages[messages.length - 1].content || '') : ''
  const lower = latest.toLowerCase()
  const childName = context?.childName || 'o jovem'
  const overallRisk = context?.overallRisk || 'nao informado'
  const platforms = context?.platforms?.length ? context.platforms.join(', ') : 'plataformas nao informadas'

  if (lower.includes('score') || lower.includes('risco')) {
    return (
      'O score resume intensidade de exposicao, contexto de uso e fatores de protecao. ' +
      'Hoje o risco de ' +
      childName +
      ' esta em ' +
      overallRisk +
      '. O principal e entender quais dimensoes puxaram esse resultado e ajustar a rotina com constancia.'
    )
  }

  if (lower.includes('plano') || lower.includes('acao')) {
    return (
      'O plano de acao deve priorizar previsibilidade de horario, substituicao intencional de conteudo e reforco de rotina offline. ' +
      'Para ' +
      childName +
      ', vale observar especialmente o uso em ' +
      platforms +
      ' e revisar a estrategia semanalmente.'
    )
  }

  return (
    'Posso te ajudar a interpretar risco, rotina, curadoria e proximo passo pratico. ' +
    'No caso de ' +
    childName +
    ', eu comecaria revendo horarios de uso, tipo de conteudo consumido e fatores de protecao familiar.'
  )
}

function getErrorMessage(error: unknown, fallback: string) {
  const message =
    (error as any)?.response?.message ||
    (error as any)?.data?.message ||
    (error as any)?.message ||
    ''

  return String(message).trim() || fallback
}

export async function generateRiskAnalysis(data: {
  childName: string
  childAge?: number
  platforms: string[]
  behaviors: string[]
  audioTranscript?: string
  additionalNotes?: string
}): Promise<AnalysisResult> {
  try {
    const response = await pb.send('/backend/v1/ai/analysis', {
      method: 'POST',
      body: data,
    })

    return normalizeAnalysisResult(response as AnalysisResult)
  } catch (error) {
    if (shouldUseFallback(error)) {
      return buildLocalAnalysis(data)
    }
    throw new Error(getErrorMessage(error, 'Erro ao gerar a analise de risco.'))
  }
}

export async function generateResultInsights(
  analysisResult: AnalysisResult,
  childName: string,
): Promise<ResultoInsights> {
  try {
    const response = await pb.send('/backend/v1/ai/result', {
      method: 'POST',
      body: { analysisResult, childName },
    })

    const normalized = response as ResultoInsights
    if (!hasMeaningfulInsights(normalized)) {
      return buildLocalInsights(analysisResult, childName)
    }

    return normalized
  } catch (error) {
    return buildLocalInsights(analysisResult, childName)
  }
}

export async function generateActionPlan(
  analysisResult: AnalysisResult,
  childName: string,
  platforms: string[],
): Promise<ActionPlanResult> {
  try {
    const response = await pb.send('/backend/v1/ai/action-plan', {
      method: 'POST',
      body: { analysisResult, childName, platforms },
    })

    const normalized = normalizeActionPlan(response as ActionPlanResult)
    if (!hasMeaningfulPlan(normalized)) {
      return buildLocalActionPlan(analysisResult, childName, platforms)
    }

    return normalized
  } catch (error) {
    return buildLocalActionPlan(analysisResult, childName, platforms)
  }
}

export async function chatWithAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context?: {
    childName?: string
    platforms?: string[]
    overallRisk?: string
  },
): Promise<string> {
  try {
    const response = await pb.send('/backend/v1/ai/chat', {
      method: 'POST',
      body: { messages, context },
    })

    if (!response || typeof response.reply !== 'string' || !response.reply.trim()) {
      return buildLocalChatReply(messages, context)
    }

    return response.reply
  } catch (error) {
    return buildLocalChatReply(messages, context)
  }
}
