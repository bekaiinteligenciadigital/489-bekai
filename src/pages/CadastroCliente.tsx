import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { ShieldCheck, Stethoscope, ArrowRight, Loader2, Mail } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import { getPendingCheckout } from '@/lib/checkout'

export default function CadastroCliente() {
  const [searchParams] = useSearchParams()
  const roleParam = searchParams.get('role')
  const tabParam = searchParams.get('tab')
  const nextParam = searchParams.get('next')
  const pendingCheckout = getPendingCheckout()

  const paidRole = sessionStorage.getItem('paidRole')
  const effectiveRole = paidRole || roleParam || pendingCheckout?.role
  const role = effectiveRole === 'professional' ? 'professional' : 'subscriber'
  const isProfessional = role === 'professional'

  const [activeTab, setActiveTab] = useState<string>(
    tabParam || (effectiveRole ? 'register' : 'login'),
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`
    setPhone(val)
  }
  const { toast } = useToast()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await pb.collection('Nascimento').requestPasswordReset(email)
      setResetSent(true)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível enviar o e-mail. Verifique o endereço informado.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAuth = async (e: React.FormEvent, action: 'login' | 'register') => {
    e.preventDefault()
    setLoading(true)

    try {
      if (action === 'register') {
        await pb.collection('Nascimento').create({
          email,
          password,
          passwordConfirm: password,
          name,
          phone,
          role,
        })

        await pb.collection('Nascimento').authWithPassword(email, password)

        toast({ title: 'Conta criada com sucesso!' })

        if (inviteCode) {
          sessionStorage.setItem('pendingInviteCode', inviteCode)
          sessionStorage.setItem('hasProfessional', 'true')
        }

        if (nextParam === 'payment' || pendingCheckout) {
          navigate('/pagamento')
        } else {
          navigate(role === 'professional' ? '/cadastro-profissional' : '/planos')
        }
      } else {
        await pb.collection('Nascimento').authWithPassword(email, password)
        toast({ title: 'Login realizado com sucesso!' })

        const user = pb.authStore.record
        if (nextParam === 'payment' || pendingCheckout) {
          navigate('/pagamento')
          return
        }

        if (user?.role === 'professional') {
          if (!user.council_id) {
            navigate('/cadastro-profissional')
          } else {
            navigate('/specialist/dashboard')
          }
        } else {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: getErrorMessage(error),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-primary hover:opacity-80 transition-opacity z-20"
      >
        <ShieldCheck className="w-8 h-8" />
        <span className="font-serif font-bold text-xl hidden sm:inline-block tracking-widest">
          BekAI
        </span>
      </Link>

      <div className="mb-8 text-center z-10 animate-fade-in-down mt-6">
        <h2 className="text-3xl font-serif font-bold text-primary flex items-center justify-center gap-3">
          {isProfessional && <Stethoscope className="w-8 h-8 text-secondary" />}
          {isProfessional ? 'Área do Profissional' : 'Acesso BekAI'}
        </h2>
        <p className="text-muted-foreground mt-2 font-medium max-w-md mx-auto">
          {isProfessional
            ? 'Crie sua conta para acessar ferramentas clínicas exclusivas e iniciar o acompanhamento de pacientes.'
            : 'Faça login ou crie sua conta para proteger e desenvolver sua família digitalmente.'}
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10 z-10 animate-fade-in-up bg-white">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-t-xl rounded-b-none h-12">
            <TabsTrigger value="login" className="data-[state=active]:font-bold text-base">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:font-bold text-base">
              Cadastro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="m-0">
            {forgotMode ? (
              resetSent ? (
                <>
                  <CardHeader>
                    <CardTitle className="text-xl">E-mail enviado!</CardTitle>
                    <CardDescription>
                      Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-4 py-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                      <Mail className="w-7 h-7 text-emerald-600" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => { setForgotMode(false); setResetSent(false) }}
                    >
                      Voltar ao login
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <form onSubmit={handleForgotPassword}>
                  <CardHeader>
                    <CardTitle className="text-xl">Recuperar senha</CardTitle>
                    <CardDescription>
                      Informe seu e-mail e enviaremos um link de redefinição.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar link'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={() => setForgotMode(false)}
                    >
                      Voltar ao login
                    </Button>
                  </CardFooter>
                </form>
              )
            ) : (
              <form onSubmit={(e) => handleAuth(e, 'login')}>
                <CardHeader>
                  <CardTitle className="text-xl">Bem-vindo de volta</CardTitle>
                  <CardDescription>Acesse sua conta para continuar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Senha</Label>
                      <button
                        type="button"
                        onClick={() => setForgotMode(true)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-12 text-md font-bold" disabled={loading}>
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
                  </Button>
                </CardFooter>
              </form>
            )}
          </TabsContent>

          <TabsContent value="register" className="m-0">
            <form onSubmit={(e) => handleAuth(e, 'register')}>
              <CardHeader>
                <CardTitle className="text-xl">Criar nova conta</CardTitle>
                <CardDescription>
                  {isProfessional
                    ? 'Preencha os dados básicos para iniciar.'
                    : 'Proteja sua família em poucos passos.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isProfessional && (
                  <div className="space-y-2 mb-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                    <Label htmlFor="reg-invite" className="text-emerald-800">
                      Código de Convite do Profissional (Opcional)
                    </Label>
                    <Input
                      id="reg-invite"
                      placeholder="Ex: A1B2C3"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      className="bg-white uppercase"
                    />
                    <p className="text-xs text-emerald-600">
                      Se você recebeu um convite de um especialista, insira o código aqui.
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nome Completo</Label>
                  <Input
                    id="reg-name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-phone">Telefone / WhatsApp</Label>
                  <Input
                    id="reg-phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Senha</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full h-12 text-md font-bold bg-primary hover:bg-primary/90"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Continuar <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
