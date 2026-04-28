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

// ─── Groq direct client ──────────────────────────────────────────────────────

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_MODEL = 'llama-3.3-70b-versatile'
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined

function extractJson(raw: string, agentName: string): any {
  try {
    return JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error(`Resposta do ${agentName} não contém JSON válido.`)
    try {
      return JSON.parse(match[0])
    } catch {
      throw new Error(`Resposta do ${agentName} tem JSON malformado.`)
    }
  }
}

async function callGroq(systemPrompt: string, userMessage: string, jsonMode = true): Promise<string> {
  if (!GROQ_KEY) throw new Error('VITE_GROQ_API_KEY não configurada.')
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 2048,
      temperature: 0.5,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Groq API error ${res.status}: ${JSON.stringify(err)}`)
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

async function callGroqChat(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  if (!GROQ_KEY) throw new Error('VITE_GROQ_API_KEY não configurada.')
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Groq API error ${res.status}: ${JSON.stringify(err)}`)
  }
  const data = await res.json()
  return data?.choices?.[0]?.message?.content ?? ''
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

const ANALYSIS_PROMPT = `Você é o Agente de Análise do BekAI, plataforma educativa de literacia midiática e saúde digital infantojuvenil.

Analise os dados de comportamento digital e gere um perfil de risco estruturado.

REGRAS: Não faça diagnósticos médicos. Analise influências digitais e padrões comportamentais observáveis. Tom educativo, preventivo e empático. Responda em português brasileiro.

Retorne APENAS um JSON válido:
{
  "overallRisk": "Baixo",
  "overallScore": 65,
  "summary": "string com 2-3 frases",
  "scores": [{"dimension": "string", "score": 70, "label": "Alto", "description": "string"}],
  "primaryConcern": "string",
  "algorithmicProfile": "string"
}
Labels possíveis: "Baixo", "Moderado", "Alto", "Crítico". Gere entre 4 e 6 dimensões.`

const RESULT_PROMPT = `Você é o Agente de Resultado do BekAI, especializado em traduzir perfis de risco em insights acionáveis para pais.

REGRAS: Tom empático. Foco em soluções. Linguagem acessível. Nunca diagnosticar. Português brasileiro.

Retorne APENAS um JSON válido:
{
  "insights": [{"type": "danger", "title": "string", "description": "string"}],
  "safetyFlags": ["string"],
  "positiveOpportunities": ["string"],
  "curatorSuggestion": "string",
  "clinicalNote": "string"
}
Tipos: "danger", "warning", "positive". Gere pelo menos 3 insights variados.`

const ACTION_PLAN_PROMPT = `Você é o Agente de Plano de Ação do BekAI, especializado em criar planos operacionais práticos com base em literacia midiática.

PRINCÍPIOS: Substituição intencional, não bloqueio. Intervenções graduais. Linguagem prática. Português brasileiro.

Retorne APENAS um JSON válido:
{
  "planTitle": "string",
  "planSummary": "string",
  "steps": [{"title": "string", "description": "string", "frequency": "string", "duration": "string", "category": "parental", "priority": "alta"}],
  "weeklyGoal": "string",
  "expectedOutcome": "string"
}
Categorias: "parental", "digital", "offline", "professional". Prioridades: "alta", "média", "baixa". Gere 5 a 7 etapas.`

const CHAT_PROMPT = `Você é o Assistente BekAI, especializado em literacia midiática e saúde digital infantojuvenil. Ajude pais a interpretar relatórios, entender influências algorítmicas e encontrar estratégias de substituição intencional. Não oferece diagnósticos médicos. Tom empático, claro e construtivo. Máximo 200 palavras. Português brasileiro.`

// ─── API functions ─────────────────────────────────────────────────────────

async function tryPocketBase<T>(path: string, body: unknown): Promise<T> {
  return pb.send(path, { method: 'POST', body }) as Promise<T>
}

export async function generateRiskAnalysis(data: {
  childName: string
  childAge?: number
  platforms: string[]
  behaviors: string[]
  audioTranscript?: string
  additionalNotes?: string
}): Promise<AnalysisResult> {
  if (GROQ_KEY) {
    const userMsg = `Analise o perfil digital deste jovem e retorne apenas o JSON:

Nome: ${data.childName}
${data.childAge ? `Idade: ${data.childAge} anos` : ''}
Plataformas: ${data.platforms.join(', ')}
Comportamentos observados:
${data.behaviors.map((b) => `- ${b}`).join('\n')}
${data.audioTranscript ? `\nRelato em áudio: ${data.audioTranscript}` : ''}
${data.additionalNotes ? `\nObservações: ${data.additionalNotes}` : ''}`
    const raw = await callGroq(ANALYSIS_PROMPT, userMsg)
    return extractJson(raw, 'Agente de Análise') as AnalysisResult
  }
  return tryPocketBase('/backend/v1/ai/analysis', data)
}

export async function generateResultInsights(
  analysisResult: AnalysisResult,
  childName: string,
): Promise<ResultoInsights> {
  if (GROQ_KEY) {
    const a = analysisResult
    const userMsg = `Gere insights para os pais de ${childName}. Retorne apenas o JSON:

Risco Geral: ${a.overallRisk} (score: ${a.overallScore}/100)
Resumo: ${a.summary}
Principal Preocupação: ${a.primaryConcern}
Perfil Algorítmico: ${a.algorithmicProfile}
Dimensões:
${(a.scores || []).map((s) => `- ${s.dimension}: ${s.label} (${s.score}/100) - ${s.description}`).join('\n')}`
    const raw = await callGroq(RESULT_PROMPT, userMsg)
    return extractJson(raw, 'Agente de Resultado') as ResultoInsights
  }
  return tryPocketBase('/backend/v1/ai/result', { analysisResult, childName })
}

export async function generateActionPlan(
  analysisResult: AnalysisResult,
  childName: string,
  platforms: string[],
): Promise<ActionPlanResult> {
  if (GROQ_KEY) {
    const a = analysisResult
    const userMsg = `Crie um plano de ação para os pais de ${childName}. Retorne apenas o JSON:

Risco Geral: ${a.overallRisk} (score: ${a.overallScore}/100)
Principal Preocupação: ${a.primaryConcern}
Plataformas: ${platforms.join(', ')}
Perfil Algorítmico: ${a.algorithmicProfile}
Dimensões:
${(a.scores || []).map((s) => `- ${s.dimension}: ${s.label} - ${s.description}`).join('\n')}`
    const raw = await callGroq(ACTION_PLAN_PROMPT, userMsg)
    return extractJson(raw, 'Agente de Plano') as ActionPlanResult
  }
  return tryPocketBase('/backend/v1/ai/action-plan', { analysisResult, childName, platforms })
}

export async function chatWithAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context?: {
    childName?: string
    platforms?: string[]
    overallRisk?: string
  },
): Promise<string> {
  if (GROQ_KEY) {
    const ctx = context || {}
    const systemWithCtx = `${CHAT_PROMPT}\n\nCONTEXTO DO USUÁRIO:\n- Filho(a): ${ctx.childName || 'Não informado'}\n- Plataformas: ${(ctx.platforms || []).join(', ') || 'Não informado'}\n- Nível de risco: ${ctx.overallRisk || 'Ainda não analisado'}`
    return callGroqChat(systemWithCtx, messages)
  }
  const response = await tryPocketBase<{ reply: string }>('/backend/v1/ai/chat', { messages, context })
  return response.reply
}
