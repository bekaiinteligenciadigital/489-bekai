import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { AnalysisRecord, ScientificRef } from '@/services/parent'
import { MessageSquare, Target, Lightbulb, BookOpen } from 'lucide-react'

interface Props {
  analysis: AnalysisRecord | null
  library: ScientificRef[]
}

export function ParentalScriptsLibrary({ analysis, library }: Props) {
  const scripts = useMemo(() => {
    if (!analysis || !analysis.behavior_patterns) return []

    let patterns: any[] = []
    try {
      patterns =
        typeof analysis.behavior_patterns === 'string'
          ? JSON.parse(analysis.behavior_patterns)
          : analysis.behavior_patterns
    } catch {
      return []
    }

    if (!Array.isArray(patterns)) return []

    // Find a relevant complementary layer reference (PNL/Psicanálise)
    const complementaryRef = library.find((l) => l.axis === 'PNL' || l.axis === 'Psicanálise')

    return patterns.map((pattern, idx) => ({
      id: `script-${idx}`,
      context: pattern.issue || 'Comportamento digital atípico',
      trigger: pattern.trigger || 'Desconhecido',
      opening: `Filho(a), percebi que ultimamente você tem se sentido mais ${pattern.trigger?.toLowerCase() || 'cansado(a)'} quando foca muito nisso. Como você tem se sentido?`,
      objective:
        'Reduzir a resistência, acolher a emoção e promover reflexão conjunta sobre os limites.',
      scientificAnchor: complementaryRef || null,
    }))
  }, [analysis, library])

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          Scripts Parentais (Biblioteca de Diálogos)
        </CardTitle>
        <CardDescription>
          Sugestões contextuais de comunicação baseadas nos padrões comportamentais identificados,
          apoiadas por técnicas de comunicação empática.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {scripts.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-3">
            {scripts.map((script) => (
              <AccordionItem
                key={script.id}
                value={script.id}
                className="border rounded-lg px-4 bg-muted/10"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col items-start text-left gap-1">
                    <span className="font-semibold text-sm">{script.context}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Target className="w-3 h-3" /> Foco: Lidando com {script.trigger}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-2 pb-4">
                  <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-800 font-medium text-sm">
                      <MessageSquare className="w-4 h-4" /> Sugestão de Abertura
                    </div>
                    <p className="text-sm text-indigo-900 italic">"{script.opening}"</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <Lightbulb className="w-4 h-4" /> Objetivo Chave
                      </div>
                      <p className="text-sm text-muted-foreground">{script.objective}</p>
                    </div>

                    {script.scientificAnchor && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                          <BookOpen className="w-4 h-4" /> Âncora Científica
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {script.scientificAnchor.title}
                        </p>
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-800 border-amber-200"
                        >
                          Camada: {script.scientificAnchor.axis}
                        </Badge>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center p-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed text-sm">
            Nenhum padrão comportamental identificado no momento para gerar scripts específicos.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
