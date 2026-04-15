/**
 * AIResultPanel — Agente de Resultado
 * Exibido na página Resultado.tsx
 * Usa o AnalysisResult do Agente de Análise para gerar insights via IA
 */
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Bot,
  ShieldAlert,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateResultInsights } from '@/services/ai'
import type { AnalysisResult, ResultoInsights, RiskScore } from '@/services/ai'

const RISK_COLORS: Record<string, string> = {
  Baixo: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Moderado: 'bg-amber-100 text-amber-800 border-amber-200',
  Alto: 'bg-orange-100 text-orange-800 border-orange-200',
  Crítico: 'bg-red-100 text-red-800 border-red-200',
}

const RISK_PROGRESS_COLOR: Record<string, string> = {
  Baixo: '[&>div]:bg-emerald-500',
  Moderado: '[&>div]:bg-amber-500',
  Alto: '[&>div]:bg-orange-500',
  Crítico: '[&>div]:bg-red-500',
}

function RiskScoreCard({ score }: { score: RiskScore }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{score.dimension}</span>
        <Badge
          variant="outline"
          className={`text-xs ${RISK_COLORS[score.label] || ''}`}
        >
          {score.label}
        </Badge>
      </div>
      <Progress
        value={score.score}
        className={`h-2 bg-muted ${RISK_PROGRESS_COLOR[score.label] || ''}`}
      />
      <p className="text-xs text-muted-foreground">{score.description}</p>
    </div>
  )
}

interface Props {
  analysisResult: AnalysisResult
  childName: string
}

export function AIResultPanel({ analysisResult, childName }: Props) {
  const [insights, setInsights] = useState<ResultoInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await generateResultInsights(analysisResult, childName)
      setInsights(data)
    } catch (err: any) {
      setError(err?.message ?? 'Erro ao gerar insights do Agente de Resultado.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [analysisResult, childName])

  const overallColor = RISK_COLORS[analysisResult.overallRisk] || RISK_COLORS['Moderado']

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header do Agente */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-background shadow-md">
        <CardHeader className="pb-3 border-b border-indigo-100/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-indigo-900 text-lg">
                <Bot className="w-5 h-5 text-indigo-600" /> Agente de Resultado
              </CardTitle>
              <CardDescription className="text-indigo-700/80 mt-1">
                Perfil de Influência Digital — {childName}
              </CardDescription>
            </div>
            <Badge
              className={`px-3 py-1 text-sm font-bold border ${overallColor} bg-transparent`}
            >
              Risco {analysisResult.overallRisk}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* Score geral */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-foreground">Score de Influência Algorítmica</span>
              <span className="text-indigo-700">{analysisResult.overallScore}/100</span>
            </div>
            <Progress
              value={analysisResult.overallScore}
              className={`h-3 bg-muted ${RISK_PROGRESS_COLOR[analysisResult.overallRisk] || ''}`}
            />
          </div>

          {/* Resumo */}
          <p className="text-sm text-foreground/80 leading-relaxed bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
            {analysisResult.summary}
          </p>

          {/* Principal preocupação */}
          <div className="flex items-start gap-3 bg-amber-50/60 p-3 rounded-lg border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-0.5">Principal Preocupação</p>
              <p className="text-sm text-amber-900">{analysisResult.primaryConcern}</p>
            </div>
          </div>

          {/* Perfil algorítmico */}
          <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <Info className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-0.5">Perfil Algorítmico</p>
              <p className="text-sm text-slate-700">{analysisResult.algorithmicProfile}</p>
            </div>
          </div>

          <Separator />

          {/* Dimensões de Risco */}
          <div>
            <h4 className="text-sm font-bold text-foreground mb-4">Dimensões de Risco Analisadas</h4>
            <div className="space-y-4">
              {analysisResult.scores.map((score, i) => (
                <RiskScoreCard key={i} score={score} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights do Agente de Resultado */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" /> Insights Gerados pelo Agente
              </CardTitle>
              <CardDescription>Análise contextualizada das influências identificadas</CardDescription>
            </div>
            {!loading && (
              <Button variant="ghost" size="sm" onClick={load} className="text-muted-foreground">
                <RefreshCw className="w-4 h-4 mr-1" /> Regenerar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm animate-pulse">Agente de Resultado processando insights...</span>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertTitle>Erro no Agente de Resultado</AlertTitle>
              <AlertDescription className="text-xs mt-1">{error}</AlertDescription>
            </Alert>
          )}

          {insights && !loading && (
            <div className="space-y-5 animate-fade-in">
              {/* Insights */}
              <div className="space-y-3">
                {insights.insights.map((item, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 p-3 rounded-lg border ${
                      item.type === 'danger'
                        ? 'bg-red-50 border-red-200'
                        : item.type === 'warning'
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {item.type === 'danger' ? (
                        <ShieldAlert className="w-4 h-4 text-red-600" />
                      ) : item.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-bold mb-0.5 ${
                        item.type === 'danger' ? 'text-red-800' : item.type === 'warning' ? 'text-amber-800' : 'text-emerald-800'
                      }`}>
                        {item.title}
                      </p>
                      <p className={`text-xs leading-relaxed ${
                        item.type === 'danger' ? 'text-red-700' : item.type === 'warning' ? 'text-amber-700' : 'text-emerald-700'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Oportunidades Positivas */}
              {insights.positiveOpportunities.length > 0 && (
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wide text-emerald-700 mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Oportunidades de Rebalanceamento
                  </h5>
                  <ul className="space-y-1.5">
                    {insights.positiveOpportunities.map((op, i) => (
                      <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                        <span className="text-emerald-500 shrink-0">→</span>
                        {op}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sugestão de Curadoria */}
              <div className="bg-violet-50 border border-violet-200 rounded-lg p-3">
                <p className="text-xs font-bold text-violet-800 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Sugestão de Curadoria
                </p>
                <p className="text-xs text-violet-700 leading-relaxed">{insights.curatorSuggestion}</p>
              </div>

              {/* Nota Clínica */}
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
                <p className="text-xs font-bold text-blue-800 mb-1">Nota Clínica</p>
                <p className="text-xs text-blue-700 leading-relaxed">{insights.clinicalNote}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
