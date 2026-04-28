import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  BookOpenText,
  Search,
  BookA,
  ArrowRight,
  Loader2,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { loadModuleProgress, saveModuleProgress } from '@/services/moduleProgress'

const FALLBACK_CHAPTERS = [
  {
    id: 'f1',
    number: 1,
    title: 'Introducao ao BekAI e Literacia Digital',
    content:
      '<p>O BekAI ajuda responsaveis a compreenderem e orientarem o impacto das redes sociais no desenvolvimento de criancas e adolescentes.</p><p>Literacia digital vai alem do uso de tecnologia: trata-se da capacidade critica de consumir, avaliar e produzir conteudo digital de forma consciente e saudavel.</p>',
    route_reference: '/monitoramento',
  },
  {
    id: 'f2',
    number: 2,
    title: 'Como Realizar o Mapeamento de Influencia',
    content:
      '<p>O Mapeamento de Influencia e o primeiro passo do processo BekAI.</p><ol class="list-decimal pl-6 space-y-2 mt-2"><li>Selecionar o perfil do jovem</li><li>Indicar as plataformas de maior uso</li><li>Marcar comportamentos observados</li><li>Aguardar o Agente BekAI gerar o perfil</li></ol>',
    route_reference: '/analise',
  },
  {
    id: 'f3',
    number: 3,
    title: 'Entendendo o DQ Score e Niveis de Risco',
    content:
      '<p>O Quociente Digital e uma pontuacao de 0 a 100 que mede a qualidade do consumo digital.</p><p>Os niveis de risco sao: Baixo, Moderado, Alto e Critico. Cada nivel determina a urgencia da intervencao.</p>',
    route_reference: '/resultado',
  },
  {
    id: 'f4',
    number: 4,
    title: 'Agente Autonomo: Como Funciona',
    content:
      '<p>O Agente Autonomo BekAI gera planos de acao personalizados baseados no perfil de influencia digital.</p><p>Ele utiliza a tecnica de Equivalencia Estetica para substituir conteudos nocivos por conteudos construtivos.</p>',
    route_reference: '/agente-autonomo',
  },
  {
    id: 'f5',
    number: 5,
    title: 'Configurando Alertas e Notificacoes',
    content:
      '<p>O BekAI suporta alertas via WhatsApp e Telegram. Configure nas Configuracoes para receber notificacoes quando riscos criticos forem detectados.</p>',
    route_reference: '/config',
  },
]

const FALLBACK_GLOSSARY = [
  {
    id: 'g1',
    term: 'DQ Score (Quociente Digital)',
    definition:
      'Pontuacao de 0 a 100 que representa a qualidade do consumo digital de um jovem.',
  },
  {
    id: 'g2',
    term: 'Vaping de Atencao',
    definition:
      'Padrao de consumo passivo e ininterrupto de videos curtos, com absorcao acelerada de informacoes rasas.',
  },
  {
    id: 'g3',
    term: 'Equivalencia Estetica',
    definition:
      'Tecnica do Agente BekAI que substitui conteudos nocivos por conteudos de qualidade visual equivalente, mas com narrativas construtivas.',
  },
  {
    id: 'g4',
    term: 'BDIC',
    definition:
      'Base de Dados de Inteligencia Clinica, com criadores, conteudos e referencias cientificas curadas.',
  },
]

