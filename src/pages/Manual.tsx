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
import { BookOpenText, Search, BookA, ArrowRight, Loader2, HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'

const FALLBACK_CHAPTERS = [
  {
    id: 'f1', number: 1, title: 'Introdução ao BekAI e Literacia Digital',
    content: `<p>O BekAI é uma plataforma de <strong>literacia digital familiar</strong> que ajuda responsáveis a compreenderem e orientarem o impacto das redes sociais no desenvolvimento de crianças e adolescentes.</p>
    <p>Literacia digital vai além do uso de tecnologia — trata-se da <strong>capacidade crítica de consumir, avaliar e produzir conteúdo digital</strong> de forma consciente e saudável.</p>`,
    route_reference: '/monitoramento',
  },
  {
    id: 'f2', number: 2, title: 'Como Realizar o Mapeamento de Influência',
    content: `<p>O Mapeamento de Influência é o primeiro passo do processo BekAI. Você irá:</p>
    <ol class="list-decimal pl-6 space-y-2 mt-2"><li>Selecionar o perfil do jovem a ser analisado</li><li>Indicar as plataformas de maior uso</li><li>Marcar comportamentos observados (padrões de risco)</li><li>Aguardar o Agente BekAI gerar o perfil de influência digital</li></ol>`,
    route_reference: '/analise',
  },
  {
    id: 'f3', number: 3, title: 'Entendendo o DQ Score e Níveis de Risco',
    content: `<p>O <strong>Quociente Digital (DQ)</strong> é uma pontuação de 0 a 100 que mede a qualidade do consumo digital. Quanto maior, mais saudável o perfil.</p>
    <p>Os <strong>Níveis de Risco</strong> são: <em>Baixo, Moderado, Alto</em> e <em>Crítico</em>. Cada nível determina a urgência da intervenção e o tipo de plano de ação gerado pelo Agente.</p>`,
    route_reference: '/resultado',
  },
  {
    id: 'f4', number: 4, title: 'Agente Autônomo: Como Funciona',
    content: `<p>O Agente Autônomo BekAI gera <strong>planos de ação personalizados</strong> baseados no perfil de influência digital. Ele utiliza a técnica de <em>Equivalência Estética</em> para substituir conteúdos nocivos por conteúdos construtivos.</p>
    <p>Você pode ativar um plano de ação e acompanhar a evolução quantitativa (tempo de tela) e qualitativa (aceitação de conteúdo positivo) do jovem.</p>`,
    route_reference: '/plano',
  },
  {
    id: 'f5', number: 5, title: 'Configurando Alertas e Notificações',
    content: `<p>O BekAI suporta alertas via <strong>WhatsApp</strong> e <strong>Telegram</strong>. Configure nas Configurações para receber notificações imediatas quando riscos críticos forem detectados.</p>
    <p>Para WhatsApp, inclua o código do país no número (ex: +55 11 99999-9999). Para Telegram, inicie o bot oficial BekAI e obtenha seu Chat ID com o comando /start.</p>`,
    route_reference: '/config',
  },
]

const FALLBACK_GLOSSARY = [
  { id: 'g1', term: 'DQ Score (Quociente Digital)', definition: 'Pontuação de 0 a 100 que representa a qualidade do consumo digital de um jovem. Avalia múltiplas dimensões de risco e saúde digital.' },
  { id: 'g2', term: 'Vaping de Atenção', definition: 'Padrão de consumo passivo e ininterrupto de vídeos curtos, caracterizado pela absorção acelerada de informações rasas sem filtro crítico, gerando conformismo e letargia.' },
  { id: 'g3', term: 'Equivalência Estética', definition: 'Técnica do Agente BekAI que consiste em substituir conteúdos nocivos por conteúdos de qualidade visual equivalente, mas com narrativas construtivas e virtuosas.' },
  { id: 'g4', term: 'BDIC (Base de Dados de Inteligência Clínica)', definition: 'Repositório de criadores, conteúdos e referências científicas curados pela equipe BekAI para apoiar as recomendações do Agente Autônomo.' },
  { id: 'g5', term: 'Técnica D.C.D.', definition: 'Método de orientação parental: Duvidar da perfeição digital, Criticar as narrativas de ódio e Determinar o próprio caminho offline.' },
  { id: 'g6', term: 'Niilismo Algorítmico', definition: 'Padrão de consumo de conteúdo que promove a ideia de que nada tem valor ou sentido, frequentemente encontrado em conteúdos "core" e de desabafo nas redes sociais.' },
  { id: 'g7', term: 'Comparação Social Ascendente', definition: 'Comportamento induzido por algoritmos que exibem padrões de vida irreais, levando à insatisfação crônica e ao sentimento de inadequação.' },
]

export default function Manual() {
  const [chapters, setChapters] = useState<any[]>([])
  const [glossary, setGlossary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchGlossary, setSearchGlossary] = useState('')

  useEffect(() => {
    const fetchManualData = async () => {
      try {
        const [chaps, terms] = await Promise.all([
          pb.collection('manual_chapters').getFullList({ sort: 'number' }),
          pb.collection('glossary_terms').getFullList({ sort: 'term' }),
        ])
        setChapters(chaps.length > 0 ? chaps : FALLBACK_CHAPTERS)
        setGlossary(terms.length > 0 ? terms : FALLBACK_GLOSSARY)
      } catch (err) {
        console.error('Error fetching manual:', err)
        setChapters(FALLBACK_CHAPTERS)
        setGlossary(FALLBACK_GLOSSARY)
      } finally {
        setLoading(false)
      }
    }
    fetchManualData()
  }, [])

  const filteredGlossary = glossary.filter(
    (g) =>
      g.term.toLowerCase().includes(searchGlossary.toLowerCase()) ||
      g.definition.toLowerCase().includes(searchGlossary.toLowerCase()),
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
          O centro de conhecimento completo da plataforma. Entenda as fases de diagnóstico,
          interprete as métricas clínicas corretamente e aprenda a navegar pelo ecossistema de
          Literacia Familiar.
        </p>
      </div>

      <Tabs defaultValue="chapters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="chapters" className="flex items-center gap-2">
            <BookOpenText className="w-4 h-4" /> Capítulos
          </TabsTrigger>
          <TabsTrigger value="glossary" className="flex items-center gap-2">
            <BookA className="w-4 h-4" /> Glossário Técnico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="space-y-6">
          {chapters.length === 0 ? (
            <Card className="bg-muted/30 border-dashed text-center py-12">
              <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <CardTitle>Nenhum capítulo encontrado</CardTitle>
            </Card>
          ) : (
            <div className="grid gap-6 relative">
              <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-primary/10 hidden md:block" />
              {chapters.map((chapter) => (
                <Card
                  key={chapter.id}
                  className="relative z-10 shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3 flex flex-row items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0 shadow-inner">
                      {chapter.number}
                    </div>
                    <div>
                      <CardDescription className="uppercase tracking-widest text-[10px] font-bold text-primary/70 mb-1">
                        Capítulo {chapter.number}
                      </CardDescription>
                      <CardTitle className="text-xl md:text-2xl text-foreground">
                        {chapter.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                          Acessar Módulo <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="glossary" className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar termo técnico..."
                className="pl-9 bg-background shadow-sm"
                value={searchGlossary}
                onChange={(e) => setSearchGlossary(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground ml-auto hidden md:block">
              {filteredGlossary.length} termos encontrados
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
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
