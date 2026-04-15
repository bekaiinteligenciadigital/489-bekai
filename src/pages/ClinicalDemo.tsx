import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Brain,
  Shield,
  Stethoscope,
  Activity,
  ArrowRight,
  Microscope,
  LineChart,
} from 'lucide-react'
import { ClinicalFaq } from '@/components/landing/ClinicalFaq'

export default function ClinicalDemo() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-100 selection:text-blue-900 font-sans">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-slate-900">
              BekAI <span className="text-blue-600 font-medium">Clinical</span>
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            <a
              href="#crise"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              A Crise Invisível
            </a>
            <a
              href="#mentor"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              O Mentor Invisível
            </a>
            <a
              href="#pratica"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Potencialização da Prática
            </a>
            <a
              href="#faq"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              FAQ Segurança
            </a>
          </nav>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Link to="/planos">Assinar Agora</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-20 pb-28">
          <div className="absolute inset-0 bg-[url('https://img.usecurling.com/p/1920/1080?q=medical%20abstract&color=blue')] bg-cover bg-center opacity-5" />
          <div className="container relative mx-auto px-4 md:px-8 text-center max-w-4xl">
            <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 mb-8 shadow-sm">
              <Stethoscope className="mr-2 h-4 w-4" /> Exclusivo para Profissionais de Saúde
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-slate-900 tracking-tight mb-6">
              O Exame de Imagem do <span className="text-blue-600">Comportamento Digital</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed mb-10">
              BekAI atua como um sistema avançado de suporte à decisão clínica, fornecendo dados
              estruturados e métricas validadas sobre a rotina online de seus pacientes
              infantojuvenis.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 text-lg shadow-md"
            >
              <Link to="/planos">
                Começar Agora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* A Crise Invisível */}
        <section id="crise" className="py-20 bg-slate-50 border-t border-slate-100">
          <div className="container mx-auto px-4 md:px-8 max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">
                  A Crise Invisível
                </h2>
                <p className="text-slate-600 leading-relaxed mb-6">
                  A superexposição digital atua diretamente nas vias dopaminérgicas do cérebro em
                  desenvolvimento. O consumo passivo e contínuo de conteúdos hiperestimulantes
                  promove alterações neuroplásticas, frequentemente mascaradas como déficits de
                  atenção ou transtornos de ansiedade na prática clínica.
                </p>
                <ul className="space-y-6">
                  <li className="flex items-start">
                    <Activity className="h-6 w-6 text-blue-600 shrink-0" />
                    <div className="ml-4">
                      <h4 className="font-semibold text-slate-900">Desregulação Dopaminérgica</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Picos de recompensa de curto prazo afetam o córtex pré-frontal, reduzindo o
                        controle inibitório e a regulação emocional.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Brain className="h-6 w-6 text-blue-600 shrink-0" />
                    <div className="ml-4">
                      <h4 className="font-semibold text-slate-900">
                        Padrões Comportamentais Ocultos
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Sintomas depressivos ou de isolamento social muitas vezes iniciam-se através
                        de interações invisíveis aos pais e terapeutas.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">
                <img
                  src="https://img.usecurling.com/p/800/600?q=brain%20synapses&color=blue"
                  alt="Neurobiologia do Comportamento"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* O Mentor Invisível */}
        <section id="mentor" className="py-20 bg-blue-900 text-white">
          <div className="container mx-auto px-4 md:px-8 max-w-5xl text-center mb-12">
            <h2 className="text-3xl font-serif font-bold mb-4">O Mentor Invisível</h2>
            <p className="text-lg text-blue-200 max-w-3xl mx-auto">
              Como uma extensão dos seus olhos na rotina do paciente. O BekAI traduz o consumo de
              mídia e engajamento digital em laudos comportamentais precisos, embasados na
              Biblioteca de Diretrizes Clínicas (BDIC).
            </p>
          </div>
          <div className="container mx-auto px-4 md:px-8 max-w-5xl grid md:grid-cols-3 gap-6">
            <div className="bg-blue-800/50 border border-blue-700/50 p-6 rounded-xl hover:bg-blue-800 transition-colors">
              <Microscope className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Rastreio Passivo Contínuo</h3>
              <p className="text-sm text-blue-200">
                Coleta de dados de engajamento e tipologia de conteúdo sem interferir na rotina do
                paciente, gerando uma baseline fidedigna.
              </p>
            </div>
            <div className="bg-blue-800/50 border border-blue-700/50 p-6 rounded-xl hover:bg-blue-800 transition-colors">
              <LineChart className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Métricas de Atenção Ativa</h3>
              <p className="text-sm text-blue-200">
                Diferenciação rigorosa entre tempo de tela ativo (construtivo) e passivo
                (potencialmente nocivo), avaliando a qualidade do foco.
              </p>
            </div>
            <div className="bg-blue-800/50 border border-blue-700/50 p-6 rounded-xl hover:bg-blue-800 transition-colors">
              <Shield className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Alertas Precoces de Risco</h3>
              <p className="text-sm text-blue-200">
                Detecção proativa de marcadores de risco para transtornos de ansiedade, distorção de
                autoimagem ou ideação autolesiva.
              </p>
            </div>
          </div>
        </section>

        {/* Potencialização da Prática */}
        <section id="pratica" className="py-20 bg-white border-b border-slate-100">
          <div className="container mx-auto px-4 md:px-8 max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">
                Potencialização da Prática Clínica
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Recursos arquitetados para otimizar seu tempo, reduzir vieses de relato e aumentar a
                assertividade no suporte à decisão clínica através de dados longitudinais
                objetivos.{' '}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Dossiês Automatizados</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Geração de relatórios clínicos mensais detalhando a evolução do paciente,
                      estruturados para integração direta a prontuários eletrônicos.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <LineChart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Acompanhamento Longitudinal
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Gráficos de tendência visual cruzando intervenções terapêuticas vigentes com
                      flutuações quantificáveis do comportamento digital.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="p-3 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Precisão Superior no Suporte à Decisão
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Reduza vieses de autorrelato familiar com dados absolutos sobre hábitos de
                      sono, uso noturno de dispositivos e exposição a gatilhos.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 flex flex-col justify-center text-center shadow-sm">
                <h3 className="text-xl font-serif font-bold text-slate-900 mb-3">
                  Integre o BekAI ao seu Workflow
                </h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  Você não precisa se tornar um especialista em algoritmos ou mídias sociais. Nossa
                  IA processa o ruído digital bruto e entrega exclusivamente inteligência clínica
                  acionável.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md"
                >
                  <Link to="/planos">Ver Planos Profissionais</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Clínica & Segurança */}
        <div id="faq">
          <ClinicalFaq />
        </div>

        {/* High-Conversion CTA */}
        <section className="py-24 bg-blue-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-700/30 pattern-grid-lg opacity-20"></div>
          <div className="container mx-auto px-4 md:px-8 text-center max-w-2xl relative z-10">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
              Pronto para elevar o nível analítico da sua prática clínica?
            </h2>
            <p className="text-lg text-blue-100 mb-10">
              Junte-se à vanguarda de profissionais de saúde que já utilizam o exame de imagem do
              comportamento digital para direcionar tratamentos de alta precisão.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-blue-50 px-12 h-14 text-lg rounded-full shadow-xl"
            >
              <Link to="/planos">Assinar Agora</Link>
            </Button>
            <p className="mt-6 text-sm text-blue-200">
              Plataforma restrita a profissionais habilitados.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
