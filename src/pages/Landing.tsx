import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DossieModal } from '@/components/landing/DossieModal'
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
} from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
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
        <div className="flex items-center gap-4">
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
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
          <div className="max-w-5xl mx-auto space-y-8 relative z-10 animate-fade-in-up">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-semibold border-secondary/20 mb-4 gap-2 shadow-sm"
            >
              <Sparkles className="w-4 h-4" /> Plataforma de Governança Digital
            </Badge>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-primary leading-[1.1] tracking-tight">
              BekAI: Inteligência Digital a Serviço da <br className="hidden sm:block" />
              <span className="text-secondary drop-shadow-sm">Saúde Mental</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Muito além do bloqueio de telas. Somos um ecossistema que atua como mentor invisível,
              reeducando algoritmos, neutralizando gatilhos de ansiedade e promovendo o
              desenvolvimento cognitivo saudável para a nova geração.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 px-8 text-lg shadow-xl hover:scale-105 transition-transform"
              >
                <Link to="/planos">
                  Começar Agora <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg hover:bg-secondary/10 border-primary/20 text-primary bg-white"
              >
                <Link to="/clinical-demo">
                  BekAI Clinical <Stethoscope className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg shadow-md bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Link to="/investidores">Área do Investidor</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Metaphors & Value Proposition Section */}
        <section className="py-24 px-4 bg-white border-y border-border/50">
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

        {/* Application Scenarios */}
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

        {/* CTA Sales Section */}
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
            <div className="pt-6">
              <Button
                asChild
                size="lg"
                className="h-16 px-12 text-xl shadow-2xl hover:scale-105 transition-transform bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold rounded-full"
              >
                <Link to="/planos">
                  Garantir Proteção Agora <ArrowRight className="w-6 h-6 ml-3" />
                </Link>
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
