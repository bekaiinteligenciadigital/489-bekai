import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import pb from '@/lib/pocketbase/client'
import { clearPendingCheckout } from '@/lib/checkout'

export default function PagamentoSucesso() {
  const navigate = useNavigate()

  useEffect(() => {
    if (sessionStorage.getItem('hasPaid') !== 'true') {
      navigate('/planos')
    }
  }, [navigate])

  const handleContinue = () => {
    clearPendingCheckout()
    const user = pb.authStore.record
    const role = sessionStorage.getItem('paidRole') || user?.role || 'subscriber'

    if (role === 'professional') {
      navigate('/cadastro-profissional')
      return
    }

    navigate('/setup-jovem')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="max-w-md w-full bg-background rounded-xl p-8 shadow-xl text-center animate-fade-in-up border border-border/50">
        <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl font-serif font-bold text-primary mb-4">Pagamento Aprovado!</h1>
        <p className="text-muted-foreground mb-8">
          Seu pagamento foi processado com sucesso. Agora vamos concluir a ativacao da sua jornada
          dentro da plataforma.
        </p>
        <Button onClick={handleContinue} className="w-full h-14 text-lg font-bold">
          Continuar
        </Button>
      </div>
    </div>
  )
}
