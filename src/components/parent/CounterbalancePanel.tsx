import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  ShieldCheck,
  Loader2,
  ExternalLink,
  RefreshCw,
  Send,
  XCircle,
  ClipboardCheck,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  CounterIntervention,
  CounterDeliveryChannel,
  getChildCounterInterventions,
  runChildCounterbalance,
  updateCounterInterventionStatus,
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
  const [busyInterventionId, setBusyInterventionId] = useState<string | null>(null)
  const [deliveryChannels, setDeliveryChannels] = useState<Record<string, CounterDeliveryChannel>>({})
  const [customMessages, setCustomMessages] = useState<Record<string, string>>({})

  const loadInterventions = async () => {
    try {
      setLoading(true)
      const records = await getChildCounterInterventions(childId)
      setInterventions(records)
      setDeliveryChannels((prev) => {
        const next = { ...prev }
        records.forEach((record) => {
          if (!next[record.id]) {
            next[record.id] = record.delivery_channel || 'dashboard'
          }
        })
        return next
      })
      setCustomMessages((prev) => {
        const next = { ...prev }
        records.forEach((record) => {
          if (!next[record.id]) {
            next[record.id] = record.recommendation_json?.deliveryMessage || ''
          }
        })
        return next
      })
    } catch (err) {
      console.error('Failed to load counter interventions', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (
    intervention: CounterIntervention,
    status: 'reviewed' | 'delivered' | 'dismissed',
  ) => {
    setBusyInterventionId(intervention.id)
    try {
      const result = await updateCounterInterventionStatus(intervention.id, {
        status,
        deliveryChannel: deliveryChannels[intervention.id] || intervention.delivery_channel || 'dashboard',
        customMessage:
          customMessages[intervention.id] || intervention.recommendation_json?.deliveryMessage || '',
      })

      await loadInterventions()
      toast({
        title:
          status === 'reviewed'
            ? 'Intervencao em revisao'
            : status === 'delivered'
              ? 'Intervencao marcada como entregue'
              : 'Intervencao dispensada',
        description:
          status === 'delivered' && result.whatsappSent
            ? 'O alerta foi atualizado e a mensagem foi enviada por WhatsApp.'
            : 'O fluxo operacional do contraponto foi atualizado com sucesso.',
      })
    } catch (err: any) {
      toast({
        title: 'Falha ao atualizar intervencao',
        description: err?.message || 'Nao foi possivel atualizar o status do contraponto.',
        variant: 'destructive',
      })
    } finally {
      setBusyInterventionId(null)
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

                {recommendation.guardianSummary && (
                  <div className="rounded-lg border bg-primary/5 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary/70">
                      Resumo para Responsavel
                    </p>
                    <p className="mt-1 text-sm text-foreground">{recommendation.guardianSummary}</p>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Canal de Entrega
                    </p>
                    <Select
                      value={deliveryChannels[intervention.id] || intervention.delivery_channel || 'dashboard'}
                      onValueChange={(value: CounterDeliveryChannel) =>
                        setDeliveryChannels((prev) => ({ ...prev, [intervention.id]: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">dashboard</SelectItem>
                        <SelectItem value="whatsapp">whatsapp</SelectItem>
                        <SelectItem value="discord">discord</SelectItem>
                        <SelectItem value="manual_review">manual_review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Mensagem de Entrega
                    </p>
                    <Textarea
                      value={
                        customMessages[intervention.id] ??
                        recommendation.deliveryMessage ??
                        ''
                      }
                      onChange={(e) =>
                        setCustomMessages((prev) => ({
                          ...prev,
                          [intervention.id]: e.target.value,
                        }))
                      }
                      className="min-h-[92px]"
                    />
                  </div>
                </div>

                {recommendation.algorithmGoal && (
                  <div className="rounded-lg border bg-emerald-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      Objetivo Algoritmico
                    </p>
                    <p className="mt-1 text-sm text-emerald-900">{recommendation.algorithmGoal}</p>
                  </div>
                )}

                {recommendation.youtubeQuery && (
                  <div className="rounded-lg border bg-red-50 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                      Busca de Contraponto no YouTube
                    </p>
                    <p className="mt-1 text-sm text-red-900">{recommendation.youtubeQuery}</p>
                    <p className="mt-2 text-xs text-red-800/80">
                      Fonte de sugestao:{' '}
                      <span className="font-semibold">
                        {recommendation.contentSource === 'youtube_api'
                          ? 'YouTube Data API'
                          : 'Curadoria manual de fallback'}
                      </span>
                    </p>
                  </div>
                )}

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
                          <div className="mt-1 flex flex-wrap gap-2">
                            {item.resourceType && (
                              <Badge variant="outline" className="text-[10px] uppercase">
                                {item.resourceType}
                              </Badge>
                            )}
                            {item.channelTitle && (
                              <Badge variant="secondary" className="text-[10px]">
                                {item.channelTitle}
                              </Badge>
                            )}
                          </div>
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

                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyInterventionId === intervention.id}
                    onClick={() => void handleStatusUpdate(intervention, 'reviewed')}
                  >
                    {busyInterventionId === intervention.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ClipboardCheck className="w-4 h-4" />
                    )}
                    Em revisao
                  </Button>
                  <Button
                    size="sm"
                    disabled={busyInterventionId === intervention.id}
                    onClick={() => void handleStatusUpdate(intervention, 'delivered')}
                  >
                    {busyInterventionId === intervention.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Marcar entregue
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-700 hover:text-rose-800 hover:bg-rose-50"
                    disabled={busyInterventionId === intervention.id}
                    onClick={() => void handleStatusUpdate(intervention, 'dismissed')}
                  >
                    <XCircle className="w-4 h-4" />
                    Dispensar
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
