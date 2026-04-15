import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Search,
  ExternalLink,
  ShieldCheck,
  Filter,
  Link2Off,
  Loader2,
  BookText,
  ArrowLeft,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { ScientificLibrary } from '@/components/ScientificLibrary'
import { TermTooltip } from '@/components/ui/glossary-tooltip'
import { ResultadoCriadores } from '@/components/ResultadoCriadores'
import { useAuth } from '@/hooks/use-auth'

export default function Biblioteca() {
  const { user } = useAuth()
  const [creators, setCreators] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterPlatform, setFilterPlatform] = useState('Todas')
  const [globalSearch, setGlobalSearch] = useState('')
  const [contentMatchCreatorIds, setContentMatchCreatorIds] = useState<string[]>([])
  const [isSearchingContent, setIsSearchingContent] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    const loadCreators = async () => {
      try {
        setLoading(true)
        const data = await pb.collection('creators').getFullList({ sort: '-created' })
        setCreators(data)
      } catch (err) {
        toast({
          title: 'Erro de conexão',
          description: 'Não foi possível carregar os criadores da biblioteca.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    loadCreators()
  }, [toast])

  useEffect(() => {
    if (!globalSearch.trim()) {
      setContentMatchCreatorIds([])
      return
    }
    const fetchContentMatches = async () => {
      setIsSearchingContent(true)
      try {
        const term = globalSearch.trim().replace(/"/g, '\\"')
        const records = await pb.collection('content_items').getList(1, 200, {
          filter: `title ~ "${term}" || raw_text ~ "${term}" || transcript ~ "${term}"`,
          fields: 'creator',
        })
        const ids = Array.from(new Set(records.items.map((r) => r.creator)))
        setContentMatchCreatorIds(ids)
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearchingContent(false)
      }
    }
    const timeoutId = setTimeout(fetchContentMatches, 400)
    return () => clearTimeout(timeoutId)
  }, [globalSearch])

  const platforms = [
    'Todas',
    ...Array.from(new Set(creators.map((c) => c.platform).filter(Boolean))),
  ]

  const filtered = creators.filter((item) => {
    const matchPlatform = filterPlatform === 'Todas' || item.platform === filterPlatform
    const term = globalSearch.toLowerCase().trim()
    const matchSearch =
      term === '' ||
      (item.display_name || '').toLowerCase().includes(term) ||
      (item.handle || '').toLowerCase().includes(term) ||
      contentMatchCreatorIds.includes(item.id)
    return matchPlatform && matchSearch
  })

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <h2 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
            Biblioteca & Curadoria
          </h2>
          <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-relaxed">
            Acesse nosso Motor de <TermTooltip term="Equivalência Estética" /> e a{' '}
            <TermTooltip term="BDIC" />.
          </p>
        </div>
      </div>

      <Tabs defaultValue="creators" className="w-full">
        <TabsList
          className={`grid w-full grid-cols-1 sm:grid-cols-${user?.role === 'professional' ? '3' : '2'} mb-6`}
        >
          <TabsTrigger value="creators" className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Criadores
          </TabsTrigger>
          <TabsTrigger value="bdic" className="flex items-center gap-2">
            <BookText className="w-4 h-4" /> Biblioteca Científica
          </TabsTrigger>
          {user?.role === 'professional' && (
            <TabsTrigger
              value="professional"
              className="flex items-center gap-2 bg-primary/5 text-primary border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <ShieldCheck className="w-4 h-4" /> Área Clínica
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="creators" className="space-y-8">
          <div className="bg-primary/5 rounded-xl border border-primary/10 p-6">
            <ResultadoCriadores />
          </div>

          <div className="flex flex-col gap-4 bg-muted/30 p-4 rounded-xl border">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar criadores ou conteúdos..."
                className="pl-9 pr-9 bg-background shadow-sm h-10 w-full"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
              {isSearchingContent && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Plataforma
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {platforms.map((p) => (
                    <Button
                      key={p}
                      variant={filterPlatform === p ? 'default' : 'outline'}
                      className={`rounded-full whitespace-nowrap h-8 transition-all text-xs ${filterPlatform === p ? 'shadow-md' : 'bg-background'}`}
                      size="sm"
                      onClick={() => setFilterPlatform(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p>Carregando biblioteca de criadores...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 opacity-60">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p>Nenhum conteúdo encontrado para estes filtros.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {filtered.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col border-muted-foreground/20"
                >
                  <div className="h-20 bg-primary/5 relative group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                    <span className="text-4xl opacity-20 font-bold uppercase tracking-widest">
                      {item.platform}
                    </span>
                    <div className="absolute -bottom-8 left-6 p-1 bg-background rounded-full shadow-md">
                      <div className="w-16 h-16 rounded-full bg-secondary/20 border-2 border-background flex items-center justify-center text-xl font-bold text-secondary">
                        {(item.display_name || item.handle || '?').charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <CardContent className="pt-12 pb-5 px-6 flex-1 flex flex-col bg-background">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg line-clamp-1">
                        {item.display_name || 'Sem Nome'}
                      </h3>
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-muted/30 whitespace-nowrap uppercase"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        @{item.handle}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3 flex-1">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-medium bg-secondary/15 text-primary"
                      >
                        {item.platform}
                      </Badge>
                    </div>
                    {item.profile_url ? (
                      <Button
                        asChild
                        variant="outline"
                        className="w-full mt-6 text-primary border-primary/20 hover:bg-primary/5 gap-2 group-hover:border-primary/50 transition-colors"
                      >
                        <a href={item.profile_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Acessar Perfil
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled className="w-full mt-6 gap-2 opacity-50">
                        <Link2Off className="w-4 h-4" /> Link Indisponível
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bdic">
          <ScientificLibrary globalSearch={globalSearch} onSearchChange={setGlobalSearch} />
        </TabsContent>

        {user?.role === 'professional' && (
          <TabsContent value="professional" className="animate-fade-in">
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-8 text-center space-y-4">
              <ShieldCheck className="w-16 h-16 text-primary mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-serif font-bold text-primary">
                Materiais Clínicos Exclusivos
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Este espaço é reservado para profissionais de saúde compartilharem, pesquisarem e
                estruturarem intervenções e protocolos validados pela nossa Base de Dados de
                Inteligência Clínica.
              </p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => window.open('https://example.com/clinical-guidelines', '_blank')}
              >
                Acessar Diretrizes Técnicas de Intervenção
              </Button>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
