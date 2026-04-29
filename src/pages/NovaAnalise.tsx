import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  User,
  History,
  TrendingUp,
  TrendingDown,
  Minus,
  RotateCcw,
} from 'lucide-react'
import { MentorCard } from '@/components/MentorCard'
import { AnaliseColeta } from '@/components/AnaliseColeta'
import { AnaliseProcessando } from '@/components/AnaliseProcessando'
import useFamilyStore from '@/stores/useFamilyStore'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'

const PLATFORMS = [
  'TikTok',
  'Instagram',
  'YouTube',
  'WhatsApp',
  'Roblox',
  'Discord',
  'X/Twitter',
  'Twitch',
]

const behaviorsList = [
  'Indicador de Comparacao Social Excessiva',
  'Padrao de Uso Compulsivo (Vaping de Atencao)',
  'Indicador de Respostas Hostis / Polarizacao',
  'Indicador de Isolamento / Apatia',
  'Indicador de Consumo de Conteudo de Risco Severo',
  'Sinais de Desinteresse Escolar / Desconexao',
]

type HistoryRecord = {
  id: string
  child: string
  dq_score: number
  risk_level: string
  insights_summary: string
  behavior_patterns?: {
    platforms?: string[]
    behaviors?: string[]
  }
  created: string
}

const RISK_COLORS: Record<string, string> = {
  Baixo: 'bg-emerald-100 text-emerald-800',
  Moderado: 'bg-amber-100 text-amber-800',
  Alto: 'bg-orange-100 text-orange-800',
  Critico: 'bg-rose-100 text-rose-800',
  Crítico: 'bg-rose-100 text-rose-800',
}

const ANALYSIS_DRAFT_STORAGE_KEY = 'bekai:nova-analise:draft'

