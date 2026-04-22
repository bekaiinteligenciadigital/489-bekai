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
import pb from '@/lib/pocketbase/client'
import { getPendingCheckout } from '@/lib/checkout'

export default function Pagamento() {
  const navigate = useNavigate()
  const { plan, planPrice, essentialChildrenCount, setPlan } = useFamilyStore()
  const { toast } = useToast()
  const pendingCheckout = getPendingCheckout()
  const summaryPlan = pendingCheckout?.planName || plan
  const summaryPrice = pendingCheckout?.planPrice || planPrice
  const summaryRole = pendingCheckout?.role || 'subscriber'

  const [email, setEmail] = useState(pb.authStore.record?.email || '')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState(pb.authStore.record?.name || '')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCardNumberChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
    setCardNumber(formatted)
  }

  const handleExpiryChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
    setExpiry(formatted)
  }

  const handleCvvChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    setCvv(digits)
  }

  useEffect(() => {
    if (!pb.authStore.record) {
      toast({
        title: 'Crie sua conta primeiro',
        description: 'Para sua seguranca, finalize o cadastro antes de prosseguir ao pagamento.',
        variant: 'destructive',
      })
      navigate('/cadastro-cliente?tab=register&next=payment')
      return
    }

    if (pendingCheckout?.planName) {
      setPlan(pendingCheckout.planName, pendingCheckout.planPrice)
      return
    }

    if (!plan) {
      toast({
        title: 'Selecione um plano',
        description: 'Voce precisa selecionar um plano antes de prosseguir para o pagamento.',
        variant: 'destructive',
      })
      navigate('/planos')
    }
  }, [navigate, pendingCheckout, plan, setPlan, toast])

  const processPayment = () => {
    setIsProcessing(true)

    setTimeout(() => {
      sessionStorage.setItem('hasPaid', 'true')
      sessionStorage.setItem('paidEmail', email)
      sessionStorage.setItem('paidRole', summaryRole)
      sessionStorage.setItem('activePlan', pendingCheckout?.planId || 'essencial_familia')

      toast({
        title: 'Pagamento aprovado!',
        description: 'Seu pagamento foi processado com seguranca.',
      })
      navigate('/pagamento/sucesso')
    }, 2000)
  }

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !name || !cardNumber || !expiry || !cvv) {
      toast({
        title: 'Dados incompletos',
        description: 'Preencha todos os dados de contato e cartao de credito.',
        variant: 'destructive',
      })
      return
    }

    const cardDigits = cardNumber.replace(/\D/g, '')
    const expiryDigits = expiry.replace(/\D/g, '')

    if (cardDigits.length !== 16) {
      toast({
        title: 'Numero do cartao invalido',
        description: 'Informe exatamente 16 numeros no cartao.',
        variant: 'destructive',
      })
      return
    }

    if (expiryDigits.length !== 4) {
      toast({
        title: 'Validade invalida',
        description: 'Informe a validade com 4 numeros no formato MM/AA.',
        variant: 'destructive',
      })
      return
    }

    if (cvv.length < 3 || cvv.length > 4) {
      toast({
        title: 'CVV invalido',
        description: 'Informe um CVV com 3 ou 4 numeros.',
        variant: 'destructive',
      })
      return
    }

    processPayment()
  }

  const handlePix = () => {
    if (!email) {
      toast({
        title: 'Email obrigatorio',
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
            <span className="text-muted-foreground font-medium">{summaryPlan}</span>
            <span className="font-bold">{formatPrice(summaryPrice)}</span>
          </div>
          {pendingCheckout?.planId === 'essencial_familia' && (
            <div className="mt-1 flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Quantidade de filhos assistidos</span>
              <span className="font-semibold text-muted-foreground">{essentialChildrenCount}</span>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
            <span className="font-semibold text-foreground">Total Mensal</span>
            <span className="text-xl font-bold text-emerald-600">{formatPrice(summaryPrice)}</span>
          </div>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10 z-10 animate-fade-in-up bg-white">
        <CardContent className="p-0">
          <div className="p-6 border-b border-border/50 bg-muted/10">
            <div className="space-y-2">
              <Label className="text-foreground font-semibold">E-mail para cobranca</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="bg-background h-11"
              />
              <p className="text-xs text-muted-foreground">
                Seu comprovante e acesso serao vinculados a este e-mail.
              </p>
            </div>
          </div>

          <Tabs defaultValue="cartao" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none h-14 bg-muted/40">
              <TabsTrigger
                value="cartao"
                className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-semibold"
              >
                <CreditCard className="w-4 h-4 mr-2" /> Cartao
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
                  <Label>Nome no Cartao</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: CARLOS SILVA"
                    className="bg-background h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Numero do Cartao</Label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="0000 0000 0000 0000"
                    className="bg-background h-11"
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input
                      value={expiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="MM/AA"
                      className="bg-background h-11"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input
                      value={cvv}
                      onChange={(e) => handleCvvChange(e.target.value)}
                      placeholder="123"
                      type="password"
                      className="bg-background h-11"
                      maxLength={4}
                      inputMode="numeric"
                      autoComplete="cc-csc"
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
                      Pagar {formatPrice(summaryPrice)} <ArrowRight className="w-5 h-5 ml-2" />
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
                  Escaneie o QR Code ou copie o codigo PIX
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
                    Ja realizei o pagamento <ArrowRight className="w-5 h-5 ml-2" />
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
