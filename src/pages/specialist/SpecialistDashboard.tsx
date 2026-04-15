import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Activity,
  User,
  Lock,
  FileText,
  ShieldAlert,
  Users,
  LineChart as LineChartIcon,
} from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function SpecialistDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [notes, setNotes] = useState<Record<string, string>>({})
  const [savingNote, setSavingNote] = useState<string | null>(null)
  const [clinicalPlansMap, setClinicalPlansMap] = useState<Record<string, string>>({})

  const [analysesHistory, setAnalysesHistory] = useState<Record<string, any[]>>({})
  const [selectedChildId, setSelectedChildId] = useState<string>('')

  const isExpert = user?.active_plan === 'clinical_expert'
  const totalSlots = 10
  const usedSlots = patients.length
  const canAddPatient = usedSlots < totalSlots

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const linkedChildren = await pb.collection('children').getFullList({
        filter: `assigned_professional = "${user?.id}"`,
        expand: 'parent',
      })

      if (linkedChildren.length > 0) {
        const childIds = linkedChildren.map((c) => `child = "${c.id}"`).join(' || ')

        const [plans, analyses] = await Promise.all([
          pb.collection('clinical_plans').getFullList({ filter: childIds }),
          pb.collection('analysis_records').getFullList({ filter: childIds, sort: 'created' }),
        ])

        const newNotes: Record<string, string> = {}
        const newPlansMap: Record<string, string> = {}
        const historyMap: Record<string, any[]> = {}
        const latestAnalysisMap: Record<string, any> = {}

        plans.forEach((p) => {
          newNotes[p.child] = p.specialist_notes || ''
          newPlansMap[p.child] = p.id
        })

        analyses.forEach((a) => {
          if (!historyMap[a.child]) historyMap[a.child] = []
          historyMap[a.child].push(a)
          latestAnalysisMap[a.child] = a
        })

        setNotes(newNotes)
        setClinicalPlansMap(newPlansMap)
        setAnalysesHistory(historyMap)

        setPatients(
          linkedChildren.map((c) => ({
            ...c,
            dq_score: latestAnalysisMap[c.id]?.dq_score || '--',
          })),
        )

        if (!selectedChildId) {
          setSelectedChildId(linkedChildren[0].id)
        }
      } else {
        setPatients([])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'professional') {
      loadDashboardData()
    }
  }, [user])

  useRealtime('children', () => {
    if (user?.role === 'professional') loadDashboardData()
  })

  const saveNotes = async (childId: string) => {
    if (!isExpert) return
    try {
      setSavingNote(childId)
      const noteContent = notes[childId] || ''
      const planId = clinicalPlansMap[childId]

      if (planId) {
        await pb.collection('clinical_plans').update(planId, { specialist_notes: noteContent })
      } else {
        const newPlan = await pb.collection('clinical_plans').create({
          child: childId,
          specialist_notes: noteContent,
          status: 'pending',
        })
        setClinicalPlansMap((prev) => ({ ...prev, [childId]: newPlan.id }))
      }
      toast({ title: 'Anotações salvas com sucesso!' })
    } catch (err) {
      toast({ title: 'Erro ao salvar anotações', variant: 'destructive' })
    } finally {
      setSavingNote(null)
    }
  }

  if (loading || !user) {
    return (
      <div className="p-8 space-y-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold font-serif text-primary">Painel do Profissional</h1>
        <div className="grid gap-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (user?.role !== 'professional') {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-20 animate-fade-in">
        <Lock className="w-16 h-16 mx-auto text-rose-500/50 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-rose-600">Acesso Restrito</h2>
        <p className="text-muted-foreground mb-6">
          Este ambiente é exclusivo para profissionais de saúde e especialistas clínicos validados.
        </p>
        <Button asChild>
          <Link to="/dashboard">Ir para Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-5xl mx-auto animate-fade-in-up relative min-h-screen">
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center opacity-[0.03] overflow-hidden z-[-1] select-none">
        <img
          src={logoUrl}
          alt="BekAI Watermark"
          className="w-[600px] h-[600px] object-contain grayscale"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-primary flex items-center gap-2">
            <Activity className="w-8 h-8 text-secondary" /> BekAI Clinical Expert
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base max-w-lg">
            Monitore os relatórios e registre indicadores comportamentais dos seus pacientes.
          </p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-primary/20 shadow-sm shrink-0 w-full md:w-auto min-w-[320px]">
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border/50">
              <span className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" /> Vagas de Pacientes
              </span>
              <Badge
                variant="outline"
                className="font-mono bg-primary/5 text-primary border-primary/20"
              >
                {usedSlots} / {totalSlots}
              </Badge>
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground font-semibold">
                Seu Código de Convite
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={user?.invite_code || ''}
                  className="font-mono text-center font-bold bg-primary/5 text-primary tracking-widest h-11 border-primary/20"
                />
                <Button
                  variant="default"
                  className="h-11 shadow-sm font-bold"
                  onClick={() => {
                    if (user?.invite_code) {
                      navigator.clipboard.writeText(user.invite_code)
                      toast({ title: 'Código copiado para a área de transferência!' })
                    }
                  }}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Compartilhe este código único com os pais/responsáveis para que vinculem o perfil do
                paciente à sua conta.
              </p>
            </div>

            <div className="space-y-3 pt-4 mt-4 border-t border-border/50">
              <Label className="text-xs text-muted-foreground font-semibold">
                Ou insira o código gerado pelo paciente
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="patient-access-code"
                  placeholder="Ex: AB123C"
                  className="font-mono text-center h-11 uppercase"
                  disabled={!canAddPatient}
                />
                <Button
                  variant="outline"
                  className="h-11 shadow-sm font-bold"
                  disabled={!canAddPatient}
                  onClick={async () => {
                    const input = document.getElementById('patient-access-code') as HTMLInputElement
                    const code = input?.value?.trim().toUpperCase()
                    if (!code) {
                      toast({ title: 'Insira um código válido.', variant: 'destructive' })
                      return
                    }
                    try {
                      await pb.send('/backend/v1/professional/link-patient', {
                        method: 'POST',
                        body: JSON.stringify({ accessCode: code }),
                      })
                      toast({ title: 'Paciente vinculado com sucesso!' })
                      input.value = ''
                      loadDashboardData()
                    } catch (err: any) {
                      toast({
                        title: 'Erro ao vincular',
                        description: err?.response?.message || 'Código inválido.',
                        variant: 'destructive',
                      })
                    }
                  }}
                >
                  Vincular
                </Button>
              </div>
            </div>

            {!canAddPatient && (
              <p className="text-xs text-destructive text-center mt-4 font-bold bg-destructive/10 py-2 rounded-md">
                Limite de 10 pacientes atingido.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-primary/5 border-primary/20 shadow-sm backdrop-blur-sm">
        <ShieldAlert className="w-5 h-5 text-primary" />
        <AlertTitle className="text-sm font-bold text-primary">Aviso Legal</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground leading-relaxed mt-1">
          Os dados e mapeamentos apresentados neste painel destinam-se exclusivamente ao Suporte à
          Decisão Clínica. A interpretação final e a avaliação clínica são atos exclusivos do
          profissional de saúde habilitado.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-muted/50 border w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2 px-6">
            <Users className="w-4 h-4" /> Visão Geral
          </TabsTrigger>
          <TabsTrigger value="evolution" className="flex items-center gap-2 px-6">
            <LineChartIcon className="w-4 h-4" /> Dashboard de Evolução
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 outline-none">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2 text-foreground mb-4">
              <User className="w-5 h-5 text-emerald-500" /> Pacientes Ativos
            </h3>

            {patients.length === 0 ? (
              <Card className="bg-muted/30 border-dashed border-2 shadow-none animate-fade-in">
                <CardContent className="flex flex-col items-center justify-center h-48 text-center space-y-4 pt-6">
                  <div className="bg-primary/10 p-4 rounded-full">
                    <User className="w-8 h-8 text-primary/60" />
                  </div>
                  <div>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Nenhum paciente vinculado no momento. Compartilhe seu código de convite para
                      começar.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {patients.map((patient) => (
                  <Card
                    key={patient.id}
                    className="border-l-4 border-l-emerald-500 shadow-md transition-all hover:shadow-lg animate-fade-in bg-white/95 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3 border-b bg-muted/10">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div>
                          <CardTitle className="text-xl flex flex-wrap items-center gap-2">
                            {patient.name}
                            <Badge
                              variant="outline"
                              className="bg-background text-xs text-muted-foreground"
                            >
                              Status:{' '}
                              {patient.monitoring_status === 'active'
                                ? 'Avaliado'
                                : 'Em Monitoramento'}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/20"
                            >
                              DQ: {patient.dq_score}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                            <span className="font-semibold text-foreground">
                              Responsável:{' '}
                              {patient.expand?.parent?.name ||
                                patient.expand?.parent?.email ||
                                'Desconhecido'}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="font-semibold bg-background hover:bg-muted"
                          >
                            <Link to={`/reports/monthly/${patient.id}`}>
                              <FileText className="w-4 h-4 mr-2 text-primary" /> Dossiê Mensal
                            </Link>
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white font-semibold"
                          >
                            <Link to={`/reports/clinical/${patient.id}`}>
                              <Activity className="w-4 h-4 mr-2" /> Ver Relatório Técnico
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {isExpert ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-primary flex items-center gap-2">
                              <Lock className="w-4 h-4" /> Anotações Clínicas Privadas
                            </h4>
                            <Badge
                              variant="secondary"
                              className="text-[10px] uppercase bg-secondary/20 text-secondary-foreground border-none"
                            >
                              Visível apenas para você
                            </Badge>
                          </div>

                          <textarea
                            value={notes[patient.id] || ''}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [patient.id]: e.target.value }))
                            }
                            placeholder="Registre suas observações, indicadores comportamentais e evolução de tratamentos aqui. Este conteúdo é estritamente confidencial e NÃO é compartilhado com os pais ou responsáveis."
                            className="w-full min-h-[120px] p-4 rounded-xl border border-input/50 bg-muted/20 text-sm focus:ring-2 focus:ring-primary/20 focus:bg-background outline-none resize-y transition-colors leading-relaxed"
                          />

                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              onClick={() => saveNotes(patient.id)}
                              disabled={savingNote === patient.id}
                              className="gap-2 shadow-sm font-bold min-w-[140px]"
                            >
                              {savingNote === patient.id ? (
                                <span className="animate-pulse">Salvando...</span>
                              ) : (
                                'Salvar Anotações'
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 bg-muted/20 border border-border/50 rounded-xl text-center">
                          <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                          <h4 className="font-semibold text-primary">
                            Recurso BekAI Clinical Expert
                          </h4>
                          <p className="text-sm text-muted-foreground mt-2 mb-4 max-w-md mx-auto">
                            Anotações clínicas exclusivas, alertas de risco (Safety Flags) e gestão
                            de conduta estão disponíveis apenas no plano Clinical Expert.
                          </p>
                          <Button asChild size="sm" className="shadow-sm">
                            <Link to="/planos">Fazer Upgrade</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="evolution" className="space-y-6 outline-none animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border shadow-sm">
            <div className="flex flex-col gap-1">
              <Label className="font-bold text-sm text-foreground">Selecionar Paciente</Label>
              <p className="text-xs text-muted-foreground">
                Escolha um paciente para visualizar o histórico longitudinal.
              </p>
            </div>
            <Select
              value={selectedChildId}
              onValueChange={setSelectedChildId}
              disabled={patients.length === 0}
            >
              <SelectTrigger className="w-[280px] bg-background">
                <SelectValue placeholder="Selecione um paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedChildId ||
          !analysesHistory[selectedChildId] ||
          analysesHistory[selectedChildId].length === 0 ? (
            <Card className="bg-white/60 border-dashed border-2 shadow-none">
              <CardContent className="flex flex-col items-center justify-center h-64 text-center space-y-4 pt-6">
                <LineChartIcon className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground max-w-md mx-auto font-medium">
                  Nenhum dado histórico disponível para exibir a evolução deste paciente no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              <Card className="shadow-md bg-white/95 backdrop-blur-sm border-t-4 border-t-primary">
                <CardHeader>
                  <CardTitle className="text-xl">Histórico de DQ (Quociente Digital)</CardTitle>
                  <CardDescription>
                    Acompanhe a evolução do score global do paciente ao longo das avaliações
                    realizadas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ChartContainer
                      config={{ dq_score: { label: 'DQ Score', color: 'hsl(var(--primary))' } }}
                      className="w-full h-full"
                    >
                      <LineChart
                        data={analysesHistory[selectedChildId].map((a) => ({
                          date: format(new Date(a.created), 'dd/MM', { locale: ptBR }),
                          dq_score: a.dq_score || 0,
                        }))}
                        margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          className="stroke-muted-foreground/20"
                        />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                          type="monotone"
                          dataKey="dq_score"
                          stroke="var(--color-dq_score)"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                            fill: 'var(--color-dq_score)',
                            strokeWidth: 2,
                            stroke: '#fff',
                          }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm bg-white/95 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Registro Analítico Detalhado</CardTitle>
                  <CardDescription>
                    Histórico de níveis de risco e padrões comportamentais identificados pelo BekAI.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {analysesHistory[selectedChildId]
                    .slice()
                    .reverse()
                    .map((a) => (
                      <div
                        key={a.id}
                        className="relative pl-6 border-l-2 border-primary/20 last:pb-0 pb-6"
                      >
                        <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1 border-2 border-background" />
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
                          <span className="font-bold text-foreground bg-muted/50 px-3 py-1 rounded-md text-sm inline-block w-fit">
                            {format(new Date(a.created), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground font-medium">
                              Nível de Risco:
                            </span>
                            <Badge
                              variant={
                                a.risk_level === 'High' || a.risk_level === 'Critical'
                                  ? 'destructive'
                                  : a.risk_level === 'Medium'
                                    ? 'default'
                                    : 'secondary'
                              }
                            >
                              {a.risk_level || 'N/A'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mt-3">
                          <div className="bg-secondary/10 p-4 rounded-xl border border-secondary/20">
                            <span className="font-semibold text-secondary-foreground block mb-2 text-sm">
                              Padrões Comportamentais
                            </span>
                            {a.behavior_patterns ? (
                              <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                                {Array.isArray(a.behavior_patterns) ? (
                                  a.behavior_patterns.map((bp: any, i: number) => (
                                    <li key={i}>
                                      {typeof bp === 'string' ? bp : JSON.stringify(bp)}
                                    </li>
                                  ))
                                ) : typeof a.behavior_patterns === 'object' ? (
                                  Object.entries(a.behavior_patterns).map(([k, v]) => (
                                    <li key={k}>
                                      <strong className="capitalize">
                                        {k.replace(/_/g, ' ')}:
                                      </strong>{' '}
                                      {String(v)}
                                    </li>
                                  ))
                                ) : (
                                  <li>{String(a.behavior_patterns)}</li>
                                )}
                              </ul>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">
                                Nenhum padrão registrado.
                              </p>
                            )}
                          </div>

                          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                            <span className="font-semibold text-primary block mb-2 text-sm">
                              Resumo Clínico (Insights)
                            </span>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {a.insights_summary || (
                                <span className="italic">
                                  Resumo não disponível para esta análise.
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
