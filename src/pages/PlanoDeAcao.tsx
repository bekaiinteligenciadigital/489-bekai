import { useState, useEffect, useRef } from 'react'
import { useRealtime } from '@/hooks/use-realtime'
import pb from '@/lib/pocketbase/client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Activity, Clock, FileText, Play, Sparkles, AlertCircle, Bot, Loader2, RefreshCw, CheckCircle2, Calendar, Target, Send, MessageCircle, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Separator } from '@/components/ui/separator'
import { useNavigate } from 'react-router-dom'
import { TermTooltip } from '@/components/ui/glossary-tooltip'
import { generateActionPlan, chatWithAssistant } from '@/services/ai'
import type { ActionPlanResult } from '@/services/ai'
import useFamilyStore from '@/stores/useFamilyStore'

const CATEGORY_LABELS: Record<string, string> = {
  parental: 'Parental',
  digital: 'Digital',
  offline: 'Offline',
  professional: 'Profissional',
}
const CATEGORY_COLORS: Record<string, string> = {
  parental: 'bg-indigo-100 text-indigo-800',
  digital: 'bg-blue-100 text-blue-800',
  offline: 'bg-emerald-100 text-emerald-800',
  professional: 'bg-violet-100 text-violet-800',
}
const PRIORITY_COLORS: Record<string, string> = {
  alta: 'bg-red-100 text-red-700',
  média: 'bg-amber-100 text-amber-700',
  baixa: 'bg-slate-100 text-slate-600',
}

