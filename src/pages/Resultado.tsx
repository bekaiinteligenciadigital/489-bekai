import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  BookText,
  Bot,
  Download,
  ExternalLink,
  Fingerprint,
  Globe,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserX,
} from 'lucide-react'
import { ReportExportModal } from '@/components/parent/ReportExportModal'
import { AIResultPanel } from '@/components/AIResultPanel'
import { ScientificPreviewModal } from '@/components/ScientificPreviewModal'
import { AnaliseProcessando } from '@/components/AnaliseProcessando'
import { cn } from '@/lib/utils'
import pb from '@/lib/pocketbase/client'
import useFamilyStore from '@/stores/useFamilyStore'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  getChildCounterInterventions,
  runChildYouTubeAgent,
  type CounterIntervention,
} from '@/services/counterbalance'

type ResultLink = {
  title: string
  url: string
  type: 'video' | 'article' | 'channel' | 'playlist' | 'site'
  description?: string
  source?: string
}

type DisplayScore = {
  dimension: string
  score: number
  label: string
  description: string
  rationale?: string
}

function translateRisk(level: string) {
  const map: Record<string, string> = {
    Low: 'Baixo',
    Medium: 'Médio',
    High: 'Alto',
    Critical: 'Crítico',
    Baixo: 'Baixo',
    Moderado: 'Moderado',
    Alto: 'Alto',
    Crítico: 'Crítico',
    Critico: 'Crítico',
  }

  return map[level] || level
}

function getScoreColor(score: number) {
  if (score >= 80) return 'text-red-700 border-red-200 bg-red-50'
  if (score >= 60) return 'text-orange-700 border-orange-200 bg-orange-50'
  if (score >= 35) return 'text-amber-700 border-amber-200 bg-amber-50'
  return 'text-emerald-700 border-emerald-200 bg-emerald-50'
}

function getProgressClass(score: number) {
  if (score >= 80) return '[&>div]:bg-red-500'
  if (score >= 60) return '[&>div]:bg-orange-500'
  if (score >= 35) return '[&>div]:bg-amber-500'
  return '[&>div]:bg-emerald-500'
}

