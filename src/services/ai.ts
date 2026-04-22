import pb from '@/lib/pocketbase/client'

export interface RiskScore {
  dimension: string
  score: number
  label: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico'
  description: string
}

export interface AnalysisResult {
  overallRisk: 'Baixo' | 'Moderado' | 'Alto' | 'Crítico'
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
  priority: 'alta' | 'média' | 'baixa'
}

export interface ActionPlanResult {
  planTitle: string
  planSummary: string
  steps: ActionStep[]
  weeklyGoal: string
  expectedOutcome: string
}

export async function generateRiskAnalysis(data: {
  childName: string
  childAge?: number
  platforms: string[]
  behaviors: string[]
  audioTranscript?: string
  additionalNotes?: string
}): Promise<AnalysisResult> {
  return pb.send('/backend/v1/ai/analysis', {
    method: 'POST',
    body: data,
  })
}

export async function generateResultInsights(
  analysisResult: AnalysisResult,
  childName: string,
): Promise<ResultoInsights> {
  return pb.send('/backend/v1/ai/result', {
    method: 'POST',
    body: { analysisResult, childName },
  })
}

export async function generateActionPlan(
  analysisResult: AnalysisResult,
  childName: string,
  platforms: string[],
): Promise<ActionPlanResult> {
  return pb.send('/backend/v1/ai/action-plan', {
    method: 'POST',
    body: { analysisResult, childName, platforms },
  })
}

export async function chatWithAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context?: {
    childName?: string
    platforms?: string[]
    overallRisk?: string
  },
): Promise<string> {
  const response = await pb.send('/backend/v1/ai/chat', {
    method: 'POST',
    body: { messages, context },
  })

  return response.reply
}
