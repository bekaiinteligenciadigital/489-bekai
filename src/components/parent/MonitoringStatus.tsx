import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Child } from '@/services/parent'

export function MonitoringStatus({ child }: { child: Child }) {
  const platforms: any[] = Array.isArray(child?.platforms) ? child.platforms : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending_credentials':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'sync_error':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo'
      case 'pending_credentials':
        return 'Aguardando Credenciais'
      case 'sync_error':
        return 'Erro de Sincronização'
      default:
        return 'Inativo'
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-indigo-900">
          <Activity className="w-5 h-5" /> Status do Monitoramento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            {child.monitoring_status === 'active' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            )}
            <span className="text-sm font-medium text-slate-700">Estado Geral</span>
          </div>
          <Badge
            variant="outline"
            className={`px-2 py-0.5 ${getStatusColor(child.monitoring_status)}`}
          >
            {getStatusText(child.monitoring_status)}
          </Badge>
        </div>

        {child.last_sync_at && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 flex items-center gap-1">
              <Clock className="w-4 h-4" /> Última Sincronização
            </span>
            <span className="font-medium text-slate-800">
              {new Date(child.last_sync_at).toLocaleString('pt-BR')}
            </span>
          </div>
        )}

        {platforms.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
              Plataformas Mapeadas
            </span>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-slate-100 text-slate-700 border-slate-200"
                >
                  {/* FIX: Render string property instead of the entire object */}
                  {p?.platform || 'Desconhecida'} {p?.handle ? `(@${p.handle})` : ''}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
