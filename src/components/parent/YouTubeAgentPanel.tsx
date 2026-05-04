import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { runChildYouTubeAgent } from '@/services/counterbalance'
import { ExternalLink, Loader2, PlaySquare, Search, Youtube } from 'lucide-react'

type AgentResult = Awaited<ReturnType<typeof runChildYouTubeAgent>> | null

export function YouTubeAgentPanel({
  childId,
  childName,
}: {
  childId: string
  childName: string
}) {
  const { toast } = useToast()
  const [running, setRunning] = useState(false)
  const [customQuery, setCustomQuery] = useState('')
  const [result, setResult] = useState<AgentResult>(null)

  const handleRun = async () => {
    setRunning(true)
    try {
      const response = await runChildYouTubeAgent(childId, {
        query: customQuery.trim() || undefined,
        maxResults: 6,
      })
      setResult(response)

      if (!response.success) {
        toast({
          title: 'Agente YouTube sem gatilho',
          description:
            response.message || 'Nenhum topico nocivo foi detectado para montar a trilha agora.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Agente YouTube executado',
        description:
          response.items && response.items.length
            ? `Foram retornadas ${response.items.length} sugestoes para ${childName}.`
            : 'Nenhuma sugestao externa foi retornada; o sistema exibira curadoria manual.',
      })
    } catch (err: any) {
      toast({
        title: 'Falha ao rodar Agente YouTube',
        description: err?.message || 'Nao foi possivel consultar o YouTube neste momento.',
        variant: 'destructive',
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card className="shadow-sm border-t-4 border-t-red-500">
      <CardHeader className="space-y-3">
        <div>
          <CardTitle className="text-base flex items-center gap-2 text-red-900">
            <Youtube className="w-5 h-5" /> Agente YouTube
          </CardTitle>
          <CardDescription>
            Roda uma busca dedicada no YouTube para montar trilhas de contraponto com videos, canais
            e playlists beneficas.
          </CardDescription>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            value={customQuery}
            onChange={(e) => setCustomQuery(e.target.value)}
            placeholder="Opcional: busca manual, ex. esportes para adolescentes"
          />
          <Button onClick={handleRun} disabled={running} className="gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Rodar Agente YouTube
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <div className="rounded-xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
            Execute o agente para este jovem e o BekAI vai montar uma trilha de contraponto
            especifica para o YouTube.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Query usada
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{result.query || 'Nao informada'}</p>
              </div>
              <div className="rounded-xl border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Topico associado
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {result.matchedTopic?.name || 'Busca manual'}
                </p>
              </div>
              <div className="rounded-xl border bg-background p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Fonte
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {result.recommendation?.contentSource === 'youtube_api'
                    ? 'YouTube Data API'
                    : 'Curadoria manual'}
                </p>
              </div>
            </div>

            {result.recommendation?.guardianSummary && (
              <div className="rounded-xl border bg-red-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                  Leitura do Agente
                </p>
                <p className="mt-1 text-sm text-red-900">{result.recommendation.guardianSummary}</p>
              </div>
            )}

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sugestoes de Conteudo
              </p>
              {result.items && result.items.length > 0 ? (
                result.items.map((item, index) => (
                  <div
                    key={`${item.url || item.title}-${index}`}
                    className="flex items-start justify-between gap-3 rounded-xl border bg-background p-4"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.resourceType && (
                          <Badge variant="outline" className="uppercase text-[10px]">
                            {item.resourceType}
                          </Badge>
                        )}
                        {item.channelTitle && <Badge variant="secondary">{item.channelTitle}</Badge>}
                      </div>
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{item.description}</p>
                      )}
                    </div>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary shrink-0"
                        title="Abrir no YouTube"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <PlaySquare className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
                  Nenhuma sugestao externa retornada nesta execucao.
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
