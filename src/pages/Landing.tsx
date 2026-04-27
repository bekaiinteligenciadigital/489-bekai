import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DossieModal } from '@/components/landing/DossieModal'
import { useAuth } from '@/hooks/use-auth'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'
import {
  ShieldCheck,
  ArrowRight,
  Stethoscope,
  CheckCircle2,
  Users,
  Building,
  Activity,
  Ear,
  Eye,
  Sparkles,
  Map,
  LogIn,
  X,
  Loader2,
  Lock,
  Mail,
  AlertCircle,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Login Modal
// ---------------------------------------------------------------------------
function LoginModal({ onClose }: { onClose: () => void }) {
  const { signIn, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [view, setView] = useState<'login' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError('E-mail ou senha incorretos. Tente novamente.')
    } else {
      onClose()
      navigate('/dashboard')
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError('Não foi possível enviar o e-mail. Verifique o endereço informado.')
    } else {
      setResetSent(true)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-fade-in-up">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img src={logoUrl} alt="BekAI" className="w-10 h-10 rounded-xl object-contain shadow-sm" />
          <span className="font-serif font-bold text-xl text-primary tracking-widest">BekAI</span>
        </div>

        {view === 'login' ? (
          <>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm mb-8">Entre com sua conta para acessar o dashboard.</p>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium text-sm">
                  E-mail
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10 h-12 border-slate-200 focus:border-primary rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium text-sm">
                    Senha
                  </Label>
                  <button
                    type="button"
                    onClick={() => { setError(''); setView('forgot') }}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-12 border-slate-200 focus:border-primary rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-semibold rounded-xl shadow-md shadow-primary/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...
                  </>
                ) : (
                  <>
                    Entrar no Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Ainda não tem conta?{' '}
              <Link to="/planos" onClick={onClose} className="text-primary font-semibold hover:underline">
                Começar agora
              </Link>
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => { setError(''); setResetSent(false); setView('login') }}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
            >
              ← Voltar ao login
            </button>

            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-1">Recuperar senha</h2>
            <p className="text-slate-500 text-sm mb-8">
              Informe seu e-mail e enviaremos um link para redefinir sua senha.
            </p>

            {resetSent ? (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Mail className="w-7 h-7 text-emerald-600" />
                </div>
                <p className="text-slate-700 font-medium">E-mail enviado com sucesso!</p>
                <p className="text-slate-500 text-sm">
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => { setResetSent(false); setView('login') }}
                >
                  Voltar ao login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-slate-700 font-medium text-sm">
                    E-mail
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 h-12 border-slate-200 focus:border-primary rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold rounded-xl shadow-md shadow-primary/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...
                    </>
                  ) : (
                    <>
                      Enviar link de recuperação <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Landing Page
// ---------------------------------------------------------------------------
export default function Landing() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}
      <header className="py-5 px-6 md:px-10 flex items-center justify-between border-b bg-white/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3 text-primary">
          <img
            src={logoUrl}
            alt="BekAI Logo"
            className="w-9 h-9 object-contain rounded-md shadow-sm"
          />
          <span className="font-serif font-bold text-xl hidden sm:inline-block tracking-widest">
            BekAI
          </span>
        </div>

        {/* Nav buttons — secondary actions left, primary right */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="font-semibold hidden sm:flex text-primary/80">
            <Link to="/investidores">Área do Investidor</Link>
          </Button>
          <Button
            asChild
            className="bg-yellow-200 text-yellow-900 hover:bg-yellow-300 font-bold shadow-md hidden lg:flex"
          >
            <Link to="/clinical-demo">BekAI Clinical</Link>
          </Button>
          <Button asChild className="shadow-md shadow-primary/20">
            <Link to="/planos">Começar Agora</Link>
          </Button>
          {/* Separator */}
          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-1" />
          {/* Subscriber access — rightmost */}
          <Button
            variant="outline"
            className="border-primary/40 text-primary hover:bg-primary/5 font-semibold hidden sm:flex gap-2"
            onClick={() => setShowLogin(true)}
          >
            <LogIn className="w-4 h-4" /> Já sou assinante
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* ---------------------------------------------------------------- */}
        {/* Hero Section — full-width background image, centrado            */}
        {/* ---------------------------------------------------------------- */}
        <section
          className="relative flex min-h-[calc(100vh-5rem)] items-start justify-center overflow-hidden"
          style={{
            backgroundImage: "url('/hero.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.9)_0%,rgba(255,255,255,0.8)_28%,rgba(255,255,255,0.5)_50%,rgba(255,255,255,0.18)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.78),rgba(255,255,255,0.12)_58%,rgba(255,255,255,0)_100%)]" />
          <div className="absolute inset-y-0 left-0 w-full md:w-[62%] bg-[radial-gradient(circle_at_center,rgba(248,250,252,0.95),rgba(248,250,252,0.72)_42%,rgba(248,250,252,0.18)_78%,rgba(248,250,252,0)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-44 bg-gradient-to-b from-transparent via-white/50 to-white" />

          {/* Conteúdo centralizado */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-10 pt-10 pb-16 md:pt-14 flex flex-col items-center text-center space-y-6 animate-fade-in-up">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-semibold border-secondary/20 gap-2 shadow-sm backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4" /> Plataforma de Governança Digital
            </Badge>

            <div className="w-full max-w-3xl rounded-[2rem] border border-white/55 bg-white/46 px-5 py-6 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-md md:px-10 md:py-8">
              <div className="space-y-5">
                <h1 className="text-4xl md:text-5xl xl:text-[3.55rem] font-serif font-bold text-primary leading-[1.04] tracking-tight">
                  BekAI: Inteligência Digital a Serviço da{' '}
                  <span className="inline-block text-secondary [text-shadow:-1px_-1px_0_rgba(0,0,0,0.95),2px_-1px_0_rgba(0,0,0,0.95),-1px_1px_0_rgba(0,0,0,0.95),1px_1px_0_rgba(0,0,0,0.95),0_2px_14px_rgba(255,255,255,0.35)]"
                  >
                    Saúde Mental
                  </span>
                </h1>

                <p className="mx-auto max-w-2xl text-lg md:text-[1.35rem] text-slate-700 leading-relaxed">
                  Muito além do bloqueio de telas. Somos um ecossistema que atua como mentor
                  invisível, reeducando algoritmos e promovendo o desenvolvimento cognitivo
                  saudável para a nova geração.
                </p>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex max-w-3xl flex-wrap justify-center gap-2 text-sm">
              {[
                { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, text: 'Dados protegidos' },
                { icon: <CheckCircle2 className="w-4 h-4 text-primary" />, text: 'Baseado em evidências' },
                { icon: <Users className="w-4 h-4 text-secondary" />, text: 'Para toda a família' },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-1.5 bg-white/88 backdrop-blur-md border border-white/70 rounded-full px-3 py-1.5 shadow-sm font-medium text-slate-700">
                  {icon} {text}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button
                asChild
                size="lg"
                className="h-13 px-8 text-base shadow-xl hover:scale-105 transition-transform"
              >
                <Link to="/planos">
                  Começar Agora <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-13 px-8 text-base border-primary/15 text-primary bg-white/82 backdrop-blur-md hover:bg-white"
              >
                <Link to="/clinical-demo">
                  BekAI Clinical <Stethoscope className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Subscriber shortcut */}
            <button
              onClick={() => setShowLogin(true)}
              className="group inline-flex items-center gap-3 bg-white/88 backdrop-blur-md border border-white/70 hover:border-primary/25 rounded-2xl px-5 py-3.5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-primary leading-tight">Já sou assinante</p>
                <p className="text-xs text-slate-500">Acessar minha conta e dashboard</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Metaphors & Value Proposition Section                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-24 px-4 bg-white border-border/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">
                O que está por baixo da superfície das telas?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Entenda como o BekAI complementa o cuidado familiar e a prática clínica através de
                dados visuais objetivos.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              <Card className="bg-primary/5 border-primary/20 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <Map className="w-48 h-48 text-primary" />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-4">
                    <Map className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-serif text-primary">
                    Para Famílias: Um Mapa Detalhado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <p className="text-slate-700 leading-relaxed text-lg italic">
                    "Imagine ter um mapa detalhado de como seu filho interage com o mundo digital. O
                    BekAI não substitui a avaliação profissional, mas traz clareza sobre
                    comportamentos que costumam ficar invisíveis no dia a dia."
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-emerald-50 border-emerald-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform">
                  <Activity className="w-48 h-48 text-emerald-600" />
                </div>
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-emerald-200 text-emerald-800 flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-2xl font-serif text-emerald-900">
                    Para Profissionais: Exame de Imagem Digital
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <p className="text-emerald-800/90 leading-relaxed text-lg italic">
                    "O BekAI atua como uma 'fotografia' dos hábitos de consumo nas redes sociais,
                    revelando detalhes que nem mesmo uma conversa no consultório consegue mostrar,
                    ajudando a entender a vida online dos jovens."
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 bg-slate-900 rounded-3xl p-8 lg:p-12 text-center text-white relative overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emerald-600/20 mix-blend-overlay"></div>
              <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                <h3 className="text-2xl md:text-3xl font-serif font-semibold">
                  A Diferença entre Ouvir e Enxergar
                </h3>
                <div className="grid sm:grid-cols-2 gap-6 pt-6 max-w-2xl mx-auto">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    <Ear className="w-8 h-8 mx-auto mb-4 text-slate-300" />
                    <h4 className="font-semibold text-lg mb-2">Prática Tradicional</h4>
                    <p className="text-slate-400 text-sm">
                      Ouvir relatos subjetivos sobre o uso de telas e redes sociais.
                    </p>
                  </div>
                  <div className="bg-primary/20 rounded-2xl p-6 backdrop-blur-sm border border-primary/30 shadow-lg shadow-primary/20">
                    <Eye className="w-8 h-8 mx-auto mb-4 text-white" />
                    <h4 className="font-semibold text-lg mb-2 text-white">Com o BekAI</h4>
                    <p className="text-slate-200 text-sm">
                      Enxergar dados concretos, padrões de consumo e métricas de impacto emocional.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Application Scenarios                                            */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-24 px-4 bg-slate-50 border-t border-slate-200">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900">
                Aplicações Práticas: O Ecossistema
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 mb-6 px-4 py-1 text-sm w-fit">
                  Cenário: Famílias
                </Badge>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">
                  O Mentor Digital
                </h3>
                <p className="text-slate-600 mb-8 flex-1">
                  Substituímos o bloqueio autoritário por reeducação. O BekAI insere sutilmente
                  conteúdos de contraposição que competem em engajamento com narrativas nocivas.
                </p>
                <Button asChild variant="ghost" className="w-full text-primary hover:bg-primary/5">
                  <Link to="/planos">
                    Começar Agora <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                <Badge className="bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 mb-6 px-4 py-1 text-sm w-fit">
                  Cenário: Escolas
                </Badge>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Saúde Escolar</h3>
                <p className="text-slate-600 mb-8 flex-1">
                  Raio-x anonimizado do clima emocional e focos de atenção dos alunos, permitindo
                  intervenções pedagógicas antes que problemas afetem a sala de aula.
                </p>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full text-secondary-foreground hover:bg-secondary/10"
                >
                  <Link to="/investidores">
                    Saiba Mais <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 mb-6 px-4 py-1 text-sm w-fit">
                  Cenário: Profissionais
                </Badge>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">Apoio Clínico</h3>
                <p className="text-slate-600 mb-8 flex-1">
                  Suporte à decisão clínica com análises baseadas em evidências reais e ferramentas
                  de monitoramento para diagnósticos mais precisos.
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full text-emerald-700 hover:bg-emerald-50"
                  >
                    <Link to="/clinical-demo">
                      Saiba Mais <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <DossieModal>
                    <Button
                      variant="outline"
                      className="w-full border-emerald-200 text-emerald-800"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Ver Exemplo de Dossiê
                    </Button>
                  </DossieModal>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* CTA Final                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="py-24 px-4 bg-slate-950 relative overflow-hidden text-center flex flex-col items-center justify-center border-t border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-primary/40 opacity-90 z-0"></div>
          <div className="max-w-4xl mx-auto relative z-10 space-y-8 animate-fade-in-up">
            <ShieldCheck className="w-16 h-16 text-secondary mx-auto mb-4 opacity-90 drop-shadow-md" />
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight drop-shadow-sm">
              Não deixe seu filho navegar sozinho no abismo digital.
            </h2>
            <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto font-light">
              O BekAI transforma dados invisíveis em proteção real. Protegemos a saúde mental
              identificando riscos de ansiedade e exposição inadequada antes que se tornem crises.
            </p>
            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="h-16 px-12 text-xl shadow-2xl hover:scale-105 transition-transform bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-full"
              >
                <Link to="/planos">
                  Garantir Proteção Agora <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-10 text-lg rounded-full border-white/20 text-white hover:bg-white/10 font-semibold gap-2"
                onClick={() => setShowLogin(true)}
              >
                <LogIn className="w-5 h-5" /> Já sou assinante
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-slate-950 text-slate-400 text-center text-sm border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-serif font-bold text-lg tracking-widest">BekAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/investidores" className="hover:text-slate-200 transition-colors">
              Área do Investidor
            </Link>
            <Link to="/clinical-demo" className="hover:text-slate-200 transition-colors">
              Profissionais Clínicos
            </Link>
          </div>
          <p>
            &copy; {new Date().getFullYear()} BekAI Saúde Digital. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
