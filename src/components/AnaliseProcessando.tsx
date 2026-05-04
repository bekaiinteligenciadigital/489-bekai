import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BrainCircuit, CheckCircle2, AlertCircle } from 'lucide-react'
import { generateRiskAnalysis } from '@/services/ai'
import useFamilyStore from '@/stores/useFamilyStore'
import pb from '@/lib/pocketbase/client'

const ANALYSIS_DRAFT_STORAGE_KEY = 'bekai:nova-analise:draft'

function toPocketBaseRiskLevel(label: string) {
  const normalized = String(label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

  if (normalized === 'baixo') return 'Low'
  if (normalized === 'moderado') return 'Medium'
  if (normalized === 'alto') return 'High'
  return 'Critical'
}

const STAGES = [
  'Mapeando plataformas e padrões comportamentais...',
  'Calculando influência algorítmica...',
  'Analisando dimensões de risco...',
  'Gerando perfil de influência digital...',
  'Finalizando relatório...',
]

export function AnaliseProcessando() {
  const navigate = useNavigate()
  const { pendingAnalysis, childrenProfiles, setAIResults, setPendingAnalysis } = useFamilyStore()
  const [progress, setProgress] = useState(0)
  const [stageIndex, setStageIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) {
            clearInterval(interval)
            return 90
          }
          return p + Math.random() * 8
        })
        setStageIndex((i) => Math.min(i + 1, STAGES.length - 1))
      }, 1200)

      try {
        const child = childrenProfiles.find((c) => c.id === pendingAnalysis?.childId)
        const childName = child?.name ?? 'jovem'
        const childAge = child?.age

        if (!pendingAnalysis) throw new Error('Nenhuma análise pendente encontrada.')

        const result = await generateRiskAnalysis({
          childName,
          childAge,
          platforms: pendingAnalysis.platforms,
          behaviors: pendingAnalysis.behaviors,
          audioTranscript: pendingAnalysis.audioTranscript,
        })

        if (cancelled) return

        setAIResults({ analysisResult: result, analyzedChildId: pendingAnalysis.childId })

        // Persist analysis record to PocketBase
        try {
          await pb.collection('analysis_records').create({
            child: pendingAnalysis.childId,
            dq_score: result.overallScore,
            risk_level: toPocketBaseRiskLevel(result.overallRisk),
            insights_summary: result.summary,
            behavior_patterns: {
              platforms: pendingAnalysis.platforms,
              behaviors: pendingAnalysis.behaviors,
              scores: result.scores,
              primaryConcern: result.primaryConcern,
              algorithmicProfile: result.algorithmicProfile,
            },
          })
        } catch (persistErr) {
          console.warn('Could not persist analysis record:', persistErr)
        }

        clearInterval(interval)
        setProgress(100)
        setDone(true)
        setPendingAnalysis(null)
        try {
          window.localStorage.removeItem(ANALYSIS_DRAFT_STORAGE_KEY)
        } catch (storageErr) {
          console.warn('Could not clear analysis draft:', storageErr)
        }

        setTimeout(
          () =>
            navigate('/resultado', {
              state: {
                platforms: pendingAnalysis.platforms,
                childId: pendingAnalysis.childId,
              },
            }),
          1000,
        )
      } catch (err: any) {
        if (cancelled) return
        clearInterval(interval)
        setError(err?.message ?? 'Erro desconhecido ao processar análise.')
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <Card className="animate-fade-in-up border-destructive/30 shadow-xl">
        <CardContent className="py-16 flex flex-col items-center text-center space-y-6">
          <div className="p-4 rounded-full bg-destructive/10">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-destructive">Erro no Agente de Análise</h3>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
            {error.includes('GROQ_API_KEY') && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-xs text-amber-900">
                <strong>Como configurar no servidor:</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>
                    Acesse{' '}
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      console.groq.com/keys
                    </a>{' '}
                    e crie uma API Key
                  </li>
                  <li>Cadastre a chave como segredo no PocketBase com o nome <code>GROQ_API_KEY</code></li>
                  <li>Reinicie o backend do PocketBase para carregar o novo segredo</li>
                </ol>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-primary underline hover:no-underline"
          >
            ← Voltar e tentar novamente
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in-up border-primary/30 shadow-xl bg-gradient-to-b from-background to-primary/5">
      <CardContent className="py-20 flex flex-col items-center text-center space-y-8">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-[6px] border-white shadow-xl bg-slate-900 ring-1 ring-black/5">
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 opacity-50 mix-blend-luminosity">
            <img
              src="https://img.usecurling.com/p/200/200?q=tiktok&color=blue"
              alt=""
              className="w-full h-full object-cover"
            />
            <img
              src="https://img.usecurling.com/p/200/200?q=youtube&color=blue"
              alt=""
              className="w-full h-full object-cover"
            />
            <img
              src="https://img.usecurling.com/p/200/200?q=gamer&color=blue"
              alt=""
              className="w-full h-full object-cover"
            />
            <img
              src="https://img.usecurling.com/p/200/200?q=meme&color=blue"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          {!done && (
            <div className="absolute left-0 right-0 h-1.5 bg-emerald-400 shadow-[0_0_20px_5px_rgba(52,211,153,0.8)] animate-scan z-10" />
          )}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-indigo-600/90 p-4 rounded-full backdrop-blur-sm shadow-2xl">
              {done ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : (
                <BrainCircuit className="w-10 h-10 text-white animate-pulse" />
              )}
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <Progress value={progress} className="h-2 [&>div]:bg-indigo-500" />
          <p className="text-xs text-muted-foreground animate-pulse">
            {done ? '✓ Análise concluída! Redirecionando...' : STAGES[stageIndex]}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-serif font-bold text-primary animate-pulse">
            {done ? 'Perfil Gerado com Sucesso' : 'Agente de Análise em Ação...'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            {done
              ? 'O perfil de influência digital foi gerado. Preparando o relatório completo.'
              : 'O Agente está processando os padrões comportamentais e calculando o perfil de influência algorítmica com base em evidências clínicas.'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