export default function Resultado() {
  const location = useLocation()
  const platforms = location.state?.platforms || ['TikTok', 'YouTube']
  const { aiResults, childrenProfiles } = useFamilyStore()

  const [exportOpen, setExportOpen] = useState(false)
  const [library, setLibrary] = useState<any[]>([])
  const [previewRef, setPreviewRef] = useState<any | null>(null)
  const [contentItems, setContentItems] = useState<any[]>([])
  const [child, setChild] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [riskProfile, setRiskProfile] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [counterInterventions, setCounterInterventions] = useState<CounterIntervention[]>([])
  const [youtubeAgentResult, setYouTubeAgentResult] = useState<{
    query?: string
    configured?: boolean
    recommendation?: CounterIntervention['recommendation_json']
    items?: NonNullable<CounterIntervention['recommendation_json']>['contentSuggestions']
  } | null>(null)
  const { toast } = useToast()

  const activeChildId =
    location.state?.childId || aiResults.analyzedChildId || childrenProfiles[0]?.id || null

  const loadData = async () => {
    try {
      const kids = await pb.collection('children').getFullList({ sort: '-created' })
      if (!kids.length) return

      const currentChild = kids.find((kid) => kid.id === activeChildId) || kids[0]
      setChild(currentChild)

      const assessments = await pb.collection('assessments').getFullList({
        filter: `child = "${currentChild.id}"`,
        sort: '-created',
      })
      setIsAnalyzing(assessments.some((entry) => entry.status === 'submitted'))

      const analyses = await pb.collection('analysis_records').getFullList({
        filter: `child = "${currentChild.id}"`,
        sort: '-created',
      })
      setAnalysis(analyses[0] || null)

      const profiles = await pb.collection('risk_profiles').getFullList({
        expand: 'assessment',
        sort: '-created',
      })
      const childProfiles = profiles.filter((entry: any) => entry.expand?.assessment?.child === currentChild.id)
      setRiskProfile(childProfiles[0] || null)

      try {
        const interventions = await getChildCounterInterventions(currentChild.id)
        setCounterInterventions(interventions)

        const latestWithSuggestions = interventions.find(
          (entry) => entry.recommendation_json?.contentSuggestions?.length,
        )

        if (latestWithSuggestions) {
          setYouTubeAgentResult({
            query: latestWithSuggestions.recommendation_json?.youtubeQuery,
            configured: latestWithSuggestions.recommendation_json?.youtubeConfigured,
            recommendation: latestWithSuggestions.recommendation_json,
            items: latestWithSuggestions.recommendation_json?.contentSuggestions || [],
          })
        } else {
          const youtubeResult = await runChildYouTubeAgent(currentChild.id, { maxResults: 6 })
          setYouTubeAgentResult({
            query: youtubeResult.query,
            configured: youtubeResult.configured,
            recommendation: youtubeResult.recommendation,
            items: youtubeResult.items || [],
          })
        }
      } catch (counterErr) {
        console.warn('Could not load YouTube/counterbalance suggestions:', counterErr)
      }

      const items = await pb.collection('content_items').getFullList({
        expand: 'creator',
        sort: '-created',
        limit: 6,
      })
      setContentItems(items)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    loadData()
    const fetchLib = async () => {
      try {
        const data = await pb.collection('scientific_library').getFullList({ sort: '-created' })
        setLibrary(data)
      } catch (_err) {
        toast({
          title: 'Erro de conexão',
          description: 'Não foi possível carregar as referências científicas.',
          variant: 'destructive',
        })
      }
    }
    fetchLib()
  }, [toast, activeChildId])

  useRealtime('assessments', loadData)
  useRealtime('analysis_records', loadData)
  useRealtime('risk_profiles', loadData)

  const getEvidenceColor = (level: string) => {
    switch (level) {
      case 'Meta-análise':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'RCT':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Coorte':
        return 'bg-teal-100 text-teal-800 border-teal-300'
      case 'Relato':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'Opinião':
        return 'bg-slate-100 text-slate-800 border-slate-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  if (isAnalyzing) {
    return (
      <div className="mx-auto mt-20 max-w-3xl p-6">
        <AnaliseProcessando />
      </div>
    )
  }

  const modalChild = child || {
    id: 'child-1',
    name: 'Perfil analisado',
    birth_date: '',
    parent: '',
  }

  const analysisResult = aiResults.analysisResult || null
  const riskLevel = analysis?.risk_level || 'High'
  const translatedRisk = translateRisk(riskLevel)
  const rationaleJson = riskProfile?.rationale_json || {}

  const recommendation =
    youtubeAgentResult?.recommendation || counterInterventions[0]?.recommendation_json || null

  const youtubeSuggestions =
    recommendation?.contentSuggestions || youtubeAgentResult?.items || []

  const youtubeLinks: ResultLink[] = youtubeSuggestions
    .filter((item) => item?.url && item?.title)
    .map((item) => ({
      title: item.title,
      url: item.url as string,
      type:
        item.resourceType === 'channel'
          ? 'channel'
          : item.resourceType === 'playlist'
            ? 'playlist'
            : item.resourceType === 'video'
              ? 'video'
              : 'site',
      description: item.description,
      source: item.channelTitle || item.platform,
    }))

  const fallbackCurationLinks: ResultLink[] = [
    {
      title: 'Rotina saudável para adolescentes',
      url: 'https://www.youtube.com/results?search_query=rotina+saudavel+adolescentes',
      type: 'video',
    },
    {
      title: 'Esportes e disciplina para jovens',
      url: 'https://www.youtube.com/results?search_query=esportes+disciplina+jovens',
      type: 'video',
    },
    {
      title: 'Ciência e curiosidade para adolescentes',
      url: 'https://www.youtube.com/results?search_query=ciencia+para+adolescentes',
      type: 'video',
    },
  ]

  const curatorLinks = youtubeLinks.length > 0 ? youtubeLinks : fallbackCurationLinks

  const displayScores: DisplayScore[] = useMemo(() => {
    if (analysisResult?.scores?.length) {
      return analysisResult.scores.map((score) => {
        const normalized = score.dimension
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()

        let rationale = ''
        if (normalized.includes('social') || normalized.includes('comparacao')) {
          rationale = rationaleJson?.exposure?.description || ''
        } else if (
          normalized.includes('algoritmica') ||
          normalized.includes('estimula') ||
          normalized.includes('atencao')
        ) {
          rationale = rationaleJson?.distortion?.description || ''
        } else if (normalized.includes('sono') || normalized.includes('ritmo')) {
          rationale = rationaleJson?.instability?.description || ''
        } else if (normalized.includes('protecao')) {
          rationale =
            recommendation?.algorithmGoal ||
            'O acompanhamento familiar, a rotina e a curadoria positiva são os principais vetores de proteção.'
        }

        return {
          dimension: score.dimension,
          score: score.score,
          label: translateRisk(score.label),
          description: score.description,
          rationale,
        }
      })
    }

    return [
      {
        dimension: 'Exposição e comparação',
        score: riskProfile?.exposure_score || 0,
        label: translateRisk(riskLevel),
        description: 'Score derivado do perfil de risco persistido.',
        rationale: rationaleJson?.exposure?.description || '',
      },
      {
        dimension: 'Distorção cognitiva',
        score: riskProfile?.distortion_score || 0,
        label: translateRisk(riskLevel),
        description: 'Score derivado do perfil de risco persistido.',
        rationale: rationaleJson?.distortion?.description || '',
      },
      {
        dimension: 'Instabilidade e ritmo',
        score: riskProfile?.instability_score || 0,
        label: translateRisk(riskLevel),
        description: 'Score derivado do perfil de risco persistido.',
        rationale: rationaleJson?.instability?.description || '',
      },
    ].filter((item) => item.score > 0)
  }, [analysisResult, rationaleJson, recommendation, riskLevel, riskProfile])

  const sourceLabel =
    recommendation?.contentSource === 'youtube_api'
      ? 'YouTube Data API'
      : recommendation?.contentSource === 'manual_fallback'
        ? 'Curadoria manual de fallback'
        : youtubeAgentResult?.configured
          ? 'Agente YouTube configurado'
          : 'Curadoria local'

  const renderLinks = (links: ResultLink[], colorClass: string) => (
    <ul className="mt-3 space-y-2">
      {links.map((link, idx) => (
        <li key={idx}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'group flex items-start gap-2 text-xs transition-colors hover:underline',
              colorClass,
            )}
          >
            <span className="rounded border bg-background p-1 text-muted-foreground shadow-sm transition-colors group-hover:text-current">
              {link.type === 'video' ? (
                <PlayCircle className="h-3 w-3" />
              ) : link.type === 'article' ? (
                <BookOpen className="h-3 w-3" />
              ) : (
                <Globe className="h-3 w-3" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{link.title}</span>
              {link.source ? (
                <span className="block truncate text-[11px] opacity-75">{link.source}</span>
              ) : null}
            </span>
            <ExternalLink className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in pb-10">
      <div className="-mb-4">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex flex-col justify-between gap-4 border-b bg-background pb-4 pt-2 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary">Mapeamento e Orientação</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted-foreground">
              Análise de influência gerada para {child?.name || 'Perfil'}
            </p>
            <Badge
              variant="outline"
              className="ml-1 border-rose-300 bg-rose-100 font-bold text-rose-800"
            >
              <UserX className="mr-1 h-3 w-3" /> Risco {translatedRisk}
            </Badge>
          </div>
          {platforms.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {platforms.map((platform: string) => (
                <Badge
                  key={platform}
                  variant="secondary"
                  className="border-secondary/50 bg-secondary/30 text-secondary-foreground shadow-sm"
                >
                  {platform}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:mt-0 sm:flex-row">
          <Button variant="outline" size="lg" onClick={() => setExportOpen(true)}>
            <Download className="mr-2 h-5 w-5" /> Exportar Relatório
          </Button>
          <Button asChild size="lg" className="shadow-md transition-all hover:shadow-lg">
            <Link to="/plano">
              <Bot className="mr-2 h-5 w-5" /> Ver Plano de Ação
            </Link>
          </Button>
        </div>
      </div>

      <ReportExportModal child={modalChild} open={exportOpen} onOpenChange={setExportOpen} />

      <Alert className="mb-6 border-amber-200 bg-amber-50 text-amber-900 shadow-sm animate-fade-in-down">
        <ShieldCheck className="h-5 w-5 text-amber-600" />
        <AlertTitle className="flex items-center gap-2 text-base font-bold">
          Aviso Legal e Educacional
        </AlertTitle>
        <AlertDescription className="mt-1 text-sm leading-relaxed">
          Esta ferramenta possui caráter estritamente educativo e informativo, não substituindo o
          suporte e a avaliação clínica final de profissionais de saúde. Os dados e mapeamentos
          apresentados destinam-se exclusivamente ao suporte à decisão clínica.
        </AlertDescription>
      </Alert>

      {(riskLevel === 'High' || riskLevel === 'Critical') && (
        <Alert className="border-rose-200 bg-rose-50 text-rose-900 shadow-sm animate-fade-in-down">
          <Stethoscope className="h-5 w-5 text-rose-600" />
          <AlertTitle className="flex items-center gap-2 text-base font-bold">
            Indicadores de Risco Severo Identificados
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm leading-relaxed">
            O motor detectou menções e interações associadas a padrões de conteúdo de risco severo.
            Recomendamos buscar apoio de profissionais de saúde especializados paralelamente ao
            rebalanceamento digital.
          </AlertDescription>
        </Alert>
      )}

      {analysisResult && (
        <AIResultPanel
          analysisResult={analysisResult}
          childName={
            childrenProfiles.find((entry) => entry.id === aiResults.analyzedChildId)?.name ||
            child?.name ||
            'Jovem analisado'
          }
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Activity className="h-5 w-5 text-secondary" /> Leitura Operacional do Agente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Fonte atual
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">{sourceLabel}</p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Query usada
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {recommendation?.youtubeQuery || youtubeAgentResult?.query || 'Não definida'}
                </p>
              </div>
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Plataforma priorizada
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {recommendation?.platform || platforms[0] || 'Não informada'}
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-background p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Resumo para o responsável
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {recommendation?.guardianSummary ||
                  analysis?.insights_summary ||
                  analysisResult?.summary ||
                  'O agente ainda não consolidou um resumo operacional específico para este caso.'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-primary/5 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Narrativa de contraponto
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {recommendation?.counterNarrative ||
                    'Ainda não há narrativa específica gerada para este perfil.'}
                </p>
              </div>
              <div className="rounded-xl border bg-emerald-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  Objetivo algorítmico
                </p>
                <p className="mt-2 text-sm leading-relaxed text-foreground">
                  {recommendation?.algorithmGoal ||
                    'Reequilibrar gradualmente o repertório consumido com estímulos mais saudáveis e previsíveis.'}
                </p>
              </div>
            </div>

            {recommendation?.recommendedActions?.length ? (
              <div className="rounded-xl border bg-muted/10 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Ações recomendadas agora
                </p>
                <ul className="mt-3 space-y-2">
                  {recommendation.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bot className="h-5 w-5 text-secondary" /> Curadoria e Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-xl border bg-emerald-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                Mensagem sugerida
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {recommendation?.deliveryMessage ||
                  'Ainda não há uma mensagem operacional específica pronta para envio.'}
              </p>
            </div>

            <div className="rounded-xl border bg-background p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Conteúdos positivos sugeridos
              </p>
              {renderLinks(curatorLinks, 'text-emerald-700')}
            </div>

            <div className="rounded-xl border bg-background p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Evidências digitais reais carregadas
              </p>
              <div className="mt-3 space-y-2">
                {contentItems.length > 0 ? (
                  contentItems.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-muted/20 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {item.title || item.raw_text?.slice(0, 64) || 'Registro sem título'}
                        </span>
                        <Badge variant="secondary" className="text-[10px]">
                          {item.expand?.creator?.platform || 'Origem não identificada'}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma evidência digital real foi sincronizada neste ambiente ainda.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {displayScores.length > 0 ? (
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 font-serif text-2xl font-bold text-primary">
            <Activity className="h-6 w-6 text-secondary" /> Dimensões de risco do caso atual
          </h3>

          <div className="grid gap-4 lg:grid-cols-2">
            {displayScores.map((score) => (
              <Card key={score.dimension} className="shadow-sm">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-foreground">{score.dimension}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{score.description}</p>
                    </div>
                    <Badge variant="outline" className={cn('font-bold', getScoreColor(score.score))}>
                      {score.label}
                    </Badge>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Score</span>
                      <span className="font-bold text-foreground">{score.score}/100</span>
                    </div>
                    <Progress value={score.score} className={cn('h-2 bg-muted', getProgressClass(score.score))} />
                  </div>

                  <div className="rounded-lg border bg-muted/20 p-3">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                      <Fingerprint className="h-3.5 w-3.5" /> Leitura objetiva
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-foreground">
                      {score.rationale || 'Sem justificativa específica persistida para esta dimensão.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 border-t pt-8 animate-fade-in">
        <h3 className="mb-6 flex items-center gap-3 font-serif text-2xl font-bold text-primary">
          <BookText className="h-6 w-6 text-secondary" /> Referências Científicas
        </h3>
        {library.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
            Referência em revisão bibliográfica.
          </p>
        ) : (
          <div className="grid gap-4">
            {library.map((ref) => (
              <Card key={ref.id} className="border-border/50 shadow-sm transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="flex-1 space-y-1.5">
                    <h4 className="text-base font-bold leading-tight text-foreground">{ref.title}</h4>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {ref.summary}
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-start gap-3 sm:w-auto sm:items-end">
                    <Badge
                      variant="outline"
                      className={cn('whitespace-nowrap', getEvidenceColor(ref.evidence_level))}
                    >
                      {ref.evidence_level}
                    </Badge>
                    <div className="flex w-full flex-col gap-2">
                      <Button
                        onClick={() => setPreviewRef(ref)}
                        variant="secondary"
                        size="sm"
                        className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        Pré-visualizar <BookText className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                      {ref.content_link ? (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full border-primary/20 hover:bg-primary/5"
                        >
                          <a href={ref.content_link} target="_blank" rel="noopener noreferrer">
                            Estudo Original <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ScientificPreviewModal
        open={!!previewRef}
        onOpenChange={(open) => !open && setPreviewRef(null)}
        reference={previewRef}
      />
    </div>
  )
}
