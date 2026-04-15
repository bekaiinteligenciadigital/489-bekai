import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  BrainCircuit,
  Scale,
  Stethoscope,
  UserX,
  Bot,
  ArrowLeft,
  Activity,
  Fingerprint,
  Microscope,
  Download,
  BookText,
  ExternalLink,
  PlayCircle,
  BookOpen,
  Globe,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { ResultadoMentorPanel } from '@/components/ResultadoMentorPanel'
import { ReportExportModal } from '@/components/parent/ReportExportModal'
import { AIResultPanel } from '@/components/AIResultPanel'
import useFamilyStore from '@/stores/useFamilyStore'
import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { ScientificPreviewModal } from '@/components/ScientificPreviewModal'
import { useRealtime } from '@/hooks/use-realtime'
import { AnaliseProcessando } from '@/components/AnaliseProcessando'
import { TermTooltip } from '@/components/ui/glossary-tooltip'
import { cn } from '@/lib/utils'

export default function Resultado() {
  const location = useLocation()
  const platforms = location.state?.platforms || ['TikTok', 'YouTube']
  const { aiResults, childrenProfiles } = useFamilyStore()

  const [exportOpen, setExportOpen] = useState(false)
  const [library, setLibrary] = useState<any[]>([])
  const [previewRef, setPreviewRef] = useState<any | null>(null)
  const [contentItems, setContentItems] = useState<any[]>([])
  const { toast } = useToast()

  const [child, setChild] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [riskProfile, setRiskProfile] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const loadData = async () => {
    try {
      const kids = await pb.collection('children').getFullList({ sort: '-created' })
      if (kids.length > 0) {
        const currentChild = kids[0]
        setChild(currentChild)

        // Check if any assessment is currently submitted (analyzing)
        const assessments = await pb.collection('assessments').getFullList({
          filter: `child = "${currentChild.id}"`,
          sort: '-created',
        })
        const processing = assessments.some((a) => a.status === 'submitted')
        setIsAnalyzing(processing)

        const analyses = await pb
          .collection('analysis_records')
          .getFullList({ filter: `child = "${currentChild.id}"`, sort: '-created' })
        setAnalysis(analyses[0] || null)

        const profiles = await pb
          .collection('risk_profiles')
          .getFullList({ expand: 'assessment', sort: '-created' })
        const childProfiles = profiles.filter(
          (p: any) => p.expand?.assessment?.child === currentChild.id,
        )
        setRiskProfile(childProfiles[0] || null)

        const items = await pb.collection('content_items').getFullList({
          expand: 'creator',
          sort: '-created',
          limit: 10,
        })
        setContentItems(items)
      }
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
      } catch (err) {
        toast({
          title: 'Erro de conexão',
          description: 'Não foi possível carregar as referências científicas.',
          variant: 'destructive',
        })
      }
    }
    fetchLib()
  }, [toast])

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
      <div className="max-w-3xl mx-auto mt-20 p-6">
        <AnaliseProcessando />
      </div>
    )
  }

  const modalChild = child || {
    id: 'child-1',
    name: 'Perfil Analisado',
    birth_date: '',
    parent: '',
  }

  const exposureScore = riskProfile?.exposure_score || 85
  const distortionScore = riskProfile?.distortion_score || 70
  const instabilityScore = riskProfile?.instability_score || 75
  const rationaleJson = riskProfile?.rationale_json || {}
  const riskLevel = analysis?.risk_level || 'High'

  const translateRisk = (level: string) => {
    const map: Record<string, string> = {
      Low: 'Baixo',
      Medium: 'Médio',
      High: 'Alto',
      Critical: 'Crítico',
    }
    return map[level] || level
  }
  const translatedRisk = translateRisk(riskLevel)

  const propositoLinks = [
    { title: 'Huberman Lab - Otimização de Rotina', url: 'https://youtube.com', type: 'video' },
    {
      title: 'Eslen Delanogare - Neurociência e Disciplina',
      url: 'https://youtube.com',
      type: 'channel',
    },
    { title: 'Jocko Podcast - Disciplina é Liberdade', url: 'https://youtube.com', type: 'video' },
    {
      title: 'Artigo: O poder dos hábitos na juventude',
      url: 'https://example.com',
      type: 'article',
    },
    { title: 'David Goggins - Mentalidade de Ferro', url: 'https://youtube.com', type: 'video' },
  ]

  const valorLinks = [
    { title: 'Brasil Paralelo - A Primeira Arte', url: 'https://youtube.com', type: 'video' },
    {
      title: 'Jordan Peterson - Assuma Responsabilidade',
      url: 'https://youtube.com',
      type: 'video',
    },
    { title: 'Guia de Cidadania e Voluntariado', url: 'https://example.com', type: 'article' },
    {
      title: 'Instituto Augusto Cury - Gestão da Emoção',
      url: 'https://youtube.com',
      type: 'channel',
    },
    { title: 'Simon Sinek - O Jogo Infinito', url: 'https://youtube.com', type: 'video' },
  ]

  const insightsLinks = [
    {
      title: 'Center for Humane Technology - Algoritmos',
      url: 'https://humanetech.com',
      type: 'site',
    },
    {
      title: 'The Social Dilemma - Impacto Algorítmico',
      url: 'https://thesocialdilemma.com',
      type: 'site',
    },
    {
      title: 'Jonathan Haidt - Redes Sociais e Ansiedade',
      url: 'https://youtube.com',
      type: 'video',
    },
    { title: 'Estudo: Dopamina e Vídeos Curtos', url: 'https://example.com', type: 'article' },
    { title: 'Nature: Redução de Atenção Sustentada', url: 'https://nature.com', type: 'article' },
  ]

  const protecaoLinks = [
    {
      title: 'Child Mind Institute - Guias de Resiliência',
      url: 'https://childmind.org',
      type: 'site',
    },
    {
      title: 'TED: Como construir resiliência emocional',
      url: 'https://youtube.com',
      type: 'video',
    },
    {
      title: 'Artigo: A importância do jantar em família',
      url: 'https://example.com',
      type: 'article',
    },
    {
      title: 'Guia Prático de Desintoxicação Digital',
      url: 'https://example.com',
      type: 'article',
    },
    { title: 'Podcast: Criando filhos antifrágeis', url: 'https://youtube.com', type: 'video' },
  ]

  const renderLinks = (links: any[], colorClass: string) => (
    <ul className="space-y-2 mt-3">
      {links.map((link, idx) => (
        <li key={idx}>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex items-center gap-2 text-xs hover:underline transition-colors group',
              colorClass,
            )}
          >
            <span className="bg-background shadow-sm p-1 rounded text-muted-foreground group-hover:text-current transition-colors border">
              {link.type === 'video' ? (
                <PlayCircle className="w-3 h-3" />
              ) : link.type === 'article' ? (
                <BookOpen className="w-3 h-3" />
              ) : (
                <Globe className="w-3 h-3" />
              )}
            </span>
            <span className="truncate flex-1 font-medium">{link.title}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10 animate-fade-in">
      <div className="-mb-4">
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
          </Link>
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-background pt-2 pb-4 border-b">
        <div>
          <h2 className="text-3xl font-serif font-bold text-primary">Mapeamento e Orientação</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-muted-foreground text-sm">
              Análise de influência gerada para {child?.name || 'Perfil'}
            </p>
            <Badge
              variant="outline"
              className="bg-rose-100 text-rose-800 border-rose-300 font-bold ml-1"
            >
              <UserX className="w-3 h-3 mr-1" />{' '}
              <TermTooltip term="Risco Expositivo">Risco {translatedRisk}</TermTooltip>
            </Badge>
          </div>
          {platforms.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {platforms.map((p: string) => (
                <Badge
                  key={p}
                  variant="secondary"
                  className="bg-secondary/30 text-secondary-foreground border-secondary/50 shadow-sm"
                >
                  {p}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-0">
          <Button variant="outline" size="lg" onClick={() => setExportOpen(true)}>
            <Download className="w-5 h-5 mr-2" /> Exportar Relatório
          </Button>
          <Button asChild size="lg" className="shadow-md hover:shadow-lg transition-all">
            <Link to="/plano">
              <Bot className="w-5 h-5 mr-2" /> Ver Plano de Ação
            </Link>
          </Button>
        </div>
      </div>

      <ReportExportModal child={modalChild} open={exportOpen} onOpenChange={setExportOpen} />

      <Alert className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm animate-fade-in-down mb-6">
        <ShieldCheck className="w-5 h-5 text-amber-600" />
        <AlertTitle className="text-base font-bold flex items-center gap-2">
          Aviso Legal e Educacional
        </AlertTitle>
        <AlertDescription className="mt-1 text-sm leading-relaxed">
          Esta ferramenta possui caráter estritamente educativo e informativo, não substituindo o
          suporte e a avaliação clínica final de profissionais de saúde (psicólogos/psiquiatras). Os
          dados e mapeamentos apresentados destinam-se exclusivamente ao Suporte à Decisão Clínica.
        </AlertDescription>
      </Alert>

      {(riskLevel === 'High' || riskLevel === 'Critical') && (
        <Alert className="bg-rose-50 border-rose-200 text-rose-900 shadow-sm animate-fade-in-down">
          <Stethoscope className="w-5 h-5 text-rose-600" />
          <AlertTitle className="text-base font-bold flex items-center gap-2">
            Indicadores de Risco Severo Identificados
          </AlertTitle>
          <AlertDescription className="mt-2 text-sm leading-relaxed">
            O motor detectou menções e interações associadas a{' '}
            <strong>padrões de conteúdo de risco severo</strong>. Recomendamos buscar{' '}
            <strong>apoio de profissionais de saúde especializados</strong> paralelamente ao
            rebalanceamento digital.
          </AlertDescription>
        </Alert>
      )}

      {/* ── AGENTE DE RESULTADO (IA) ── */}
      {aiResults.analysisResult && (
        <AIResultPanel
          analysisResult={aiResults.analysisResult}
          childName={
            childrenProfiles.find((c) => c.id === aiResults.analyzedChildId)?.name ||
            child?.name ||
            'Jovem Analisado'
          }
        />
      )}

      <div className="space-y-6">
        <h3 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
          <Activity className="w-6 h-6 text-secondary" /> Detalhamento de Riscos Identificados
        </h3>

        {/* Risk 1 */}
        <Card className="shadow-md border-l-4 border-l-destructive overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-muted/10 border-b md:border-b-0 md:border-r border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <HeartPulse className="w-5 h-5 text-destructive" />
                <span className="font-semibold uppercase tracking-wider text-xs">
                  Risco de Autoimagem
                </span>
              </div>
              <h4 className="text-xl font-bold text-foreground mb-1">Exposição e Comparação</h4>
              <div className="text-3xl font-bold text-destructive mb-3">{exposureScore}%</div>
              <Progress value={exposureScore} className="h-2 [&>div]:bg-destructive mb-6" />

              <Button
                variant="outline"
                className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                onClick={() => {
                  const ref = library.find((l) => l.axis === 'Psicologia') || library[0]
                  if (ref) setPreviewRef(ref)
                }}
              >
                <BookText className="w-4 h-4 mr-2" /> Bases Científicas
              </Button>
            </div>
            <div className="p-6 md:w-2/3 space-y-5">
              <div>
                <h5 className="text-sm font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> Justificativa Objetiva
                </h5>
                <div className="text-sm text-foreground leading-relaxed bg-background p-4 rounded-lg border shadow-sm">
                  {rationaleJson?.exposure?.description ||
                    'Distorção da autoimagem baseada em padrões algorítmicos. O consumo repetido de conteúdos focados em estética inatingível, filtros de beleza artificial e vídeos de comparação social afeta diretamente a percepção corporal e a autoestima do jovem.'}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <Microscope className="w-4 h-4" /> Evidências Digitais (Amostra)
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {contentItems.length > 0 ? (
                    contentItems.slice(0, 2).map((item, i) => (
                      <div
                        key={item.id || i}
                        className="flex items-center justify-between p-3 bg-muted/30 border rounded-md text-sm"
                      >
                        <span className="font-medium truncate mr-4">
                          {item.title || item.raw_text?.substring(0, 40) + '...'}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.expand?.creator?.platform || 'Rede Social'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-destructive text-destructive bg-destructive/10"
                          >
                            Alto Impacto
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted/30 border rounded-md text-sm">
                      <span className="font-medium">Trend de Transformação Facial (Filtros)</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          TikTok
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-destructive text-destructive bg-destructive/10"
                        >
                          Alto Impacto
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk 2 */}
        <Card className="shadow-md border-l-4 border-l-amber-500 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-muted/10 border-b md:border-b-0 md:border-r border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <BrainCircuit className="w-5 h-5 text-amber-500" />
                <span className="font-semibold uppercase tracking-wider text-xs">
                  Risco Cognitivo
                </span>
              </div>
              <h4 className="text-xl font-bold text-foreground mb-1">Distorção Cognitiva</h4>
              <div className="text-3xl font-bold text-amber-500 mb-3">{distortionScore}%</div>
              <Progress value={distortionScore} className="h-2 [&>div]:bg-amber-500 mb-6" />

              <Button
                variant="outline"
                className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                onClick={() => {
                  const ref =
                    library.find((l) => l.axis === 'Neurociência') || library[1] || library[0]
                  if (ref) setPreviewRef(ref)
                }}
              >
                <BookText className="w-4 h-4 mr-2" /> Bases Científicas
              </Button>
            </div>
            <div className="p-6 md:w-2/3 space-y-5">
              <div>
                <h5 className="text-sm font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> Justificativa Objetiva
                </h5>
                <div className="text-sm text-foreground leading-relaxed bg-background p-4 rounded-lg border shadow-sm">
                  {rationaleJson?.distortion?.description ||
                    'Identificamos um padrão de conformismo e passividade no consumo digital. Os algoritmos estão priorizando uma hiper-estimulação rápida (vídeos curtos em loop), o que reduz progressivamente a capacidade de atenção sustentada e o pensamento crítico.'}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <Microscope className="w-4 h-4" /> Evidências Digitais (Amostra)
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {contentItems.length > 2 ? (
                    contentItems.slice(2, 4).map((item, i) => (
                      <div
                        key={item.id || i}
                        className="flex items-center justify-between p-3 bg-muted/30 border rounded-md text-sm"
                      >
                        <span className="font-medium truncate mr-4">
                          {item.title || item.raw_text?.substring(0, 40) + '...'}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.expand?.creator?.platform || 'Rede Social'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-amber-500 text-amber-700 bg-amber-50"
                          >
                            Atenção Curta
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted/30 border rounded-md text-sm">
                      <span className="font-medium">Cortes de Gameplay com vídeos simultâneos</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          YouTube
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-amber-500 text-amber-700 bg-amber-50"
                        >
                          Passividade
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Risk 3 */}
        <Card className="shadow-md border-l-4 border-l-destructive overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-1/3 bg-muted/10 border-b md:border-b-0 md:border-r border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <Scale className="w-5 h-5 text-destructive" />
                <span className="font-semibold uppercase tracking-wider text-xs">
                  Risco Comportamental
                </span>
              </div>
              <h4 className="text-xl font-bold text-foreground mb-1">
                Instabilidade / Polarização
              </h4>
              <div className="text-3xl font-bold text-destructive mb-3">{instabilityScore}%</div>
              <Progress value={instabilityScore} className="h-2 [&>div]:bg-destructive mb-6" />

              <Button
                variant="outline"
                className="w-full bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
                onClick={() => {
                  const ref =
                    library.find((l) => l.axis === 'Psiquiatria') || library[2] || library[0]
                  if (ref) setPreviewRef(ref)
                }}
              >
                <BookText className="w-4 h-4 mr-2" /> Bases Científicas
              </Button>
            </div>
            <div className="p-6 md:w-2/3 space-y-5">
              <div>
                <h5 className="text-sm font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> Justificativa Objetiva
                </h5>
                <div className="text-sm text-foreground leading-relaxed bg-background p-4 rounded-lg border shadow-sm">
                  {rationaleJson?.instability?.description ? (
                    <div>{rationaleJson.instability.description}</div>
                  ) : (
                    <div>
                      Aumento no risco de instabilidade emocional devido à exposição contínua a{' '}
                      <TermTooltip term="Narrativa Antagonista">Narrativa Antagonista</TermTooltip>.
                      O jovem está consumindo retóricas de "nós contra eles", o que frequentemente
                      gera ansiedade social, isolamento e uma visão de mundo hiper-polarizada.
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h5 className="text-sm font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                  <Microscope className="w-4 h-4" /> Evidências Digitais (Amostra)
                </h5>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {contentItems.length > 4 ? (
                    contentItems.slice(4, 6).map((item, i) => (
                      <div
                        key={item.id || i}
                        className="flex items-center justify-between p-3 bg-muted/30 border rounded-md text-sm"
                      >
                        <span className="font-medium truncate mr-4">
                          {item.title || item.raw_text?.substring(0, 40) + '...'}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.expand?.creator?.platform || 'Rede Social'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-[10px] border-destructive text-destructive bg-destructive/10"
                          >
                            Polarização
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-muted/30 border rounded-md text-sm">
                      <span className="font-medium">Cortes de Opinião Radical (Redpill/Sigma)</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          Instagram
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-[10px] border-destructive text-destructive bg-destructive/10"
                        >
                          Risco Crítico
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <ResultadoMentorPanel platforms={platforms} />

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-l-4 border-l-destructive shadow-md hover:shadow-lg transition-shadow flex flex-col">
          <CardHeader className="bg-destructive/5 pb-4 border-b border-destructive/10">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-6 h-6" />
              <CardTitle className="text-lg">Insights e Padrões</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6 flex-1">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-destructive">
                Resumo da Inteligência
              </span>
              <h3 className="font-bold text-xl text-foreground">Comportamento Analisado</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis?.insights_summary ||
                  'Consumo de vídeos ultra-rápidos e comportamentos anômalos detectados. A arquitetura de escolhas do algoritmo está favorecendo a hiper-estimulação e o engajamento reativo, diminuindo a capacidade de atenção sustentada.'}
              </p>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Referências Práticas e Teóricas
                </span>
                {renderLinks(insightsLinks, 'text-destructive')}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-destructive">
                Fatores de Proteção
              </span>
              <h3 className="font-bold text-xl text-foreground">
                Score de Resiliência: {riskProfile?.protective_score || 30}/100
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A capacidade atual de lidar com influências nocivas é limitada. O score{' '}
                {riskProfile?.protective_score || 30} indica uma necessidade urgente de intervenção
                para reforçar vínculos reais e construir novas rotinas offline estruturadas.
              </p>
              <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Recomendações e Lógica
                </span>
                {renderLinks(protecaoLinks, 'text-destructive')}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-shadow flex flex-col">
          <CardHeader className="bg-emerald-50 pb-4 border-b border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="w-6 h-6" />
              <CardTitle className="text-lg">Curadoria Positiva</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6 flex-1">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-600">
                Sugestão de Curadoria: Propósito e Foco
              </span>
              <h3 className="font-bold text-xl text-emerald-900">Ciência da Rotina & Disciplina</h3>
              <p className="text-sm text-emerald-800/80 leading-relaxed">
                Apresente conteúdos com apelo estético jovem sobre esportes, mentalidade prática,
                superação de desafios e responsabilidade pessoal para reconfigurar o algoritmo
                positivamente.
              </p>
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700/70">
                  Exemplos Práticos para Consumo
                </span>
                {renderLinks(propositoLinks, 'text-emerald-700')}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-600">
                Sugestão de Curadoria: Valor Relacional
              </span>
              <h3 className="font-bold text-xl text-emerald-900">Cidadania e Vínculos</h3>
              <p className="text-sm text-emerald-800/80 leading-relaxed">
                Incentive documentários profundos e recortes de podcasts que valorizem a
                estabilidade familiar, o pensamento crítico de longo prazo e o respeito genuíno na
                comunidade.
              </p>
              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700/70">
                  Exemplos Práticos para Consumo
                </span>
                {renderLinks(valorLinks, 'text-emerald-700')}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-8 border-t mt-8 animate-fade-in">
        <h3 className="text-2xl font-serif font-bold text-primary mb-6 flex items-center gap-3">
          <BookText className="w-6 h-6 text-secondary" /> Referências Científicas
        </h3>
        {library.length === 0 ? (
          <p className="text-muted-foreground bg-muted/30 p-4 rounded-lg border text-center text-sm">
            Referência em revisão bibliográfica
          </p>
        ) : (
          <div className="grid gap-4">
            {library.map((ref) => (
              <Card
                key={ref.id}
                className="shadow-sm border-border/50 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1.5 flex-1">
                    <h4 className="font-bold text-base text-foreground leading-tight">
                      {ref.title}
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {ref.summary}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 items-start sm:items-end shrink-0 w-full sm:w-auto">
                    <Badge
                      variant="outline"
                      className={`whitespace-nowrap ${getEvidenceColor(ref.evidence_level)}`}
                    >
                      {ref.evidence_level}
                    </Badge>
                    <div className="flex flex-col gap-2 w-full">
                      <Button
                        onClick={() => setPreviewRef(ref)}
                        variant="secondary"
                        size="sm"
                        className="w-full bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        Pré-visualizar <BookText className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                      {ref.content_link && (
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="w-full border-primary/20 hover:bg-primary/5"
                        >
                          <a href={ref.content_link} target="_blank" rel="noopener noreferrer">
                            Estudo Original <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                          </a>
                        </Button>
                      )}
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
