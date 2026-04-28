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
    throw new Error(getErrorMessage(error, 'Erro ao gerar a analise de risco.'))
  }
}

export async function generateResultInsights(
  analysisResult: AnalysisResult,
  childName: string,
): Promise<ResultoInsights> {
  try {
    return await pb.send('/backend/v1/ai/result', {
      method: 'POST',
      body: { analysisResult, childName },
    })
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Erro ao gerar os insights do agente.'))
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

    return normalizeActionPlan(response as ActionPlanResult)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Erro ao gerar o plano de acao.'))
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

    return response.reply
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Erro ao conversar com o assistente.'))
  }
}
