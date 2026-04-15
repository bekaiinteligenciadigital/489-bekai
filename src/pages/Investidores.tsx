import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  PieChart,
  Globe,
  Zap,
  DollarSign,
  Users,
  Building,
  CheckCircle2,
} from 'lucide-react'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Link } from 'react-router-dom'

export default function Investidores() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      await pb.collection('leads').create({
        name: formData.name,
        email: formData.email,
        message: formData.message,
        interest_type: 'investor',
      })

      toast({
        title: 'Mensagem Enviada!',
        description: 'Recebemos sua pré-inscrição. Nossa equipe de RI entrará em contato em breve.',
      })

      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      setErrors(extractFieldErrors(err))
      toast({
        title: 'Erro ao enviar',
        description: 'Verifique os campos e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary">
            <ShieldCheck className="w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-tight">BekAI</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" /> Relações com Investidores
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground leading-tight max-w-4xl mx-auto">
            Invista na Saúde Digital do Futuro
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            O BekAI é o principal ecossistema de curadoria digital, conectando famílias, jovens e
            especialistas. Junte-se a nós nesta rodada de captação para escalar nosso impacto
            global.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="gap-2 shadow-lg"
              onClick={() =>
                document
                  .getElementById('form-pre-inscricao')
                  ?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Fazer Pré-inscrição <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>

        {/* Modelo de Negócios */}
        <section className="bg-slate-50 py-20 px-4 border-y border-slate-200">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-slate-900">Modelo de Negócios</h2>
              <p className="text-slate-600 mt-4 text-lg">
                Ecossistema B2B2C com alta retenção e previsibilidade de receita.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">B2C (Direct to Consumer)</CardTitle>
                  <CardDescription>
                    Foco em pais e responsáveis preocupados com a saúde digital.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />{' '}
                      Assinatura mensal SaaS para monitoramento familiar.
                    </li>
                    <li className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> CAC
                      reduzido através de marketing de conteúdo e comunidade.
                    </li>
                    <li className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> LTV
                      elevado (média de 24 a 36 meses).
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                    <Building className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">B2B2C (Profissionais e Escolas)</CardTitle>
                  <CardDescription>
                    Captação em rede através de especialistas em saúde e instituições.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> Clínicos
                      e escolas pagam por licenças de gestão.
                    </li>
                    <li className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> Efeito
                      de rede: Profissionais recomendam a ferramenta aos pacientes.
                    </li>
                    <li className="flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /> Churn
                      virtualmente zero em parcerias educacionais.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pilares de Escalabilidade */}
        <section className="py-24 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
                Pilares de Escalabilidade
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center p-6 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Zap className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl">Automação por IA</h3>
                <p className="text-muted-foreground leading-relaxed">
                  O diagnóstico e mapeamento de riscos são feitos via LLMs proprietários, zerando o
                  custo marginal de novas análises e permitindo escala infinita.
                </p>
              </div>
              <div className="text-center p-6 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                  <Globe className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl">Infraestrutura Cloud</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Arquitetura baseada em microsserviços globais. Pronto para tradução e atuação em
                  múltiplos idiomas em menos de 3 meses.
                </p>
              </div>
              <div className="text-center p-6 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <PieChart className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-xl">Crescimento Viral</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Funcionalidades de compartilhamento de relatórios e métricas de segurança escolar
                  geram curiosidade natural na rede de contatos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Precificação e Projeção Financeira */}
        <section className="bg-slate-900 text-slate-50 py-24 px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
                Projeção Financeira e Tração
              </h2>
              <p className="text-slate-300 leading-relaxed text-lg">
                Nosso mercado endereçável (TAM) é de 45 milhões de crianças apenas no Brasil, em um
                mercado global de saúde digital infanto-juvenil projetado para US$ 25 Bi até 2028.
              </p>
              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">Ano 1 (Seed)</span>
                  <span className="font-mono font-bold text-xl text-white">
                    10k Users | ARR R$ 6M
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">Ano 2 (Série A)</span>
                  <span className="font-mono font-bold text-xl text-white">
                    50k Users | ARR R$ 30M
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200">Ano 3 (Série B)</span>
                  <span className="font-mono font-bold text-xl text-white">
                    200k Users | ARR R$ 120M
                  </span>
                </div>
              </div>
            </div>

            <Card className="bg-white text-slate-900 shadow-2xl border-none">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2 text-primary">
                  <DollarSign className="w-5 h-5" />
                  <span className="font-semibold uppercase tracking-wider text-sm">
                    Precificação
                  </span>
                </div>
                <CardTitle className="text-2xl">Pricing Model</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-semibold text-lg">Familiar (B2C)</span>
                    <span className="font-mono font-bold text-xl text-primary">
                      R$ 49,90
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acesso ao monitoramento e rebalanceamento para até 3 filhos.
                  </p>
                </div>
                <div className="h-px bg-slate-100" />
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-semibold text-lg">Profissional Clínico</span>
                    <span className="font-mono font-bold text-xl text-primary">
                      R$ 149,90
                      <span className="text-sm font-normal text-muted-foreground">/mês</span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dashboard unificado, relatórios aprofundados de múltiplos pacientes.
                  </p>
                </div>
                <div className="h-px bg-slate-100" />
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-semibold text-lg">Escolar / Enterprise</span>
                    <span className="font-mono font-bold text-xl text-primary">Sob Consulta</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gestão de milhares de alunos, relatórios de clima digital escolar e APIs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Lead Capture Form */}
        <section
          id="form-pre-inscricao"
          className="py-24 px-4 bg-slate-50 border-t border-slate-200"
        >
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-serif text-slate-900">Pré-inscrição</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Deixe seus dados para receber o nosso Pitch Deck e acessar o Data Room restrito.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome / Fundo de Investimento</Label>
                      <Input
                        id="name"
                        placeholder="Seu nome ou fundo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="h-12"
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail Profissional</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="voce@fundo.vc"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-12"
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem / Tese de Investimento (Opcional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Conte-nos sobre sua tese ou interesse no BekAI..."
                      className="resize-none h-32"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                    {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 text-lg h-14"
                    disabled={loading}
                  >
                    {loading ? 'Processando...' : 'Realizar Pré-inscrição'}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-white text-center text-sm text-slate-500 border-t">
        <p>
          &copy; {new Date().getFullYear()} BekAI Saúde Digital. Área de Relações com Investidores.
        </p>
      </footer>
    </div>
  )
}
