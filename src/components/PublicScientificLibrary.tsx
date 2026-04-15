import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getLibraryItems } from '@/services/clinical'
import { ExternalLink, BookOpenCheck, ShieldAlert } from 'lucide-react'

const axes = ['Todos', 'Psiquiatria', 'Psicologia', 'Neurociência', 'Psicanálise', 'PNL']

const evidenceColors: Record<string, string> = {
  'Meta-análise': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  RCT: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  Coorte: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
  Relato: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  Opinião: 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200',
}

export function PublicScientificLibrary() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAxis, setActiveAxis] = useState('Todos')

  useEffect(() => {
    getLibraryItems()
      .then((data) => {
        setItems(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = useMemo(() => {
    let filtered = items
    if (activeAxis !== 'Todos') {
      filtered = items.filter((item) => item.axis === activeAxis)
    }
    return filtered
  }, [items, activeAxis])

  return (
    <section className="py-24 bg-slate-50 border-t border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center space-y-6 mb-16">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto text-blue-700 mb-4 shadow-sm">
            <BookOpenCheck className="w-8 h-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">
            Biblioteca Científica
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            A inteligência do KAIRÓS é construída sobre uma robusta base de evidências. Explore os
            estudos, artigos e diretrizes que fundamentam nossa tecnologia de monitoramento
            terapêutico.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {axes.map((axis) => (
            <Button
              key={axis}
              variant={activeAxis === axis ? 'default' : 'outline'}
              onClick={() => setActiveAxis(axis)}
              className={`rounded-full px-6 transition-all ${
                activeAxis === axis
                  ? 'bg-blue-700 hover:bg-blue-800 text-white shadow-md border-transparent'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {axis}
            </Button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[280px] w-full rounded-xl bg-slate-200/50" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed shadow-sm">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Nenhum documento encontrado para este eixo.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const innerContent = (
                <>
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700 font-medium"
                        >
                          {item.axis}
                        </Badge>
                        {item.clinical_status && (
                          <Badge
                            variant="outline"
                            className="border-emerald-200 text-emerald-700 bg-emerald-50"
                          >
                            {item.clinical_status}
                          </Badge>
                        )}
                      </div>
                      <Badge
                        className={`border-none ${evidenceColors[item.evidence_level] || 'bg-slate-100 text-slate-800'}`}
                      >
                        {item.evidence_level}
                      </Badge>
                    </div>
                    <CardTitle
                      className="text-xl font-serif text-slate-900 leading-snug line-clamp-2"
                      title={item.title}
                    >
                      {item.title}
                    </CardTitle>
                    {item.journal_name && (
                      <p
                        className="text-sm font-medium text-blue-700 mt-2 line-clamp-1"
                        title={item.journal_name}
                      >
                        {item.journal_name}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">
                      {item.summary}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-4 border-t border-slate-100 mt-auto">
                    {item.content_link ? (
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full text-blue-700 hover:text-blue-800 hover:bg-blue-50 font-semibold group/btn"
                      >
                        <a href={item.content_link} target="_blank" rel="noopener noreferrer">
                          Acessar Fonte Original{' '}
                          <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </a>
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        className="w-full text-slate-400 font-semibold"
                        disabled
                      >
                        Link Indisponível
                      </Button>
                    )}
                  </CardFooter>
                </>
              )

              return (
                <Card
                  key={item.id}
                  className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group"
                >
                  <div className="flex flex-col h-full">{innerContent}</div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Watermark */}
        <div className="mt-20 text-center opacity-50 select-none">
          <p className="font-mono text-[10px] tracking-widest text-slate-500 uppercase">
            Propriedade intelectual de JOSÉ ANTONIO DO NASCIMENTO JUNIOR - 36232084500
          </p>
        </div>
      </div>
    </section>
  )
}
