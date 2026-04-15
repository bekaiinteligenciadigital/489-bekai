import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'

const data = [
  { week: 'Sem 1', dcd: 4, evolucao: 30 },
  { week: 'Sem 2', dcd: 5, evolucao: 45 },
  { week: 'Sem 3', dcd: 7, evolucao: 65 },
  { week: 'Sem 4', dcd: 6, evolucao: 70 },
  { week: 'Sem 5', dcd: 8, evolucao: 85 },
  { week: 'Sem 6', dcd: 8.4, evolucao: 92 },
]

const config = {
  dcd: { label: 'Esforço D.C.D. (0-10)', color: 'hsl(var(--secondary))' },
  evolucao: { label: 'Evolução do Jovem (%)', color: 'hsl(var(--primary))' },
}

export function CorrelationChart() {
  return (
    <div className="w-full h-[300px] relative">
      <div className="absolute bottom-0 right-0 flex items-center gap-1 opacity-20 pointer-events-none z-10">
        <img src={logoUrl} alt="BekAI" className="w-3 h-3 grayscale rounded-sm" />
        <span className="text-[8px] font-bold">BekAI Analytics</span>
      </div>
      <ChartContainer config={config} className="w-full h-full">
        <ComposedChart data={data} margin={{ top: 10, right: 0, bottom: 10, left: -20 }}>
          <defs>
            <linearGradient id="fillEvolucao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-evolucao)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-evolucao)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            className="stroke-muted-foreground/20"
          />
          <XAxis
            dataKey="week"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            yAxisId="left"
            orientation="left"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(val) => `${val}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            domain={[0, 10]}
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <ChartLegend content={<ChartLegendContent />} />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="evolucao"
            fill="url(#fillEvolucao)"
            stroke="var(--color-evolucao)"
            strokeWidth={3}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="dcd"
            stroke="var(--color-dcd)"
            strokeWidth={3}
            strokeDasharray="5 5"
            dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--background))' }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
