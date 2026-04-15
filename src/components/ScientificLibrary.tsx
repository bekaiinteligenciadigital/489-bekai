import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Filter, Search, Loader2, Globe, ExternalLink, BookText } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Skeleton } from '@/components/ui/skeleton'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { TermTooltip } from '@/components/ui/glossary-tooltip'

const evidenceColors: Record<string, string> = {
  'Meta-análise': 'bg-emerald-100 text-emerald-800 border-emerald-300',
  RCT: 'bg-teal-100 text-teal-800 border-teal-300',
  Coorte: 'bg-blue-100 text-blue-800 border-blue-300',
  Relato: 'bg-amber-100 text-amber-800 border-amber-300',
  Opinião: 'bg-rose-100 text-rose-800 border-rose-300',
}

const termsToHighlight = [
  'Quociente Digital (DQ)',
  'Nível de Risco Expositivo',
  'Distorção',
  'Mapeamento de Influência',
]

function HighlightedSummary({ text }: { text: string }) {
  let parts: (string | React.ReactNode)[] = [text]

  termsToHighlight.forEach((term) => {
    parts = parts.flatMap((part, i) => {
      if (typeof part !== 'string') return [part]
      const split = part.split(new RegExp(`(${term})`, 'gi'))
      return split.map((s, j) => {
        if (s.toLowerCase() === term.toLowerCase()) {
          return (
            <TermTooltip key={`${term}-${i}-${j}`} term={term}>
              {s}
            </TermTooltip>
          )
        }
        return s
      })
    })
  })

  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>{p}</span>
      ))}
    </>
  )
}

