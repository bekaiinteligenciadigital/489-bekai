import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'

const radarConfig = { risk: { label: 'Risco %', color: 'hsl(var(--destructive))' } }

export function RiskRadarChart({ data }: { data: any[] }) {
  return (
    <div className="h-[220px] w-full relative">
      <div className="absolute bottom-0 right-0 flex items-center gap-1 opacity-20 pointer-events-none z-10">
        <img src={logoUrl} alt="BekAI" className="w-3 h-3 grayscale rounded-sm" />
        <span className="text-[8px] font-bold">BekAI Analytics</span>
      </div>
      <ChartContainer config={radarConfig} className="w-full h-full">
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid className="stroke-muted-foreground/30" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 500 }}
          />
          <Radar
            dataKey="risk"
            fill="var(--color-risk)"
            fillOpacity={0.4}
            stroke="var(--color-risk)"
            strokeWidth={2}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
        </RadarChart>
      </ChartContainer>
    </div>
  )
}
