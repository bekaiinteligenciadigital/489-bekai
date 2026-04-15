import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClinicalFaq } from '@/components/landing/ClinicalFaq'
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  Stethoscope,
  EyeOff,
  Target,
  HeartPulse,
  Clock,
  RefreshCw,
  Handshake,
  LineChart,
  FileText,
  ArrowRight,
} from 'lucide-react'

const solutionSteps = [
  {
    icon: EyeOff,
    title: '1. Identificação de Padrões',
    desc: 'Compreensão profunda do comportamento de consumo, mapeando excessos sem invadir a privacidade básica do paciente.',
  },
  {
    icon: Target,
    title: '2. Mapeamento de Gatilhos',
    desc: 'Detecção ativa de narrativas prejudiciais, comparação social e conteúdos indutores de ansiedade ou isolamento.',
  },
  {
    icon: HeartPulse,
    title: '3. Equivalência de Atração',
    desc: 'Sugestão inteligente de conteúdos positivos que possuam a mesma qualidade estética e de engajamento.',
  },
  {
    icon: Clock,
    title: '4. Distribuição Inteligente',
    desc: 'Ajuste de timing e inserção de fricções positivas para combater o tédio reativo e a rolagem infinita.',
  },
  {
    icon: RefreshCw,
    title: '5. Reeducação do Feed',
    desc: 'Treinamento prático e guiado do algoritmo da rede social, ensinando-o a entregar cultura e conhecimento estruturado.',
  },
  {
    icon: Handshake,
    title: '6. O Algoritmo como Aliado',
    desc: 'Transformação definitiva das recomendações digitais em um ativo contínuo de desenvolvimento intelectual e emocional.',
  },
]

const practiceBenefits = [
  {
    icon: FileText,
    title: 'Relatórios Data-Driven',
    desc: 'Acesse dossiês mensais com métricas exatas de horas de tela e padrões de doomscrolling, traduzindo o tempo online em dados clínicos.',
  },
  {
    icon: LineChart,
    title: 'Monitoramento Longitudinal',
    desc: 'Acompanhe a evolução do Quociente Digital (DQ) do paciente e a efetividade das intervenções clínicas ao longo do tempo.',
  },
  {
    icon: Activity,
    title: 'Precisão e Intervenção Precoce',
    desc: 'Detecte precocemente sinais de niilismo, cyberbullying ou distúrbios de autoimagem antes que se manifestem gravemente na rotina física.',
  },
]

export default function ProfessionalDemo() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      {/* Header Clínico */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-slate-500 hover:text-emerald-700"
          >
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-emerald-700">
            <Stethoscope className="w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-wide hidden sm:inline-block">
              BekAI Clínico
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            asChild
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md"
          >
            <Link to="/planos">Assinar Plano Profissional</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 px-4 bg-emerald-900 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1200/800?q=medical%20network&color=green')] opacity-10 bg-cover bg-center mix-blend-overlay" />
          <div className="max-w-4xl mx-auto relative z-10 space-y-6 animate-fade-in-up">
            <Badge className="bg-emerald-800 text-emerald-100 border-emerald-700 mb-4 py-1.5 px-4">
              Uso Exclusivo para Profissionais de Saúde
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight drop-shadow-sm">
              Inteligência Digital Avançada para Prática Clínica
            </h1>
            <p className="text-lg md:text-xl text-emerald-100/90 leading-relaxed max-w-3xl mx-auto font-light">
              Uma ferramenta de suporte à decisão clínica que traduz o comportamento digital do
              paciente em métricas de risco e saúde mental, embasadas em evidências sólidas.
            </p>
          </div>
        </section>

        {/* A Crise Invisível */}
        <section className="py-24 bg-white px-4 border-b border-slate-100">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
                A Crise Invisível
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Crianças e adolescentes perdem o controle para algoritmos desenhados para viciar. O
                resultado no consultório é o esgotamento mental: fadiga de decisão, transtornos de
                atenção e ansiedade algorítmica.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Bloqueadores tradicionais apenas adiam o problema, gerando atrito familiar. A
                verdadeira solução exige educação de ambiente e métricas reais de acompanhamento
                para o profissional estruturar intervenções assertivas.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" /> Perda de controle
                  sobre a própria atenção.
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" /> Consumo passivo e
                  comparação social tóxica.
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" /> Falta de métricas
                  reais para intervenção médica ou psicológica.
                </li>
              </ul>
            </div>
            <div className="relative h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent rounded-3xl transform rotate-3 scale-105 -z-10 blur-xl" />
              <img
                src="https://img.usecurling.com/p/800/600?q=digital%20stress&color=gray"
                alt="Impacto Digital na Saúde Mental"
                className="rounded-3xl shadow-2xl object-cover w-full h-full border border-slate-100"
              />
            </div>
          </div>
        </section>

        {/* A Solução - O Mentor Invisível */}
        <section className="py-24 bg-slate-50 px-4 border-b border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-emerald-900">
                A Solução: O Mentor Invisível
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                Um processo clínico-tecnológico em 6 etapas que transforma o tempo de tela do
                paciente em uma jornada monitorada e ativa.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solutionSteps.map((step, i) => (
                <Card
                  key={i}
                  className="border-slate-200 shadow-sm hover:shadow-md transition-all group"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl text-slate-800">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Potencialize sua Prática Clínica */}
        <section className="py-24 bg-white px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
                Potencialize sua Prática Clínica
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Integre dados objetivos sobre o consumo digital do paciente para formular
                diagnósticos mais embasados e realizar intervenções clínicas seguras.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {practiceBenefits.map((benefit, i) => (
                <div
                  key={i}
                  className="bg-slate-50 rounded-2xl p-8 border border-slate-100 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                    <benefit.icon className="w-32 h-32 text-emerald-900" />
                  </div>
                  <benefit.icon className="w-10 h-10 text-emerald-600 mb-6 relative z-10" />
                  <h3 className="text-xl font-bold text-slate-800 mb-4 relative z-10">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-600 relative z-10">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Clínica & Segurança */}
        <div className="bg-slate-50">
          <ClinicalFaq />
        </div>

        {/* CTA Final */}
        <section className="py-24 bg-emerald-950 text-center px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 to-transparent opacity-50" />
          <div className="relative z-10 space-y-8 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
              Pronto para inovar o seu acompanhamento clínico?
            </h2>
            <p className="text-emerald-200/80 text-lg md:text-xl font-light">
              Assine agora e tenha acesso imediato a ferramentas exclusivas de monitoramento
              digital.
            </p>
            <div className="pt-4">
              <Button
                asChild
                size="lg"
                className="bg-white text-emerald-950 hover:bg-emerald-50 h-14 px-10 text-lg font-bold shadow-xl rounded-full"
              >
                <Link to="/planos">
                  Assinar Plano Profissional <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-slate-950 text-slate-400 text-center text-sm border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} BekAI Saúde Digital. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
