import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Activity } from 'lucide-react'
import { useMemo } from 'react'

const radarConfig = {
  score: { label: 'Intensidade', color: 'hsl(var(--primary))' },
}

export function BehavioralStratification({ events }: { events: any[] }) {
  const chartData = useMemo(() => {
    if (!events || events.length === 0) return []

    let totalAnxiety = 0
    let totalViolence = 0
    let totalSexualization = 0
    let totalNihilism = 0
    let totalSelfHarm = 0
    let count = 0

    events.forEach((evt) => {
      if (evt.risk_scores) {
        totalAnxiety += evt.risk_scores.anxiety || 0
        totalViolence += evt.risk_scores.violence || 0
        totalSexualization += evt.risk_scores.sexualization || 0
        totalNihilism += evt.risk_scores.nihilism || 0
        totalSelfHarm += evt.risk_scores.self_harm || 0
        count++
      }
    })

    if (count === 0) return []

    return [
      { category: 'Ansiedade', score: Math.round(totalAnxiety / count) },
      { category: 'Violência', score: Math.round(totalViolence / count) },
      { category: 'Sexualização', score: Math.round(totalSexualization / count) },
      { category: 'Niilismo', score: Math.round(totalNihilism / count) },
      { category: 'Autolesão', score: Math.round(totalSelfHarm / count) },
    ]
  }, [events])

  if (chartData.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Perfil de Consumo (Estratificação)
          </CardTitle>
          <CardDescription>Aguardando dados de sincronização...</CardDescription>
        </CardHeader>
        <CardContent className="h-[280px] flex items-center justify-center text-muted-foreground border-t border-dashed m-4 rounded-xl bg-muted/20">
          Nenhum evento com score de risco processado.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" /> Perfil de Consumo (Estratificação)
        </CardTitle>
        <CardDescription>
          Mapeamento dos temas e narrativas detectados nos eventos digitais recentes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ChartContainer config={radarConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid className="stroke-muted-foreground/30" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
                />
                <Radar
                  dataKey="score"
                  fill="var(--color-score)"
                  fillOpacity={0.4}
                  stroke="var(--color-score)"
                  strokeWidth={2}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
