import { MentorCard } from '@/components/MentorCard'
import {
  Ear,
  Lightbulb,
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  UserX,
  UserCheck,
  MessageSquareWarning,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PlanoMentorTab() {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-none shadow-md overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-4">
          <TrendingUp className="w-32 h-32" />
        </div>
        <CardContent className="p-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-serif flex items-center gap-2">
              Análise de Perfil: Vítima vs. Autor
            </h3>
            <p className="text-primary-foreground/80 text-sm max-w-md leading-relaxed">
              O objetivo final não é apenas ter um feed limpo, mas transformar seu filho de Vítima
              (consumidor passivo) do algoritmo para Autor consciente da própria história digital.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 bg-background/20 p-5 rounded-xl backdrop-blur-sm shrink-0 w-full md:w-auto">
            <div className="flex items-center justify-between w-full min-w-[200px] mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                Fase Atual
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Transição (45%)
              </span>
            </div>
            <div className="flex items-center gap-3 w-full">
              <div className="text-center">
                <UserX className="w-5 h-5 mx-auto mb-1 opacity-50" />
                <span className="text-xs font-bold opacity-70">Vítima</span>
              </div>
              <div className="flex-1 flex gap-1 items-center justify-center">
                <div className="h-1.5 flex-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                <div className="h-1.5 flex-1 rounded-full bg-emerald-400"></div>
                <div className="h-1.5 flex-1 rounded-full bg-primary-foreground/30"></div>
                <div className="h-1.5 flex-1 rounded-full bg-primary-foreground/30"></div>
              </div>
              <div className="text-center">
                <UserCheck className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Autor</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MentorCard
        title="Treinamento Interativo: Módulo D.C.D. 2.0"
        className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-background"
      >
        <div className="space-y-4">
          <p className="text-sm text-emerald-950/80 leading-relaxed">
            Ensine seu filho a hackear a própria mente. A técnica{' '}
            <strong>Duvidar, Criticar, Determinar</strong> é a principal arma para gerenciar
            pensamentos intrusivos e quebrar o Cárcere do Conformismo. Pratique estes passos juntos:
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="bg-white/70 p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors flex flex-col">
              <div className="absolute -top-1 -right-2 text-emerald-100 group-hover:text-emerald-200 transition-colors">
                <HelpCircle className="w-16 h-16" />
              </div>
              <h5 className="font-black text-emerald-900 text-lg mb-2 relative z-10 flex items-center gap-2">
                1. Duvidar
              </h5>
              <p className="text-xs text-emerald-800/90 leading-relaxed relative z-10 flex-1">
                Duvide da perfeição aparente, da ansiedade e da comparação gerada pela rede. Quebre
                a crença absoluta na tela.
              </p>
              <div className="mt-4 bg-emerald-50 p-2.5 rounded text-xs font-medium text-emerald-900 border border-emerald-100 italic relative z-10">
                "Será que a vida deles é perfeita mesmo ou isso é só a melhor edição do dia?"
              </div>
            </div>

            <div className="bg-white/70 p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors flex flex-col">
              <div className="absolute -top-1 -right-2 text-emerald-100 group-hover:text-emerald-200 transition-colors">
                <ShieldAlert className="w-16 h-16" />
              </div>
              <h5 className="font-black text-emerald-900 text-lg mb-2 relative z-10 flex items-center gap-2">
                2. Criticar
              </h5>
              <p className="text-xs text-emerald-800/90 leading-relaxed relative z-10 flex-1">
                Critique ativamente as narrativas nocivas, o marketing de fúria e o pensamento
                intrusivo. Seja o advogado de defesa da sua mente.
              </p>
              <div className="mt-4 bg-emerald-50 p-2.5 rounded text-xs font-medium text-emerald-900 border border-emerald-100 italic relative z-10">
                "Não aceito que um algoritmo defina meu valor ou como eu me sinto hoje."
              </div>
            </div>

            <div className="bg-white/70 p-5 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors flex flex-col">
              <div className="absolute -top-1 -right-2 text-emerald-100 group-hover:text-emerald-200 transition-colors">
                <ShieldCheck className="w-16 h-16" />
              </div>
              <h5 className="font-black text-emerald-900 text-lg mb-2 relative z-10 flex items-center gap-2">
                3. Determinar
              </h5>
              <p className="text-xs text-emerald-800/90 leading-relaxed relative z-10 flex-1">
                Determine novos caminhos emocionais e ações reais. Substitua o consumo pela
                construção no mundo offline.
              </p>
              <div className="mt-4 bg-emerald-50 p-2.5 rounded text-xs font-medium text-emerald-900 border border-emerald-100 italic relative z-10">
                "Determino que vou construir minha vida no mundo real, como protagonista."
              </div>
            </div>
          </div>
        </div>
      </MentorCard>

      <Card className="border-rose-200 bg-gradient-to-br from-rose-50/50 to-background shadow-sm">
        <CardHeader className="pb-3 border-b border-rose-100">
          <CardTitle className="text-lg text-rose-900 flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-rose-600" /> Guia Estratégico: O Silêncio
            Proativo
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          <p className="text-sm text-rose-950/80 leading-relaxed">
            Durante o rebalanceamento, é comum que a "abstinência digital" gere explosões emocionais
            (Fúria). Nestes momentos, a reação parental agressiva alimenta as{' '}
            <strong>Janelas Killer</strong>. Use o Silêncio Proativo.
          </p>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white/80 p-5 rounded-xl border border-rose-100 shadow-sm">
              <h4 className="font-bold text-rose-900 mb-3 border-b border-rose-100 pb-2">
                Passo a Passo na Crise
              </h4>
              <ul className="text-sm text-rose-900 space-y-3 list-none p-0">
                <li className="flex gap-3 items-start">
                  <span className="font-black text-rose-600 bg-rose-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span className="leading-tight pt-0.5">
                    <strong>Pausa Tática:</strong> Conte 30 segundos em silêncio antes de responder
                    a qualquer provocação.
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-black text-rose-600 bg-rose-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span className="leading-tight pt-0.5">
                    <strong>Postura de Paz:</strong> Olhe nos olhos com compaixão, solte os braços
                    ao lado do corpo (não cruze).
                  </span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="font-black text-rose-600 bg-rose-100 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span className="leading-tight pt-0.5">
                    <strong>Frase Âncora (Script):</strong> "Vejo que você está sofrendo e agitado.
                    Eu te amo demais para brigar agora. Quando quiser, conversamos."
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-white/80 p-5 rounded-xl border border-rose-100 shadow-sm flex flex-col">
              <h4 className="font-bold text-rose-900 mb-3 border-b border-rose-100 pb-2">
                Prevenção (Higiene Mental)
              </h4>
              <p className="text-sm text-rose-800/90 mb-4 leading-relaxed flex-1">
                A <strong>Síndrome do Pensamento Acelerado (SPA)</strong> esgota o cérebro durante o
                dia, deixando o jovem sem energia para lidar com frustrações à noite.
              </p>
              <div className="bg-rose-50/80 p-4 rounded-lg border border-rose-200">
                <strong className="text-xs uppercase text-rose-900 block mb-1">
                  Ação Recomendada: Pacto do Sono
                </strong>
                <p className="text-xs text-rose-800">
                  Institua que os celulares de <em>toda a família</em> carreguem na sala 1 hora
                  antes de dormir. O cérebro precisa desacelerar para limpar a memória.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
