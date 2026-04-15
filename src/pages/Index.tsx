import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-pulse text-muted-foreground font-medium">Carregando painel...</div>
      </div>
    )
  }

  if (user?.role === 'professional') {
    return <Navigate to="/specialist/dashboard" replace />
  }

  return <Navigate to="/parent/dashboard" replace />
}