export default function Manual() {
  const [chapters, setChapters] = useState<any[]>([])
  const [glossary, setGlossary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchGlossary, setSearchGlossary] = useState('')
  const [viewedChapters, setViewedChapters] = useState<string[]>([])
  const [viewedGlossary, setViewedGlossary] = useState<string[]>([])

  useEffect(() => {
    let mounted = true

    const fetchManualData = async () => {
      try {
        const [chaps, terms, progress] = await Promise.all([
          pb.collection('manual_chapters').getFullList({ sort: 'number' }).catch(() => []),
          pb.collection('glossary_terms').getFullList({ sort: 'term' }).catch(() => []),
          loadModuleProgress('manual_bekai'),
        ])

        if (!mounted) return

        setChapters(chaps.length > 0 ? chaps : FALLBACK_CHAPTERS)
        setGlossary(terms.length > 0 ? terms : FALLBACK_GLOSSARY)
        setViewedChapters(
          Array.isArray(progress.progressJson.viewedChapters)
            ? progress.progressJson.viewedChapters
            : [],
        )
        setViewedGlossary(
          Array.isArray(progress.progressJson.viewedGlossary)
            ? progress.progressJson.viewedGlossary
            : [],
        )
      } catch (err) {
        console.error('Error fetching manual:', err)
        if (mounted) {
          setChapters(FALLBACK_CHAPTERS)
          setGlossary(FALLBACK_GLOSSARY)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchManualData()

    return () => {
      mounted = false
    }
  }, [])

  const markChapterViewed = (chapterId: string) => {
    setViewedChapters((prev) => {
      const next = prev.includes(chapterId) ? prev : [...prev, chapterId]
      void saveModuleProgress('manual_bekai', {
        completedItems: next.length,
        totalItems: chapters.length || FALLBACK_CHAPTERS.length,
        completed: next.length >= (chapters.length || FALLBACK_CHAPTERS.length),
        lastViewedKey: chapterId,
        progressJson: { viewedChapters: next, viewedGlossary },
      })
      return next
    })
  }

  const markGlossaryViewed = (termId: string) => {
    setViewedGlossary((prev) => {
      const next = prev.includes(termId) ? prev : [...prev, termId]
      void saveModuleProgress('manual_bekai', {
        completedItems: viewedChapters.length,
        totalItems: chapters.length || FALLBACK_CHAPTERS.length,
        completed: viewedChapters.length >= (chapters.length || FALLBACK_CHAPTERS.length),
        lastViewedKey: termId,
        progressJson: { viewedChapters, viewedGlossary: next },
      })
      return next
    })
  }

  const filteredGlossary = glossary.filter(
    (item) =>
      item.term.toLowerCase().includes(searchGlossary.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchGlossary.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary/60">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="font-medium animate-pulse">Carregando Manual BekAI...</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-fade-in mt-6 px-4 md:px-0">
      <div className="space-y-4 border-b pb-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight flex items-center gap-4">
          <BookOpenText className="w-10 h-10 text-secondary shrink-0" /> Manual BekAI
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
          O centro de conhecimento da plataforma para entender o diagnostico, interpretar metricas
          clinicas e navegar pelos modulos da jornada.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Badge variant="outline" className="border-primary/20 text-primary">
            {viewedChapters.length}/{chapters.length || FALLBACK_CHAPTERS.length} capitulos lidos
          </Badge>
          <Badge variant="outline" className="border-secondary/30 text-secondary">
            {viewedGlossary.length} termos explorados
          </Badge>
          {viewedChapters.length >= (chapters.length || FALLBACK_CHAPTERS.length) && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Manual concluido
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="chapters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="chapters" className="flex items-center gap-2">
            <BookOpenText className="w-4 h-4" /> Capitulos
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex items-center gap-2">
            <BookA className="w-4 h-4" /> Glossario Tecnico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="space-y-6">
          {chapters.length === 0 ? (
            <Card className="bg-muted/30 border-dashed text-center py-12">
              <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <CardTitle>Nenhum capitulo encontrado</CardTitle>
            </Card>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="space-y-4"
              onValueChange={(value) => {
                if (value) markChapterViewed(value)
              }}
            >
              {chapters.map((chapter) => (
                <AccordionItem
                  key={chapter.id}
                  value={chapter.id}
                  className={`border rounded-2xl px-6 bg-background shadow-sm ${viewedChapters.includes(chapter.id) ? 'border-emerald-200' : 'hover:border-primary/30'}`}
                >
                  <AccordionTrigger className="hover:no-underline py-5">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
                        {chapter.number}
                      </div>
                      <div>
                        <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-primary/70 mb-1">
                          Capitulo {chapter.number}
                        </CardDescription>
                        <CardTitle className="text-xl md:text-2xl text-foreground flex items-center gap-2">
                          {chapter.title}
                          {viewedChapters.includes(chapter.id) && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          )}
                        </CardTitle>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div
                      className="text-muted-foreground leading-relaxed text-sm md:text-base prose prose-sm max-w-none prose-p:mb-4 prose-strong:text-primary"
                      dangerouslySetInnerHTML={{ __html: chapter.content }}
                    />
                    {chapter.route_reference && (
                      <Button
                        variant="outline"
                        asChild
                        className="mt-6 gap-2 border-primary/20 text-primary hover:bg-primary/5"
                      >
                        <Link to={chapter.route_reference}>
                          Acessar Modulo <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="glossary" className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar termo tecnico..."
                className="pl-9 bg-background shadow-sm"
                value={searchGlossary}
                onChange={(e) => setSearchGlossary(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground ml-auto hidden md:block">
              {filteredGlossary.length} termos encontrados
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3"
            onValueChange={(value) => {
              if (value) markGlossaryViewed(value)
            }}
          >
            {filteredGlossary.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum termo encontrado para "{searchGlossary}".
              </div>
            ) : (
              filteredGlossary.map((term) => (
                <AccordionItem
                  key={term.id}
                  value={term.id}
                  className="border rounded-lg px-4 bg-background shadow-sm hover:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="font-bold text-foreground hover:no-underline py-4 text-base">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary rounded-sm font-mono shrink-0"
                      >
                        {term.term.charAt(0)}
                      </Badge>
                      {term.term}
                      {viewedGlossary.includes(term.id) && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed pb-4 pl-12">
                    {term.definition}
                  </AccordionContent>
                </AccordionItem>
              ))
            )}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  )
}