export default function PlanoDeAcao() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { aiResults, childrenProfiles, pendingAnalysis } = useFamilyStore()
  const [plans, setPlans] = useState<any[]>([])
  const [steps, setSteps] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)

  // Agente de Plano de Ação
  const [aiPlan, setAiPlan] = useState<ActionPlanResult | null>(aiResults.actionPlanResult)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  // Agente Autônomo — chat standalone
  type ChatMsg = { role: 'user' | 'assistant'; content: string }
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Olá! Sou o Agente BekAI. Posso ajudar com estratégias de literacia digital, orientar sobre comportamentos preocupantes ou explicar como funciona a plataforma. O que você gostaria de discutir hoje?',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const sendChatMessage = async () => {
    const msg = chatInput.trim()
    if (!msg || chatLoading) return
    const newMessages: ChatMsg[] = [...chatMessages, { role: 'user', content: msg }]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)
    try {
      const reply = await chatWithAssistant(
        newMessages.map((m) => ({ role: m.role, content: m.content })),
        {
          childName: childrenProfiles[0]?.name,
          platforms: pendingAnalysis?.platforms,
          overallRisk: aiResults.analysisResult?.overallRisk,
        },
      )
      setChatMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.' },
      ])
    } finally {
      setChatLoading(false)
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const generateAIPlan = async () => {
    if (!aiResults.analysisResult) return
    setAiLoading(true)
    setAiError(null)
    try {
      const childName =
        childrenProfiles.find((c) => c.id === aiResults.analyzedChildId)?.name ?? 'jovem'
      const platforms = pendingAnalysis?.platforms ?? []
      const result = await generateActionPlan(aiResults.analysisResult, childName, platforms)
      setAiPlan(result)
    } catch (err: any) {
      setAiError(err?.message ?? 'Erro ao gerar plano com IA.')
      toast({ title: 'Erro no Agente', description: err?.message, variant: 'destructive' })
    } finally {
      setAiLoading(false)
    }
  }

  // Gera o plano automaticamente se tiver análise e ainda não tiver plano
  useEffect(() => {
    if (aiResults.analysisResult && !aiPlan && !aiLoading) {
      generateAIPlan()
    }
  }, [aiResults.analysisResult])

  const loadData = async () => {
    try {
      const plansData = await pb.collection('action_plans').getFullList({
        sort: '-created',
        expand: 'bundle,assessment,child',
      })

      const stepsData = await pb.collection('action_plan_steps').getFullList({
        sort: 'order_index',
      })

      const stepsByPlan: Record<string, any[]> = {}
      stepsData.forEach((s) => {
        if (!stepsByPlan[s.action_plan]) stepsByPlan[s.action_plan] = []
        stepsByPlan[s.action_plan].push(s)
      })

      setPlans(plansData)
      setSteps(stepsByPlan)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('action_plans', () => {
    loadData()
  })
  useRealtime('action_plan_steps', () => {
    loadData()
  })

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-6 animate-pulse mt-6">
        <div className="h-10 bg-muted rounded w-1/3"></div>
        <div className="h-64 bg-muted rounded w-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 mt-6 animate-fade-in-up">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
          <Activity className="w-4 h-4" /> Plano de Ação Inteligente
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight">
          Estratégia e Rotina
        </h1>
        <p className="text-muted-foreground text-lg border-l-4 border-emerald-500 pl-4 max-w-2xl">
          Planos operacionais gerados dinamicamente com base em evidências clínicas e análise do
          comportamento digital do seu filho.
        </p>
      </div>

      <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-sm text-primary/80 mb-2 leading-relaxed animate-fade-in-up">
        <strong>Ação do Agente Autônomo:</strong> O sistema utiliza a técnica de{' '}
        <TermTooltip term="Equivalência Estética" /> para injetar conteúdo saudável no feed, medindo
        a <em>Evolução Quantitativa</em> (redução do tempo de tela nocivo) e a{' '}
        <em>Evolução Qualitativa</em> (aceitação de conteúdo positivo).
      </div>

      {/* ── AGENTE DE PLANO DE AÇÃO (IA) ── */}
      {(aiResults.analysisResult || aiLoading || aiPlan) && (
        <Card className="shadow-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-background animate-fade-in-up">
          <CardHeader className="border-b border-emerald-100 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Bot className="w-5 h-5 text-emerald-600" /> Plano de Ação — Gerado por IA
                </CardTitle>
                <CardDescription className="text-emerald-700/80">
                  Baseado no perfil de influência digital analisado pelo Agente
                </CardDescription>
              </div>
              {!aiLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateAIPlan}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <RefreshCw className="w-4 h-4 mr-1" /> Regenerar Plano
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {aiLoading && (
              <div className="flex items-center justify-center py-12 gap-3 text-emerald-700">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm animate-pulse">Agente gerando plano de ação personalizado...</span>
              </div>
            )}

            {aiError && !aiLoading && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                {aiError}
              </div>
            )}

            {aiPlan && !aiLoading && (
              <div className="space-y-6 animate-fade-in">
                {/* Resumo */}
                <div className="space-y-2">
                  <h4 className="font-bold text-lg text-emerald-900">{aiPlan.planTitle}</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{aiPlan.planSummary}</p>
                </div>

                {/* Objetivo da semana e resultado esperado */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Meta da 1ª Semana</span>
                    </div>
                    <p className="text-sm text-foreground/80">{aiPlan.weeklyGoal}</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">Resultado em 30-90 dias</span>
                    </div>
                    <p className="text-sm text-foreground/80">{aiPlan.expectedOutcome}</p>
                  </div>
                </div>

                <Separator />

                {/* Etapas */}
                <div className="space-y-4">
                  <h5 className="font-bold text-sm text-foreground uppercase tracking-wide">
                    Etapas do Plano ({aiPlan.steps.length})
                  </h5>
                  {aiPlan.steps.map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-4 p-4 bg-white rounded-xl border border-border/60 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center font-bold text-sm text-emerald-700">
                        {i + 1}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm text-foreground">{step.title}</span>
                          <Badge className={`text-xs px-2 py-0 border-0 ${PRIORITY_COLORS[step.priority] || ''}`}>
                            {step.priority}
                          </Badge>
                          <Badge className={`text-xs px-2 py-0 border-0 ${CATEGORY_COLORS[step.category] || ''}`}>
                            {CATEGORY_LABELS[step.category] || step.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {step.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {step.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {plans.length === 0 && !aiResults.analysisResult ? (
        <div className="space-y-6">
          {/* Standalone Agent Chat */}
          <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardHeader className="border-b border-primary/10 pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageCircle className="w-5 h-5" /> Agente BekAI — Modo Consulta
              </CardTitle>
              <CardDescription>
                Converse com o agente para obter orientações sobre literacia digital, mesmo sem análise prévia.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Faça uma pergunta ao Agente BekAI..."
                  className="resize-none min-h-[44px] max-h-24 text-sm"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendChatMessage()
                    }
                  }}
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Sparkles className="w-12 h-12 text-muted-foreground/40" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Gerar Plano Estruturado</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Complete uma avaliação clínica digital para que nossa inteligência gere um plano de ação personalizado.
                </p>
              </div>
              <Button
                className="mt-2 shadow-md font-bold gap-2"
                onClick={() => navigate('/analise')}
              >
                Iniciar Avaliação <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid gap-8">
          {plans.some((p) => p.status === 'active') && (
            <Card className="shadow-lg border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Bot className="w-6 h-6" /> Monitoramento do Agente Autônomo
                </CardTitle>
                <CardDescription>
                  Resumo das intervenções automatizadas nas redes sociais e evolução do
                  participante.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3 bg-white p-4 rounded-xl border shadow-sm">
                    <h4 className="font-bold text-sm text-muted-foreground uppercase flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" /> Evolução Quantitativa
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Volume de consumo de conteúdo digital nos últimos 7 dias.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-black text-blue-600">-32%</div>
                      <div className="text-xs text-muted-foreground leading-tight">
                        Redução no tempo de tela nocivo (Vaping de Atenção) em comparação à linha de
                        base.
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white p-4 rounded-xl border shadow-sm">
                    <h4 className="font-bold text-sm text-muted-foreground uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" /> Evolução Qualitativa
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      Qualidade do contra-conteúdo orgânico consumido.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-black text-emerald-600">68%</div>
                      <div className="text-xs text-muted-foreground leading-tight">
                        De aceitação orgânica. O jovem está engajando com conteúdos de propósito e
                        rotina sugeridos.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                  <h4 className="font-bold text-sm text-muted-foreground uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Resumo das Intervenções (Redes Sociais)
                  </h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>
                        <strong>TikTok:</strong> 12 sinais de "Não Tenho Interesse" emitidos em
                        conteúdos niilistas. 4 novos criadores de esportes e ciência seguidos.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>
                        <strong>YouTube:</strong> Aumento de 40% no watch time de documentários e
                        podcasts educativos através da injeção no feed.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>
                        <strong>Instagram:</strong> Engajamento intencional (likes/saves) em 15
                        reels sobre rotina e saúde mental para forçar o rebalanceamento do
                        algoritmo.
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="overflow-hidden shadow-xl border-t-4 border-t-primary border-b border-x hover:shadow-2xl transition-shadow duration-300"
            >
              <CardHeader className="bg-muted/20 pb-6 border-b">
                <div className="flex justify-between items-start flex-col sm:flex-row gap-4">
                  <div>
                    <CardTitle className="text-2xl md:text-3xl mb-2 text-primary font-bold">
                      {plan.summary || 'Protocolo de Intervenção'}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-white px-2 py-0.5 font-mono shadow-sm">
                        Versão {plan.version}
                      </Badge>
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Gerado em {new Date(plan.created).toLocaleDateString()}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge
                    className={`px-3 py-1 text-sm font-bold shadow-sm ${
                      plan.status === 'completed'
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : plan.status === 'active'
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-amber-500 hover:bg-amber-600'
                    }`}
                  >
                    {plan.status === 'active'
                      ? 'Em Progresso'
                      : plan.status === 'completed'
                        ? 'Concluído'
                        : 'Pendente'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[1fr_320px] divide-y md:divide-y-0 md:divide-x">
                  <div className="p-6 md:p-8 space-y-6 bg-white">
                    <h4 className="font-bold text-xl flex items-center gap-2 text-foreground">
                      <Clock className="w-5 h-5 text-primary" /> Passos da Rotina
                    </h4>
                    <div className="space-y-5">
                      {steps[plan.id]?.map((step) => (
                        <div
                          key={step.id}
                          className="flex gap-4 p-5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm transition-all hover:bg-slate-100"
                        >
                          <div className="shrink-0 flex flex-col items-center gap-1 mt-0.5">
                            <Badge className="bg-slate-800 text-white px-3 py-1 font-mono font-bold uppercase shadow-sm">
                              {step.phase}
                            </Badge>
                          </div>
                          <div className="w-full">
                            <h5 className="font-bold text-lg text-slate-800">{step.title}</h5>
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed font-medium">
                              {step.description}
                            </p>
                            {step.checklist_json && Array.isArray(step.checklist_json) && (
                              <div className="mt-4 space-y-2">
                                {step.checklist_json.map((item: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2 bg-white p-2 rounded border shadow-sm"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <span className="text-sm text-slate-700">{item}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {!steps[plan.id]?.length && (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <AlertCircle className="w-5 h-5" />
                          <p className="text-sm font-bold italic">
                            Processando passos operacionais em background...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-6 md:p-8 bg-slate-50 space-y-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="font-bold flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
                        <FileText className="w-4 h-4" /> Resumo do Contexto
                      </h4>
                      <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Criança Analisada</span>
                          <span className="font-bold">
                            {plan.expand?.child?.name || 'Não informada'}
                          </span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Prioridade</span>
                          <Badge
                            variant="outline"
                            className={`font-bold uppercase ${
                              plan.expand?.bundle?.priority === 'high'
                                ? 'text-red-600 border-red-200 bg-red-50'
                                : plan.expand?.bundle?.priority === 'medium'
                                  ? 'text-amber-600 border-amber-200 bg-amber-50'
                                  : ''
                            }`}
                          >
                            {plan.expand?.bundle?.priority || 'Normal'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div>
                      {plan.status === 'pending' && (
                        <Button
                          size="lg"
                          className="w-full gap-2 font-bold shadow-md hover:-translate-y-0.5 transition-transform"
                          onClick={async () => {
                            try {
                              await pb
                                .collection('action_plans')
                                .update(plan.id, { status: 'active' })
                              toast({
                                title: 'Plano Ativado',
                                description:
                                  'O Agente Autônomo começou a executar as intervenções.',
                              })
                            } catch (e) {
                              toast({
                                title: 'Erro ao ativar',
                                description: 'Não foi possível ativar o plano.',
                                variant: 'destructive',
                              })
                            }
                          }}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Iniciar Execução do Plano
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
