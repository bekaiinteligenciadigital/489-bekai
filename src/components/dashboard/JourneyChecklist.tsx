import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { getJourneyStatus, JourneyStatus } from '@/lib/journey'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

export function JourneyChecklist() {
  const { user } = useAuth()
  const isProf = user?.role === 'professional'

  const [status, setStatus] = useState<JourneyStatus | null>(null)

  const loadStatus = useCallback(async () => {
    const s = await getJourneyStatus()
    setStatus(s)
  }, [])

  useEffect(() => {
    loadStatus()
    window.addEventListener('kairos_journey_update', loadStatus)
    return () => window.removeEventListener('kairos_journey_update', loadStatus)
  }, [loadStatus])

  useRealtime('children', loadStatus)
  useRealtime('assessments', loadStatus)
  useRealtime('risk_profiles', loadStatus)
  useRealtime('action_plans', loadStatus)

  if (!status) return <div className="animate-pulse h-64 bg-secondary rounded-lg w-full" />

  const steps = [
    {
      key: 'setup',
      label: 'CONFIGURAÇÃO / CONTEXTUALIZAÇÃO',
      path: '/setup-jovem',
      done: status.setup,
    },
    {
      key: 'diagnostico',
      label: 'DIAGNÓSTICO DE INFLUÊNCIA',
      path: isProf ? '/diagnostico' : '/perfil',
      done: status.diagnostico,
    },
    {
      key: 'mapeamento',
      label: 'MAPEAMENTO DE RISCOS',
      path: '/mapeamento-riscos',
      done: status.mapeamento,
    },
    {
      key: 'ativacao',
      label: 'ATIVAÇÃO DE ESTRATÉGIAS',
      path: '/ativacao',
      done: status.ativacao,
    },
    {
      key: 'rebalanceamento',
      label: 'REBALANCEAMENTO ALGORÍTMICO',
      path: '/rebalanceamento',
      done: status.rebalanceamento,
    },
    {
      key: 'monitoramento',
      label: 'MONITORAMENTO DE ALFABETIZAÇÃO',
      path: '/monitoramento',
      done: status.monitoramento,
    },
  ]

  const completedCount = steps.filter((s) => s.done).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)

  return (
    <Card className="w-full shadow-sm border-t-4 border-t-primary">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">A Jornada Kairós</CardTitle>
            <CardDescription className="mt-1">
              Acompanhe seu progresso na implementação do protocolo de literacia digital.
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1 w-full md:w-48 shrink-0">
            <span className="text-sm font-semibold text-primary">{progressPercent}% Concluído</span>
            <Progress value={progressPercent} className="w-full h-2.5" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, idx) => (
            <Link
              key={step.key}
              to={step.path}
              className={cn(
                'group flex items-center justify-between p-3.5 rounded-lg border transition-all duration-200 hover:shadow-md',
                step.done
                  ? 'bg-rose-50 border-rose-200 hover:border-rose-300'
                  : 'bg-card border-border hover:border-primary/30 hover:bg-accent/50',
              )}
            >
              <div className="flex items-center gap-3">
                {step.done ? (
                  <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0 animate-in zoom-in" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p
                    className={cn(
                      'text-sm font-bold',
                      step.done ? 'text-rose-700' : 'text-foreground',
                    )}
                  >
                    Passo {idx + 1}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{step.label}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
