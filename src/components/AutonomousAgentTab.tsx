import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  PlaySquare,
  Heart,
  Share2,
  MessageCircle,
  UserPlus,
  Ban,
  Search,
  TrendingUp,
  Clock,
  Activity,
  LineChart as ChartIcon,
  ArrowLeft,
  Hourglass,
} from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from 'recharts'
import pb from '@/lib/pocketbase/client'

export function AutonomousAgentTab() {
  const navigate = useNavigate()
  const [hasActivePlan, setHasActivePlan] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkPlanStatus = async () => {
      try {
        const plans = await pb.collection('action_plans').getFullList({ sort: '-created' })
        const activePlan = plans.find((p) => p.status === 'active' || p.status === 'completed')

        if (activePlan) {
          setHasActivePlan(true)
        } else {
          setHasActivePlan(false)
        }
      } catch (e) {
        console.error(e)
        setHasActivePlan(false)
      } finally {
        setLoading(false)
      }
    }
    checkPlanStatus()
  }, [])

  const signalLogic = [
    {
      action: 'Watch time (Tempo de tela)',
      icon: <PlaySquare className="w-4 h-4 text-blue-500" />,
      weight: 'Alto',
      freq: 'Automático',
      effect: 'Ensina o algoritmo a recomendar mais do criador.',
    },
    {
      action: 'Salvar / Favoritar',
      icon: <Heart className="w-4 h-4 text-rose-500" />,
      weight: 'Muito Alto',
      freq: '2-3x / semana',
      effect: 'Sinaliza o conteúdo como altamente valioso para o perfil.',
    },
    {
      action: 'Compartilhar',
      icon: <Share2 className="w-4 h-4 text-indigo-500" />,
      weight: 'Alto',
      freq: '1-2x / semana',
      effect: 'Amplifica o peso do criador positivo na rede.',
    },
    {
      action: 'Comentar',
      icon: <MessageCircle className="w-4 h-4 text-emerald-500" />,
      weight: 'Médio',
      freq: '2-3x / semana',
      effect: 'Aumenta engajamento invisível com a bolha saudável.',
    },
    {
      action: 'Seguir Criador',
      icon: <UserPlus className="w-4 h-4 text-violet-500" />,
      weight: 'Muito Alto',
      freq: '1-2 novos / semana',
      effect: 'Muda permanentemente a estrutura do Feed Following.',
    },
    {
      action: 'Buscar Criador/Tema',
      icon: <Search className="w-4 h-4 text-amber-500" />,
      weight: 'Alto',
      freq: '1-2x / semana',
      effect: 'Sinaliza interesse intencional de descoberta.',
    },
    {
      action: '"Não Tenho Interesse"',
      icon: <Ban className="w-4 h-4 text-red-600" />,
      weight: 'Muito Alto',
      freq: '1-2x / dia',
      effect: 'Limpa ativamente o lixo algorítmico do For You page.',
    },
  ]

  const feedData = [
    { day: 'Baseline', positive: 10, negative: 90 },
    { day: '30 Dias', positive: 40, negative: 60 },
    { day: '60 Dias', positive: 70, negative: 30 },
    { day: '90 Dias', positive: 85, negative: 15 },
  ]

  const feedConfig = {
    positive: { label: 'Positivo / Neutro', color: 'hsl(var(--primary))' },
    negative: { label: 'Nocivo / Tóxico', color: 'hsl(var(--destructive))' },
  }

  const timingSchedule = [
    {
      time: '07:00 - 09:00',
      state: 'Alta Receptividade',
      action: 'Sinais de Descoberta (Buscas e Seguir Novos)',
    },
    {
      time: '12:00 - 14:00',
      state: 'Fadiga Cognitiva',
      action: 'Sinais de Engajamento Leve (Likes em Humor Limpo)',
    },
    {
      time: '18:00 - 21:00',
      state: 'Vulnerabilidade',
      action: 'Sinais de Profundidade (Watch time em Propósito)',
    },
    {
      time: '22:00 - 00:00',
      state: 'Limpeza Crítica',
      action: '"Não Interessa" em gatilhos de Insônia/Ansiedade',
    },
  ]

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando dados do Agente...
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="-mb-2">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>

      <Card className="shadow-lg border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-background overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-5 pointer-events-none p-4">
          <Bot className="w-48 h-48 text-emerald-900" />
        </div>
        <CardHeader className="pb-4 relative z-10 border-b border-emerald-100/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Bot className="w-6 h-6 text-emerald-600" /> Agente de Rebalanceamento Ativo
              </CardTitle>
              <CardDescription className="text-emerald-800/80 mt-1">
                Motor autônomo educando os algoritmos via Substituição Intencional. Compatível com
                TikTok, Instagram, YouTube e Twitch.
              </CardDescription>
            </div>
            <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-md px-3 py-1 text-sm font-bold">
              {hasActivePlan ? 'Semana 3-4: Amplificação' : 'Aguardando Início'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6 relative z-10 space-y-6">
          {!hasActivePlan ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <Hourglass className="w-12 h-12 text-emerald-300 animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-emerald-900">Aguardando início do plano</h3>
                <p className="text-emerald-700 max-w-md">
                  O plano de ação ainda está com status pendente. As métricas de reeducação
                  algorítmica serão exibidas aqui assim que a primeira intervenção for registrada.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
              <div className="md:col-span-2 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-bold text-emerald-950">
                    <span>Progresso para Feed Positivo (Meta 85%)</span>
                    <span>42% Alcançado</span>
                  </div>
                  <Progress value={42} className="h-3 [&>div]:bg-emerald-500 bg-emerald-200/50" />
                  <p className="text-xs text-emerald-800/80 leading-relaxed mt-2">
                    Nesta fase, o Agente está emitindo 8-12 sinais/dia em conteúdos de{' '}
                    <strong>Saúde Mental</strong> e <strong>Propósito</strong>.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/80 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <span className="text-3xl font-black text-emerald-600">142</span>
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider mt-1">
                      Sinais Emitidos
                    </span>
                    <span className="text-[10px] text-emerald-700/80 mt-1">Últimos 14 dias</span>
                  </div>
                  <div className="bg-white/80 p-4 rounded-xl border border-emerald-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-indigo-600" />
                      <span className="text-3xl font-black text-indigo-600">68%</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider mt-1">
                      Aceitação Orgânica
                    </span>
                    <span className="text-[10px] text-indigo-700/80 mt-1 leading-tight">
                      Interação voluntária com o conteúdo inserido
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-indigo-50 to-indigo-100/50 p-5 rounded-xl border border-indigo-200 shadow-sm flex flex-col justify-center">
                <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" /> Índice de Conversão Saudável
                </h4>
                <p className="text-xs text-indigo-800/90 leading-relaxed mb-4">
                  Esta métrica mede o sucesso da <strong>Equivalência Estética</strong>. Mostra a
                  porcentagem de vezes em que o jovem engajou (like, watch time) voluntariamente com
                  o conteúdo positivo injetado pelo Agente.
                </p>
                <div className="mt-auto bg-white/60 p-3 rounded text-center border border-indigo-100">
                  <span className="text-xs font-bold text-indigo-700 uppercase">Status</span>
                  <p className="text-sm font-black text-indigo-900 mt-1">Acima da Média</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!hasActivePlan ? (
        <Card className="shadow-md bg-muted/20 border-dashed">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <Activity className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
            <h3 className="font-bold text-lg text-foreground">Intervenção Inicial</h3>
            <p className="text-muted-foreground text-sm max-w-md mt-1">
              Os gráficos de evolução projetada e motor de agendamento estratégico estarão
              disponíveis após o registro das primeiras atividades do plano.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ChartIcon className="w-5 h-5 text-primary" /> Evolução Projetada do Feed
              </CardTitle>
              <CardDescription>
                Transição de 90 dias baseada na taxa atual de reeducação.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ChartContainer config={feedConfig} className="w-full h-full">
                  <AreaChart data={feedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillPositive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-positive)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-positive)" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="fillNegative" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-negative)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-negative)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="negative"
                      stackId="1"
                      stroke="var(--color-negative)"
                      fill="url(#fillNegative)"
                    />
                    <Area
                      type="monotone"
                      dataKey="positive"
                      stackId="1"
                      stroke="var(--color-positive)"
                      fill="url(#fillPositive)"
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Motor de Agendamento Estratégico
              </CardTitle>
              <CardDescription>
                Injeção de sinais cronometrada baseada na janela de receptividade e fadiga
                cognitiva.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timingSchedule.map((ts, i) => (
                  <div key={i} className="flex gap-4 items-start relative">
                    {i !== timingSchedule.length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-[-16px] w-px bg-border" />
                    )}
                    <div className="w-5 h-5 rounded-full bg-amber-100 border-2 border-amber-500 shrink-0 z-10" />
                    <div className="bg-muted/30 p-3 rounded-lg flex-1 border border-border/50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-sm text-foreground">{ts.time}</span>
                        <Badge variant="outline" className="text-[10px] bg-background">
                          {ts.state}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{ts.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Lógica de Reeducação Algorítmica</CardTitle>
          <CardDescription>
            Os sinais estratégicos que o Agente utiliza para mudar a bolha sem causar ruptura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[200px]">Ação / Sinal</TableHead>
                  <TableHead>Peso Algorítmico</TableHead>
                  <TableHead className="hidden sm:table-cell">Frequência</TableHead>
                  <TableHead className="hidden md:table-cell">Efeito Esperado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signalLogic.map((s, i) => (
                  <TableRow key={i} className="hover:bg-muted/30">
                    <TableCell className="font-medium flex items-center gap-2">
                      {s.icon} {s.action}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          s.weight === 'Muito Alto'
                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            : s.weight === 'Alto'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }
                      >
                        {s.weight}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{s.freq}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {s.effect}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
