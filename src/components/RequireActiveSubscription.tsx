import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

// Em modo de desenvolvimento, libera o acesso sem exigir assinatura ativa.
// Para bloquear novamente em produção, remova esta linha ou mude para false.
const DEV_BYPASS = import.meta.env.DEV === true

export function RequireActiveSubscription() {
  const { user, loading } = useAuth()

  if (loading) return null

  // Bypass para desenvolvimento/testes
  if (DEV_BYPASS) return <Outlet />

  if (!user) {
    return <Navigate to="/planos" replace />
  }

  // Treat empty as active to not break previous accounts that do not have this new field,
  // but enforce active/trialing for accounts that already possess the field correctly.
  const status = user.subscription_status
  if (status && status !== 'active' && status !== 'trialing') {
    return <Navigate to="/dashboard/subscription" replace />
  }

  return <Outlet />
}