export function ScientificLibrary({
  globalSearch = '',
  onSearchChange,
}: {
  globalSearch?: string
  onSearchChange?: (val: string) => void
}) {
  const { user } = useAuth()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [axisFilter, setAxisFilter] = useState<string>('all')
  const [evidenceFilter, setEvidenceFilter] = useState<string>('all')

  const [localSearch, setLocalSearch] = useState(globalSearch)
  const searchQuery = onSearchChange ? globalSearch : localSearch
  const handleSearchChange = (val: string) => {
    if (onSearchChange) onSearchChange(val)
    else setLocalSearch(val)
  }

  const [journalSearch, setJournalSearch] = useState('')
  const [minImpact, setMinImpact] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('newest')
  const [isSearchingExternal, setIsSearchingExternal] = useState(false)
  const [externalResults, setExternalResults] = useState<any[]>([])

  const loadItems = async () => {
    try {
      setLoading(true)
      const data = await pb.collection('scientific_library').getFullList({ sort: '-created' })
      setItems(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  useRealtime('scientific_library', () => {
    loadItems()
  })

  const handleExternalSearch = () => {
    if (!searchQuery.trim()) return
    setIsSearchingExternal(true)
    setTimeout(() => {
      const mockResults = [
        {
          id: `ext-${Date.now()}-1`,
          title: `Evidência Global sobre: ${searchQuery}`,
          axis: axisFilter !== 'all' ? axisFilter : 'Psiquiatria',
          clinical_status: 'Base Clínica',
          evidence_level: evidenceFilter !== 'all' ? evidenceFilter : 'Meta-análise',
          content_link: 'https://pubmed.ncbi.nlm.nih.gov/',
          summary: `Esta meta-análise externa correlaciona a alta exposição digital com sintomas de Distorção e avalia os impactos no Quociente Digital (DQ).`,
          isExternal: true,
        },
      ]
      setExternalResults((prev) => [...mockResults, ...prev])
      setIsSearchingExternal(false)
    }, 1200)
  }

  const normalize = (str: string) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  const filteredItems = useMemo(() => {
    const allItems = [...items, ...externalResults]
    const term = normalize(searchQuery.trim())
    const journalTerm = normalize(journalSearch.trim())

    return allItems
      .filter((item) => {
        const matchAxis = axisFilter === 'all' || item.axis === axisFilter
        const matchEvidence = evidenceFilter === 'all' || item.evidence_level === evidenceFilter

        const searchTitle = item.title ? normalize(item.title) : ''
        const searchSummary = item.summary ? normalize(item.summary) : ''
        const searchAxis = item.axis ? normalize(item.axis) : ''
        const searchJournalName = item.journal_name ? normalize(item.journal_name) : ''

        const matchSearch =
          term === '' ||
          searchTitle.includes(term) ||
          searchSummary.includes(term) ||
          searchAxis.includes(term) ||
          searchJournalName.includes(term)

        const matchJournal = journalTerm === '' || searchJournalName.includes(journalTerm)

        const matchImpact = item.impact_factor ? item.impact_factor >= minImpact : minImpact === 0

        return matchAxis && matchEvidence && matchSearch && matchJournal && matchImpact
      })
      .sort((a, b) => {
        if (sortBy === 'impact') return (b.impact_factor || 0) - (a.impact_factor || 0)
        const dateA = a.created ? new Date(a.created).getTime() : 0
        const dateB = b.created ? new Date(b.created).getTime() : 0
        return dateB - dateA
      })
  }, [
    items,
    externalResults,
    axisFilter,
    evidenceFilter,
    searchQuery,
    journalSearch,
    minImpact,
    sortBy,
  ])

  // Module Access Protection
  if (!user || user.role !== 'professional') {
    return null
  }

  const axes = ['Psiquiatria', 'Psicologia', 'Neurociência', 'Psicanálise', 'PNL']
  const evidences = ['Meta-análise', 'RCT', 'Coorte', 'Relato', 'Opinião']

  return (
    <div className="space-y-6 pt-4">
      <div className="flex flex-col gap-4 mb-6 p-4 bg-muted/30 rounded-lg border">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar estudos, artigos e evidências..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 bg-background h-10 w-full shadow-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleExternalSearch()}
            />
          </div>
          <Button
            onClick={handleExternalSearch}
            disabled={isSearchingExternal || !searchQuery.trim()}
            className="gap-2 w-full sm:w-auto shadow-sm"
          >
            {isSearchingExternal ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            Buscar Fontes Externas
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground whitespace-nowrap mr-2">
            <Filter className="w-4 h-4" /> Eixos e Evidências:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <Select value={axisFilter} onValueChange={setAxisFilter}>
              <SelectTrigger className="bg-background shadow-sm">
                <SelectValue placeholder="Eixo Temático" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Eixos</SelectItem>
                {axes.map((ax) => (
                  <SelectItem key={ax} value={ax}>
                    {ax}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={evidenceFilter} onValueChange={setEvidenceFilter}>
              <SelectTrigger className="bg-background shadow-sm">
                <SelectValue placeholder="Nível de Evidência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Evidências</SelectItem>
                {evidences.map((ev) => (
                  <SelectItem key={ev} value={ev}>
                    {ev}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-4 border-t border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por Journal..."
              value={journalSearch}
              onChange={(e) => setJournalSearch(e.target.value)}
              className="pl-9 bg-background h-10 w-full shadow-sm"
            />
          </div>

          <div className="flex flex-col justify-center space-y-3 px-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <BookText className="w-4 h-4" /> Fator de Impacto Mín:
              </span>
              <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">
                {minImpact.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[minImpact]}
              onValueChange={(v) => setMinImpact(v[0])}
              max={20}
              step={0.5}
              className="w-full cursor-pointer"
            />
          </div>

          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-background shadow-sm h-10">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais Recentes Primeiro</SelectItem>
                <SelectItem value="impact">Maior Impacto Primeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/10">
          Nenhuma evidência encontrada para os filtros e buscas selecionadas.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          {filteredItems.map((item) => {
            const innerContent = (
              <CardContent className="p-5 flex flex-col flex-1 gap-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-secondary/10 text-secondary border-secondary/20"
                    >
                      {item.clinical_status}
                    </Badge>
                    {item.isExternal && (
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700 border-indigo-200"
                      >
                        <Globe className="w-3 h-3 mr-1" /> Fonte Externa
                      </Badge>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase font-bold tracking-wider ${evidenceColors[item.evidence_level] || 'bg-gray-100 text-gray-800'}`}
                  >
                    {item.evidence_level}
                  </Badge>
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-tight group-hover:text-primary transition-colors">
                  <span className="text-primary mr-1">[{item.axis}]</span> {item.title}
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                  <HighlightedSummary text={item.summary || ''} />
                </p>

                <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {item.journal_name ? (
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-md">
                      {item.journal_name} {item.impact_factor ? `(FI: ${item.impact_factor})` : ''}
                    </span>
                  ) : (
                    <span />
                  )}

                  {item.content_link && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-2 shrink-0 group/btn"
                    >
                      <a href={item.content_link} target="_blank" rel="noopener noreferrer">
                        Acessar Fonte Original{' '}
                        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            )

            return (
              <Card
                key={item.id}
                className={`bg-background shadow-sm hover:shadow-md transition-all border flex flex-col group ${item.isExternal ? 'border-indigo-200 bg-indigo-50/10' : 'border-border hover:border-primary/50'}`}
              >
                <div className="flex flex-col flex-1">{innerContent}</div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
