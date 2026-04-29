import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ShieldCheck, Loader2, ExternalLink, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  CounterIntervention,
  getChildCounterInterventions,
  runChildCounterbalance,
} from '@/services/counterbalance'

export function CounterbalancePanel({
  childId,
  childName,
}: {
  childId: string
  childName: string
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [interventions, setInterventions] = useState<CounterIntervention[]>([])

  const loadInterventions = async () => {
    try {
      setLoading(true)
      const records = await getChildCounterInterventions(childId)
      setInterventions(records)
    } catch (err) {
      console.error('Failed to load counter interventions', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInterventions()
  }, [childId])

  const handleRun = async () => {
    setRunning(true)
    try {
      const response = await runChildCounterbalance(childId)
      await loadInterventions()
      toast({
        title: 'Contraponto executado',
        description: `${response.interventionsCreated} intervencao(oes) sugerida(s) para ${childName}.`,
      })
    } catch (err: any) {
      toast({
        title: 'Falha ao rodar contraponto',
        description: err?.message || 'Nao foi possivel executar o motor agora.',
        variant: 'destructive',
      })
    } finally {
      setRunning(false)
    }
  }

  return (
    <Card className="shadow-sm border-t-4 border-t-emerald-500">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base flex items-center gap-2 text-emerald-900">
            <Sparkles className="w-5 h-5" /> Contraponto Inteligente
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Detecta topicos nocivos configurados e monta intervencoes beneficas para o jovem.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void loadInterventions()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={handleRun} disabled={running} className="gap-2">
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Rodar Contraponto
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="py-8 flex items-center justify-center text-muted-foreground gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando intervencoes...</span>
          </div>
        ) : interventions.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
            Nenhuma intervencao sugerida ainda. Execute o contraponto para avaliar os eventos digitais
            mais recentes deste jovem.
          </div>
        ) : (
          interventions.slice(0, 4).map((intervention) => {
            const recommendation = intervention.recommendation_json || {}
            const suggestions = Array.isArray(recommendation.contentSuggestions)
              ? recommendation.contentSuggestions
              : []

            return (
              <div key={intervention.id} className="rounded-xl border bg-background p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground capitalize">
                      {recommendation.harmfulTopic || intervention.harmful_topic}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Gatilho: {recommendation.triggerText || intervention.trigger_text || 'Nao informado'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                    <Badge variant="outline">{recommendation.urgency || intervention.status}</Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      {recommendation.platform || intervention.delivery_channel || 'dashboard'}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {recommendation.counterNarrative || 'Intervencao preparada para curadoria positiva.'}
                </p>

                {suggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Sugestoes de Conteudo
                    </p>
                    {suggestions.slice(0, 3).map((item, index) => (
                      <div
                        key={`${intervention.id}-${index}`}
                        className="flex items-start justify-between gap-3 rounded-lg border bg-muted/20 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
