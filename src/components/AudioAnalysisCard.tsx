import { MentorCard } from '@/components/MentorCard'
import useFamilyStore from '@/stores/useFamilyStore'
import { AlertTriangle } from 'lucide-react'

export function AudioAnalysisCard() {
  const { pendingAnalysis, childrenProfiles } = useFamilyStore()

  if (!pendingAnalysis?.audioTranscript) return null

  const childName =
    childrenProfiles.find((c) => c.id === pendingAnalysis.childId)?.name || 'seu filho(a)'

  return (
    <MentorCard
      title="Diagnóstico de Áudio Analisado"
      className="border-rose-200 from-rose-50/80 mb-6"
    >
      <div className="space-y-4">
        <p className="text-sm text-rose-950/80 leading-relaxed">
          Com base na transcrição do áudio de <strong>{childName}</strong>, o Motor de Risco
          identificou padrões que exigem atenção na forma de Contraposições Construtivas.
        </p>

        <div className="bg-white/80 p-4 rounded-xl border border-rose-100 shadow-sm relative">
          <div className="absolute top-4 right-4 text-rose-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-rose-900 text-sm mb-2">Contexto Extraído da Fala:</h4>
          <p className="text-sm italic text-rose-800/80 border-l-2 border-rose-300 pl-3">
            "{pendingAnalysis.audioTranscript}"
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-white/60 p-4 rounded-lg border border-rose-200/50">
            <h5 className="font-bold text-rose-900 text-xs uppercase tracking-wider mb-2">
              Risco Moral
            </h5>
            <p className="text-xs text-rose-800 mb-3">
              Transferência de lealdade e valores para grupos online desconhecidos.
            </p>
            <div className="bg-rose-50 p-2 rounded text-[11px] text-rose-900 font-medium border border-rose-100">
              <strong>Contraposição:</strong> Reforçar a identidade familiar através de histórias de
              superação dos pais.
            </div>
          </div>

          <div className="bg-white/60 p-4 rounded-lg border border-amber-200/50">
            <h5 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-2">
              Risco Comportamental
            </h5>
            <p className="text-xs text-amber-800 mb-3">
              Isolamento voluntário e substituição da realidade por interações virtuais.
            </p>
            <div className="bg-amber-50 p-2 rounded text-[11px] text-amber-900 font-medium border border-amber-100">
              <strong>Contraposição:</strong> Criar um compromisso inegociável offline com a família
              ou grupo seguro.
            </div>
          </div>

          <div className="bg-white/60 p-4 rounded-lg border border-indigo-200/50">
            <h5 className="font-bold text-indigo-900 text-xs uppercase tracking-wider mb-2">
              Risco Emocional
            </h5>
            <p className="text-xs text-indigo-800 mb-3">
              Apatia pela vida real e sentimento crônico de incompreensão.
            </p>
            <div className="bg-indigo-50 p-2 rounded text-[11px] text-indigo-900 font-medium border border-indigo-100">
              <strong>Contraposição:</strong> Praticar escuta ativa sem julgamentos; validar a dor
              antes da correção.
            </div>
          </div>
        </div>
      </div>
    </MentorCard>
  )
}
