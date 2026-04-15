import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CreditCard, QrCode, Lock, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import useFamilyStore from '@/stores/useFamilyStore'

export default function Pagamento() {
  const navigate = useNavigate()
  const { plan, planPrice, essentialChildrenCount } = useFamilyStore()
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!plan) {
      toast({
        title: 'Selecione um plano',
        description: 'Você precisa selecionar um plano antes de prosseguir para o pagamento.',
        variant: 'destructive',
      })
      navigate('/planos')
    }
  }, [plan, navigate, toast])

  const processPayment = () => {
    setIsProcessing(true)

    // Simulating external gateway processing time (Stripe/MercadoPago)
    setTimeout(() => {
      sessionStorage.setItem('hasPaid', 'true')
      sessionStorage.setItem('paidEmail', email)

      const role = plan === 'Plano Essencial Profissional Saúde' ? 'professional' : 'subscriber'
      const activePlan =
        plan === 'Plano Essencial Profissional Saúde'
          ? 'essencial_profissional'
          : 'essencial_familia'

      sessionStorage.setItem('paidRole', role)
      sessionStorage.setItem('activePlan', activePlan)

      toast({
        title: 'Pagamento Aprovado!',
        description: 'Seu pagamento foi processado com segurança.',
      })
      navigate('/pagamento/sucesso')
    }, 2000)
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name || !cardNumber || !expiry || !cvv) {
      toast({
        title: 'Dados Incompletos',
        description: 'Preencha todos os dados de contato e cartão de crédito.',
        variant: 'destructive',
      })
      return
    }
    processPayment()
  }

  const handlePix = () => {
    if (!email) {
      toast({
        title: 'Email Obrigatório',
        description: 'Informe seu e-mail para receber o comprovante e acessar a plataforma.',
        variant: 'destructive',
      })
      return
    }
    processPayment()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price || 0)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 relative overflow-hidden pt-12">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      <div className="mb-6 text-center z-10 animate-fade-in-down w-full max-w-md">
        <h2 className="text-3xl font-serif font-bold text-primary flex items-center justify-center gap-2 mb-4">
          <Lock className="w-6 h-6 text-emerald-600" /> Checkout Seguro
        </h2>

        <div className="bg-background rounded-xl p-5 shadow-md border border-border/50 text-left">
          <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-secondary" />
            Resumo do Pedido
          </h3>
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-muted-foreground font-medium">{plan}</span>
            <span className="font-bold">{formatPrice(planPrice)}</span>
          </div>
          {plan === 'Plano Essencial Família' && (
            <div className="mt-1 flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Quantidade de filhos assistidos</span>
              <span className="font-semibold text-muted-foreground">{essentialChildrenCount}</span>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Mensal</span>
            <span className="text-xl font-bold text-emerald-600">{formatPrice(planPrice)}</span>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10 z-10 animate-fade-in-up bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-border/50 bg-muted/10">
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">E-mail para cobrança</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="bg-background h-11"
              />
              <p className="text-xs text-muted-foreground">
                Seu comprovante e acesso serão vinculados a este e-mail.
              </p>
            </div>
          </div>

          <Tabs defaultValue="cartao" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-muted/40">
              <TabsTrigger
                value="cartao"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold"
              >
                <CreditCard className="w-4 h-4 mr-2" /> Cartão
              </TabsTrigger>
              <TabsTrigger
                value="pix"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold"
              >
                <QrCode className="w-4 h-4 mr-2" /> PIX
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cartao" className="p-6 space-y-5 m-0 animate-fade-in">
              <form onSubmit={handleConfirm} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome no Cartão</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: CARLOS SILVA"
                    className="bg-background h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número do Cartão</Label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="bg-background h-11"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/AA"
                      className="bg-background h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      placeholder="123"
                      type="password"
                      className="bg-background h-11"
                      maxLength={4}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-14 mt-6 shadow-md text-base bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processando...
                    </>
                  ) : (
                    <>
                      Pagar {formatPrice(planPrice)} <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="pix" className="p-6 text-center space-y-6 m-0 animate-fade-in">
              <div className="bg-white p-4 rounded-xl border-2 border-dashed border-emerald-200 inline-block shadow-sm">
                <img
                  src="https://img.usecurling.com/i?q=qr-code&color=black"
                  alt="QR Code"
                  className="w-36 h-36 opacity-90"
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium text-foreground">
                  Escaneie o QR Code ou copie o código PIX
                </p>
                <Input
                  readOnly
                  value="00020101021126540014br.gov.bcb.pix..."
                  className="text-center bg-muted/30 text-xs font-mono"
                />
              </div>
              <Button
                onClick={handlePix}
                disabled={isProcessing}
                className="w-full h-14 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Verificando...
                  </>
                ) : (
                  <>
                    Já realizei o pagamento <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-muted-foreground flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" /> Pagamento processado de forma segura por Stripe / Mercado Pago.
      </p>
    </div>
  )
}
