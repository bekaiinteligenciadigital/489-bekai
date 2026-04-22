import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Link2, AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react'
import type { SocialConnection, SyncJob } from '@/services/monitoring'

interface Props {
  connections: SocialConnection[]
  latestJob: SyncJob | null
  onSync: () => Promise<void> | void
  syncing?: boolean
}

const statusStyles: Record<string, string> = {
  connected: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending_auth: 'bg-amber-100 text-amber-800 border-amber-200',
  sync_limited: 'bg-blue-100 text-blue-800 border-blue-200',
  error: 'bg-rose-100 text-rose-800 border-rose-200',
  revoked: 'bg-slate-100 text-slate-700 border-slate-200',
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
}

const syncStyles: Record<string, string> = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  failed: 'bg-rose-50 text-rose-700 border-rose-200',
  running: 'bg-blue-50 text-blue-700 border-blue-200',
  queued: 'bg-blue-50 text-blue-700 border-blue-200',
  idle: 'bg-slate-50 text-slate-700 border-slate-200',
}

function formatConnectionStatus(status: string) {
  switch (status) {
    case 'connected':
      return 'Conectada'
    case 'pending_auth':
      return 'Aguardando credencial'
    case 'sync_limited':
      return 'Sincronização limitada'
    case 'revoked':
      return 'Revogada'
    case 'error':
      return 'Com erro'
    default:
      return 'Rascunho'
  }
}

function formatSyncStatus(status: string) {
  switch (status) {
    case 'success':
      return 'Última sync ok'
    case 'partial':
      return 'Sync parcial'
    case 'error':
      return 'Falha recente'
    case 'running':
      return 'Sincronizando'
    default:
      return 'Sem sync'
  }
}

export function SocialConnectionsPanel({ connections, latestJob, onSync, syncing = false }: Props) {
  return (
    <Card className="shadow-sm border-indigo-100">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-indigo-900">
              <Link2 className="w-5 h-5" /> Conexões de Monitoramento
            </CardTitle>
            <CardDescription>
              Base operacional do Sprint 2 para mapear contas, estado de conexão e ciclos de sincronização.
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onSync}
            disabled={syncing || connections.length === 0}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            Sincronizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestJob && (
          <div className="rounded-xl border border-border/60 bg-slate-50 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className={syncStyles[latestJob.status] || syncStyles.idle}>
                {latestJob.status === 'completed'
                  ? 'Job concluído'
                  : latestJob.status === 'partial'
                    ? 'Job parcial'
                    : latestJob.status === 'failed'
                      ? 'Job falhou'
                      : latestJob.status === 'running'
                        ? 'Job em execução'
                        : 'Job em fila'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {latestJob.finished_at
                  ? `Finalizado em ${new Date(latestJob.finished_at).toLocaleString('pt-BR')}`
                  : latestJob.started_at
                    ? `Iniciado em ${new Date(latestJob.started_at).toLocaleString('pt-BR')}`
                    : 'Aguardando processamento'}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {latestJob.connections_active || 0} de {latestJob.connections_total || 0} conexões aptas,
              com {latestJob.events_created || 0} eventos gerados no último ciclo.
            </p>
          </div>
        )}

        {connections.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            Nenhuma conexão de rede social foi mapeada para este perfil ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="rounded-xl border border-border/60 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{connection.platform}</span>
                      <span className="text-sm text-muted-foreground">{connection.handle}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Método: {connection.auth_method || 'manual'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className={statusStyles[connection.connection_status] || statusStyles.draft}
                    >
                      {formatConnectionStatus(connection.connection_status)}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={syncStyles[connection.last_sync_status || 'idle'] || syncStyles.idle}
                    >
                      {formatSyncStatus(connection.last_sync_status || 'idle')}
                    </Badge>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    {connection.connection_status === 'connected' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    {connection.credential_reference
                      ? `Referência segura: ${connection.credential_reference}`
                      : 'Sem referência de credencial'}
                  </span>
                  {connection.last_sync_at && (
                    <span className="flex items-center gap-1">
                      <Clock3 className="w-3.5 h-3.5" />
                      {new Date(connection.last_sync_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>

                {connection.last_error && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {connection.last_error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
