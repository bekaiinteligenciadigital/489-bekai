/**
 * Serviço Central de IA — Guardião Digital Familiar
 * Provider: Groq (gratuito) — llama-3.3-70b-versatile
 * Integra os 4 Agentes:
 *   1. Agente de Análise
 *   2. Agente de Resultado
 *   3. Agente de Plano de Ação
 *   4. Assistente Educacional (Chat)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const API_KEY = import.meta.env.VITE_GROQ_API_KEY as string

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      'VITE_GROQ_API_KEY não encontrada. Adicione a chave no arquivo .env do projeto.',
    )
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Erro na API Groq: ${response.status} — ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function callGroqWithHistory(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[],
): Promise<string> {
  if (!API_KEY) {
    throw new Error(
      'VITE_GROQ_API_KEY não encontrada. Adicione a chave no arquivo .env do projeto.',
    )
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Erro na API Groq: ${response.status} — ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// ─────────────────────────────────────────────
// Tipos de retorno dos Agentes
// ─────────────────────────────────────────────

export interface RiskScore {
  dimension: string
  score: number // 0–100
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

// ─────────────────────────────────────────────
// AGENTE 1 — Análise de Influência Digital
// ─────────────────────────────────────────────

const ANALYSIS_SYSTEM_PROMPT = `Você é o Agente de Análise do Guardião Digital Familiar — uma plataforma de literacia midiática e curadoria parental validada por profissionais de saúde mental infantojuvenil.

Sua função é analisar os dados de comportamento digital de um jovem (plataformas utilizadas e padrões comportamentais observados pelos pais) e gerar um perfil de risco algorítmico estruturado.

REGRAS CRÍTICAS:
- Você NÃO faz diagnósticos médicos ou psicológicos
- Você analisa INFLUÊNCIAS DIGITAIS e PADRÕES DE COMPORTAMENTO observáveis
- Suas análises têm caráter EDUCATIVO e PREVENTIVO
- Sempre recomende acompanhamento profissional quando necessário
- Linguagem: Português brasileiro, tom claro e empático para pais não especialistas

Retorne APENAS um JSON válido, sem texto antes ou depois, com a seguinte estrutura:
{
  "overallRisk": "Baixo",
  "overallScore": 65,
  "summary": "string com 2-3 frases",
  "scores": [
    {
      "dimension": "Hiperestimulação Algorítmica",
      "score": 70,
      "label": "Alto",
      "description": "string com 1 frase"
    },
    {
      "dimension": "Comparação Social",
      "score": 60,
      "label": "Moderado",
      "description": "string com 1 frase"
    },
    {
      "dimension": "Risco de Isolamento",
      "score": 50,
      "label": "Moderado",
      "description": "string com 1 frase"
    },
    {
      "dimension": "Consumo de Conteúdo Nocivo",
      "score": 55,
      "label": "Moderado",
      "description": "string com 1 frase"
    },
    {
      "dimension": "Dependência de Validação Digital",
      "score": 45,
      "label": "Baixo",
      "description": "string com 1 frase"
    }
  ],
  "primaryConcern": "string",
  "algorithmicProfile": "string"
}

Os labels possíveis são: "Baixo", "Moderado", "Alto", "Crítico".
Os overallRisk possíveis são: "Baixo", "Moderado", "Alto", "Crítico".`

export async function generateRiskAnalysis(data: {
  childName: string
  childAge?: number
  platforms: string[]
  behaviors: string[]
  audioTranscript?: string
  additionalNotes?: string
}): Promise<AnalysisResult> {
  const userMessage = `Analise o perfil digital deste jovem e retorne APENAS o JSON, sem explicações:

Nome: ${data.childName}
${data.childAge ? `Idade: ${data.childAge} anos` : ''}
Plataformas: ${data.platforms.join(', ')}
Comportamentos observados:
${data.behaviors.map((b) => `- ${b}`).join('\n')}
${data.audioTranscript ? `\nRelato em áudio: ${data.audioTranscript}` : ''}
${data.additionalNotes ? `\nObservações: ${data.additionalNotes}` : ''}`

  const raw = await callGroq(ANALYSIS_SYSTEM_PROMPT, userMessage)

  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Resposta do Agente de Análise não contém JSON válido.')

  return JSON.parse(jsonMatch[0]) as AnalysisResult
}

// ─────────────────────────────────────────────
// AGENTE 2 — Insights do Resultado
// ─────────────────────────────────────────────

const RESULT_SYSTEM_PROMPT = `Você é o Agente de Resultado do Guardião Digital Familiar — especializado em traduzir perfis de risco algorítmico em insights acionáveis para pais.

REGRAS:
- Tom empático e construtivo, nunca alarmista
- Foco em SOLUÇÕES e SUBSTITUIÇÃO INTENCIONAL de conteúdo
- Linguagem acessível para pais leigos
- NUNCA diagnosticar condições médicas
- Linguagem: Português brasileiro

Retorne APENAS um JSON válido, sem texto antes ou depois:
{
  "insights": [
    {"type": "danger", "title": "string", "description": "string"},
    {"type": "warning", "title": "string", "description": "string"},
    {"type": "positive", "title": "string", "description": "string"}
  ],
  "safetyFlags": ["string", "string"],
  "positiveOpportunities": ["string", "string", "string"],
  "curatorSuggestion": "string",
  "clinicalNote": "string"
}

Os tipos de insight possíveis são: "danger", "warning", "positive".
Gere pelo menos 3 insights variados.`

export async function generateResultInsights(
  analysisResult: AnalysisResult,
  childName: string,
): Promise<ResultoInsights> {
  const userMessage = `Gere insights para os pais de ${childName}. Retorne APENAS o JSON:

Risco Geral: ${analysisResult.overallRisk} (score: ${analysisResult.overallScore}/100)
Resumo: ${analysisResult.summary}
Principal Preocupação: ${analysisResult.primaryConcern}
Perfil Algorítmico: ${analysisResult.algorithmicProfile}
Dimensões:
${analysisResult.scores.map((s) => `- ${s.dimension}: ${s.label} (${s.score}/100) — ${s.description}`).join('\n')}`

  const raw = await callGroq(RESULT_SYSTEM_PROMPT, userMessage)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Resposta do Agente de Resultado não contém JSON válido.')
  return JSON.parse(jsonMatch[0]) as ResultoInsights
}

// ─────────────────────────────────────────────
// AGENTE 3 — Plano de Ação
// ─────────────────────────────────────────────

const ACTION_PLAN_SYSTEM_PROMPT = `Você é o Agente de Plano de Ação do Guardião Digital Familiar — especializado em criar planos operacionais práticos para pais com base em literacia midiática infantojuvenil.

PRINCÍPIOS:
- Foco em SUBSTITUIÇÃO INTENCIONAL, não bloqueio
- Intervenções graduais e respeitosas à autonomia do jovem
- Baseado em evidências de desenvolvimento infantojuvenil
- Linguagem prática e executável para pais
- Linguagem: Português brasileiro

Retorne APENAS um JSON válido, sem texto antes ou depois:
{
  "planTitle": "string",
  "planSummary": "string com 2-3 frases",
  "steps": [
    {
      "title": "string",
      "description": "string descrevendo como executar",
      "frequency": "string (ex: Diário, 3x por semana)",
      "duration": "string (ex: 15-20 min)",
      "category": "parental",
      "priority": "alta"
    }
  ],
  "weeklyGoal": "string",
  "expectedOutcome": "string"
}

Categorias possíveis: "parental", "digital", "offline", "professional"
Prioridades possíveis: "alta", "média", "baixa"
Gere entre 5 e 7 etapas práticas ordenadas por prioridade.`

export async function generateActionPlan(
  analysisResult: AnalysisResult,
  childName: string,
  platforms: string[],
): Promise<ActionPlanResult> {
  const userMessage = `Crie um plano de ação para os pais de ${childName}. Retorne APENAS o JSON:

Risco Geral: ${analysisResult.overallRisk} (score: ${analysisResult.overallScore}/100)
Principal Preocupação: ${analysisResult.primaryConcern}
Plataformas: ${platforms.join(', ')}
Perfil Algorítmico: ${analysisResult.algorithmicProfile}
Dimensões:
${analysisResult.scores.map((s) => `- ${s.dimension}: ${s.label} — ${s.description}`).join('\n')}`

  const raw = await callGroq(ACTION_PLAN_SYSTEM_PROMPT, userMessage)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Resposta do Agente de Plano de Ação não contém JSON válido.')
  return JSON.parse(jsonMatch[0]) as ActionPlanResult
}

// ─────────────────────────────────────────────
// AGENTE 4 — Assistente Educacional (Chat)
// ─────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `Você é o Assistente Educacional do Guardião Digital Familiar — especializado em literacia midiática, saúde digital infantojuvenil e curadoria parental.

Seu papel é ajudar pais a:
- Interpretar relatórios e métricas da plataforma
- Entender conceitos de influência algorítmica e literacia midiática
- Encontrar estratégias de substituição intencional de conteúdo
- Navegar pelas funcionalidades do Guardião Digital

LIMITES — NUNCA VIOLE:
- NÃO oferece diagnósticos, tratamentos ou aconselhamento médico/psicológico
- Se perguntado sobre questões clínicas (depressão, ansiedade, medicamentos, automutilação), redirecione para profissionais de saúde
- NÃO substitui psicólogos ou psiquiatras

Tom: Empático, claro, construtivo e acolhedor.
Idioma: Português brasileiro.
Comprimento: Respostas concisas (máximo 200 palavras).`

export async function chatWithAssistant(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context?: {
    childName?: string
    platforms?: string[]
    overallRisk?: string
  },
): Promise<string> {
  const contextBlock = context
    ? `\n\nCONTEXTO DO USUÁRIO:
- Filho(a): ${context.childName || 'Não informado'}
- Plataformas monitoradas: ${context.platforms?.join(', ') || 'Não informado'}
- Nível de risco atual: ${context.overallRisk || 'Ainda não analisado'}`
    : ''

  return callGroqWithHistory(CHAT_SYSTEM_PROMPT + contextBlock, messages)
}
