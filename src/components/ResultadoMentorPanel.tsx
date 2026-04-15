import { MentorCard } from '@/components/MentorCard'
import { Button } from '@/components/ui/button'
import { Database, AlertTriangle, Shield, BookOpen, ArrowRight, Sun } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ResultadoMentorPanel({ platforms }: { platforms: string[] }) {
  return (
    <MentorCard title="Mapeamento Psicológico de Captura">
      <div className="space-y-6">
        <p className="text-sm text-indigo-950/80 leading-relaxed border-b border-indigo-100 pb-4">
          Aplicando os fundamentos da <strong>Teoria da Inteligência Multifocal</strong>, este é o
          mapeamento de como o algoritmo dessas plataformas está formatando a memória e a emoção do
          jovem.
        </p>

        <div className="space-y-5">
          <div className="flex gap-4 items-start">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700 shrink-0 mt-0.5 shadow-inner">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-indigo-950 text-sm">
                Registro Automático da Memória (RAM)
              </h4>
              <p className="text-sm text-indigo-900/70 mt-1 leading-relaxed">
                O consumo contínuo nas plataformas ({platforms.join(', ') || 'diversas'}) está sendo
                gravado de forma involuntária. O volume maciço e veloz de informações burla o filtro
                crítico do "Eu", gravando apatia e ansiedade no núcleo da memória emocional.
              </p>
            </div>
          </div>

          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg shadow-sm">
            <h4 className="font-bold text-rose-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Mapeamento de Indicadores de Janelas e Cárceres
              Mentais
            </h4>
            <div className="space-y-4 mt-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/70 p-4 rounded-lg border border-rose-200 shadow-sm">
                  <strong className="text-rose-900 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Janelas Killer (Trauma)
                  </strong>
                  <p className="text-xs text-rose-800/90 leading-relaxed">
                    Alta formação ativa detectada. Elas fecham o circuito da memória, bloqueando a
                    razão e fomentando Fúria e Isolamento.
                  </p>
                </div>
                <div className="bg-white/70 p-4 rounded-lg border border-emerald-200 shadow-sm">
                  <strong className="text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                    <Sun className="w-3.5 h-3.5" /> Janelas de Luz (Saudáveis)
                  </strong>
                  <p className="text-xs text-emerald-800/90 leading-relaxed">
                    Baixa incidência atual. O Agente precisará construir novas Janelas de Luz
                    através de equivalência estética.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-amber-50/80 p-4 rounded-lg border border-amber-200 shadow-sm">
                  <strong className="text-amber-900 text-xs uppercase tracking-wider block mb-1.5">
                    Cárcere do Medo
                  </strong>
                  <p className="text-xs text-amber-800/90 leading-relaxed">
                    Sintomas de ansiedade por comparação indicam aprisionamento na opinião alheia e
                    padrões irreais.
                  </p>
                </div>
                <div className="bg-slate-100/80 p-4 rounded-lg border border-slate-200 shadow-sm">
                  <strong className="text-slate-900 text-xs uppercase tracking-wider block mb-1.5">
                    Cárcere do Conformismo
                  </strong>
                  <p className="text-xs text-slate-800/90 leading-relaxed">
                    Vaping de atenção gera apatia profunda. O jovem aceita passivamente o lixo
                    digital sem questionar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 items-start pt-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700 shrink-0 mt-0.5 shadow-inner">
              <Shield className="w-4 h-4" />
            </div>
            <div className="w-full">
              <h4 className="font-bold text-indigo-950 text-sm">Substituição Intencional</h4>
              <p className="text-sm text-indigo-900/70 mt-1 leading-relaxed">
                Não recomendamos o bloqueio abrupto, que gera rebeldia. O próximo passo é ativar o{' '}
                <strong>Agente Autônomo</strong> para reeducar o algoritmo com conteúdo de
                Equivalência Positiva.
              </p>
              <div className="mt-4 p-4 bg-white/70 rounded-lg border border-indigo-200 shadow-sm">
                <p className="text-sm text-indigo-950 font-bold mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" /> Preparação Parental:
                </p>
                <ul className="text-xs text-indigo-900/80 space-y-1.5 list-disc pl-4 mb-3">
                  <li>
                    <strong>O Código da Inteligência</strong> - Para entender os códigos da
                    excelência emocional.
                  </li>
                  <li>
                    <strong>Ansiedade</strong> - Para compreender a Síndrome do Pensamento Acelerado
                    (SPA).
                  </li>
                </ul>
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none h-8 mt-1"
                >
                  <Link to="/plano?tab=science">
                    Ver Evidências Científicas <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MentorCard>
  )
}
