import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Activity, AlertTriangle, Brain, Eye, HeartPulse } from 'lucide-react'

interface DossieModalProps {
  children: React.ReactNode
}

export function DossieModal({ children }: DossieModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-primary flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Laudo: Exame de Imagem do Comportamento Digital
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 font-medium">Paciente (Anonimizado)</p>
              <p className="text-lg font-bold text-slate-900">ID: #8472-A</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium">Data do Exame</p>
              <p className="text-lg font-bold text-slate-900">15/03/2026</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-500" /> DQ Score (Quociente Digital)
                </h4>
                <span className="text-2xl font-black text-indigo-600">
                  72<span className="text-sm text-slate-400">/100</span>
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[72%] rounded-full" />
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Nível de Risco
                </h4>
                <Badge variant="destructive" className="text-sm uppercase tracking-wider">
                  Alto Risco
                </Badge>
              </div>
              <p className="text-sm text-slate-600">
                Padrões identificados requerem atenção clínica secundária.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-lg text-slate-800">Padrões Comportamentais (Métricas)</h4>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Exposição (Tempo de Tela / Passividade)
                  </span>
                  <span className="font-bold text-red-600">85%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500 h-full w-[85%]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4" /> Distorção (Autoimagem / Comparação)
                  </span>
                  <span className="font-bold text-amber-600">60%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[60%]" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Instabilidade (Ansiedade Algorítmica)
                  </span>
                  <span className="font-bold text-orange-600">75%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-[75%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 text-blue-900 p-4 rounded-lg text-sm leading-relaxed border border-blue-100">
            <strong>Nota Clínica:</strong> Este exame de imagem do comportamento digital atua como
            ferramenta de rastreamento e{' '}
            <strong>não substitui o diagnóstico do profissional de saúde</strong>. Os dados
            apresentados refletem o consumo digital e devem ser interpretados em conjunto com a
            avaliação clínica presencial do paciente.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