export default function NovaAnalise() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { childrenProfiles, pendingAnalysis, setPendingAnalysis } = useFamilyStore()
  const [selectedChild, setSelectedChild] = useState(childrenProfiles[0]?.id || '')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([])
  const [history, setHistory] = useState<HistoryRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    try {
      const draft = window.localStorage.getItem(ANALYSIS_DRAFT_STORAGE_KEY)
      if (!draft) return
      const parsed = JSON.parse(draft)
      setStep(parsed.step || 1)
      setSelectedChild(parsed.selectedChild || '')
      setSelectedPlatforms(Array.isArray(parsed.selectedPlatforms) ? parsed.selectedPlatforms : [])
      setSelectedBehaviors(Array.isArray(parsed.selectedBehaviors) ? parsed.selectedBehaviors : [])
    } catch (err) {
      console.warn('Failed to restore analysis draft', err)
    }
  }, [])

  useEffect(() => {
    if (!selectedChild || selectedPlatforms.length === 0) return
    if (pendingAnalysis?.childId === selectedChild) return

    if (step >= 2) {
      setPendingAnalysis({
        childId: selectedChild,
        platforms: selectedPlatforms,
        behaviors: selectedBehaviors,
      })
    }
  }, [
    pendingAnalysis?.childId,
    selectedBehaviors,
    selectedChild,
    selectedPlatforms,
    setPendingAnalysis,
    step,
  ])

  useEffect(() => {
    window.localStorage.setItem(
      ANALYSIS_DRAFT_STORAGE_KEY,
      JSON.stringify({
        step,
        selectedChild,
        selectedPlatforms,
        selectedBehaviors,
      }),
    )
  }, [step, selectedChild, selectedPlatforms, selectedBehaviors])

  useEffect(() => {
    const loadHistory = async () => {
      setHistoryLoading(true)
      try {
        const records = await pb.collection('analysis_records').getList(1, 20, {
          sort: '-created',
        })
        setHistory(records.items as unknown as HistoryRecord[])
      } catch {
        // collection may not exist in some environments
      } finally {
        setHistoryLoading(false)
      }
    }

    loadHistory()
  }, [])

  useEffect(() => {
    if (!selectedChild || selectedPlatforms.length > 0 || selectedBehaviors.length > 0) return
    const previousRecord = history.find((item) => item.child === selectedChild)
    if (!previousRecord?.behavior_patterns) return

    if (Array.isArray(previousRecord.behavior_patterns.platforms)) {
      setSelectedPlatforms(previousRecord.behavior_patterns.platforms)
    }
    if (Array.isArray(previousRecord.behavior_patterns.behaviors)) {
      setSelectedBehaviors(previousRecord.behavior_patterns.behaviors)
    }
  }, [selectedChild, history, selectedPlatforms.length, selectedBehaviors.length])

  const childHistory = useMemo(
    () => (selectedChild ? history.filter((record) => record.child === selectedChild) : history),
    [history, selectedChild],
  )

  const restoreLatestPatterns = () => {
    const previousRecord = history.find((item) => item.child === selectedChild)
    if (!previousRecord?.behavior_patterns) {
      toast({
        title: 'Sem historico salvo',
        description: 'Ainda nao existe mapeamento anterior para este perfil.',
        variant: 'destructive',
      })
      return
    }

    setSelectedPlatforms(previousRecord.behavior_patterns.platforms || [])
    setSelectedBehaviors(previousRecord.behavior_patterns.behaviors || [])
    toast({
      title: 'Padroes recuperados',
      description: 'As ultimas plataformas e evidencias deste jovem foram restauradas.',
    })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="text-center sm:text-left">
        <h2 className="text-3xl font-serif font-bold text-primary">
          Novo Mapeamento de Influencia
        </h2>
        <p className="text-muted-foreground mt-2">
          Forneca dados sobre os habitos digitais para mapearmos a influencia de consumo.
        </p>
      </div>

      <Alert className="bg-primary/5 text-primary border-primary/20">
        <ShieldCheck className="w-4 h-4" />
        <AlertTitle className="text-sm font-semibold">Uso Educativo e Privacidade</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-1">
          Nenhuma conta privada e monitorada invasivamente. A analise busca mapear influencias
          algoritmicas e construir historico de acompanhamento.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between mb-8 relative max-w-xl mx-auto sm:mx-0">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-muted -z-10 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-primary -z-10 transition-all duration-700 ease-in-out rounded-full"
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-4 border-background shadow-sm ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fade-in-up">
          <MentorCard title="A Perspectiva de Curadoria">
            <div className="space-y-3 text-sm text-indigo-950/80 leading-relaxed">
              <p>
                O foco nao e a restricao, mas a substituicao intencional de conteudo superficial por
                conteudo que constroi autonomia e virtudes culturais.
              </p>
            </div>
          </MentorCard>

          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle>Passo 1: Perfil e Padroes de Resposta Digital</CardTitle>
              <CardDescription>
                Escolha o perfil, selecione as plataformas e registre as evidencias observadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Label className="text-base font-semibold flex items-center gap-2 text-primary">
                    <User className="w-5 h-5" /> Iniciar mapeamento para:
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={restoreLatestPatterns}
                    disabled={!selectedChild}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Recuperar ultimo padrao
                  </Button>
                </div>

                {childrenProfiles.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {childrenProfiles.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => setSelectedChild(child.id)}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between border-2',
                          selectedChild === child.id
                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                            : 'bg-background border-transparent hover:border-primary/30 hover:bg-background/50',
                        )}
                      >
                        <span className="font-bold">{child.name}</span>
                        {selectedChild === child.id && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                    Nenhum filho cadastrado.{' '}
                    <Link to="/setup-jovem" className="text-primary font-bold hover:underline">
                      Cadastre agora.
                    </Link>
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold">Plataformas a Reeducar</Label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((platform) => (
                    <Badge
                      key={platform}
                      variant={selectedPlatforms.includes(platform) ? 'default' : 'outline'}
                      className={cn(
                        'cursor-pointer transition-all px-3 py-1.5 text-sm',
                        selectedPlatforms.includes(platform)
                          ? 'shadow-md hover:bg-primary/90'
                          : 'hover:bg-muted',
                      )}
                      onClick={() =>
                        setSelectedPlatforms((prev) =>
                          prev.includes(platform)
                            ? prev.filter((item) => item !== platform)
                            : [...prev, platform],
                        )
                      }
                    >
                      {platform}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-base font-semibold">
                    Padroes de Resposta Digital Observados
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    As selecoes abaixo ficam salvas durante a jornada e podem ser reutilizadas para
                    comparacao futura.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {behaviorsList.map((behavior) => (
                    <div
                      key={behavior}
                      className="flex items-start space-x-3 border p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <Checkbox
                        id={behavior}
                        checked={selectedBehaviors.includes(behavior)}
                        onCheckedChange={(checked) => {
                          setSelectedBehaviors((prev) =>
                            checked ? [...prev, behavior] : prev.filter((item) => item !== behavior),
                          )
                        }}
                        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={behavior}
                        className="text-sm font-medium leading-tight cursor-pointer flex-1 group-hover:text-primary transition-colors"
                      >
                        {behavior}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-6">
              <Button
                size="lg"
                onClick={() => {
                  if (!selectedChild && childrenProfiles.length > 0) {
                    toast({
                      title: 'Selecione um perfil',
                      description: 'Escolha para qual filho sera o mapeamento.',
                      variant: 'destructive',
                    })
                    return
                  }
                  if (selectedPlatforms.length === 0) {
                    toast({
                      title: 'Selecione as plataformas',
                      description: 'Selecione ao menos uma plataforma.',
                      variant: 'destructive',
                    })
                    return
                  }
                  setPendingAnalysis({
                    childId: selectedChild,
                    platforms: selectedPlatforms,
                    behaviors: selectedBehaviors,
                  })
                  setStep(2)
                }}
              >
                Proximo Passo <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 2 && <AnaliseColeta setStep={setStep} />}
      {step === 3 && <AnaliseProcessando />}

      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-muted-foreground">
            <History className="w-4 h-4" />
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Historico de Mapeamentos
            </h3>
            {historyLoading && <span className="text-xs">Carregando...</span>}
          </div>
          {childHistory.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-sm text-muted-foreground text-center">
                Nenhum mapeamento salvo para este perfil ainda.
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {childHistory.map((rec, index) => {
                const child = childrenProfiles.find((c) => c.id === rec.child)
                const previous = childHistory[index + 1]
                const trend =
                  !previous
                    ? null
                    : rec.dq_score > previous.dq_score
                      ? 'up'
                      : rec.dq_score < previous.dq_score
                        ? 'down'
                        : 'stable'

                return (
                  <div
                    key={rec.id}
                    className="flex items-start gap-3 p-4 rounded-xl border bg-background shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="shrink-0 text-center">
                      <p className="text-2xl font-bold text-primary">{rec.dq_score ?? '--'}</p>
                      <p className="text-[10px] text-muted-foreground">DQ</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{child?.name ?? 'Jovem'}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            className={`text-[10px] px-2 py-0 border-0 ${RISK_COLORS[rec.risk_level] ?? 'bg-muted text-muted-foreground'}`}
                          >
                            {rec.risk_level}
                          </Badge>
                          {trend === 'up' && (
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {trend === 'down' && (
                            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                          )}
                          {trend === 'stable' && (
                            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {rec.insights_summary}
                      </p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1.5">
                        {new Date(rec.created).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
