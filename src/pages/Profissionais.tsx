import { useAuth } from '@/hooks/use-auth'
import { Navigate, Link } from 'react-router-dom'
import { ScientificLibrary } from '@/components/ScientificLibrary'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowRight, Loader2, LogOut, Lock } from 'lucide-react'

export default function Profissionais() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  // Authentication Requirement & Navigation Safety:
  // Unauthenticated users (or those who just logged out) are immediately redirected
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Access Denied / Upsell State for non-professionals
  if (user.role !== 'professional') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-lg border-amber-100">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-amber-100 text-amber-700 flex items-center justify-center rounded-full mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <CardTitle className="text-2xl font-serif text-slate-900">
              Módulo Profissional Bloqueado
            </CardTitle>
            <CardDescription className="text-base text-slate-600">
              Sua conta atual não possui acesso à Biblioteca Científica e ao painel de inteligência
              clínica.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="bg-slate-100 p-4 rounded-lg text-sm text-slate-700">
              O KAIRÓS para profissionais oferece escalonamento de risco, mapeamento de vieses
              algorítmicos e acesso direto a uma curadoria de evidências científicas focadas no
              impacto digital.
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                <Link to="/cadastro-profissional">
                  Solicitar Acesso Profissional <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" onClick={() => signOut()}>
                Sair e voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render Professional Dashboard
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="py-4 px-6 border-b bg-white flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2 text-emerald-800">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-serif font-bold text-lg">
            KAIRÓS{' '}
            <span className="font-sans font-normal text-sm text-emerald-600 ml-1">CLÍNICA</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600 hidden sm:inline-block">
            Olá, {user.name || user.email}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-slate-600 hover:text-slate-900"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 animate-fade-in-up">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            Biblioteca Científica
          </h1>
          <p className="text-slate-600">
            Evidências globais e literatura médica correlacionada ao impacto digital.
          </p>
        </div>
        <ScientificLibrary />
      </main>

      <footer className="bg-slate-950 py-6 text-center text-slate-500 text-sm border-t border-slate-900 mt-auto">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-800">
            <Lock className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-[10px] tracking-wider text-slate-400">
              Propriedade intelectual de JOSÉ ANTONIO DO NASCIMENTO JUNIOR - 36232084500
            </span>
          </div>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} KAIRÓS Saúde Digital. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
