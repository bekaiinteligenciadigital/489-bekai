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
        setChapters(chaps)
        setGlossary(terms)
      } catch (err) {
        console.error('Error fetching manual:', err)
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
