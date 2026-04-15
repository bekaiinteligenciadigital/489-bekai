import { Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'

const evoConfig = {
  aceitacao: { label: 'Aceitação Saudável', color: 'hsl(var(--primary))' },
  oee: { label: 'OEE (Eficácia)', color: '#10b981' },
  dcd: { label: 'Nível D.C.D.', color: '#6366f1' },
}

export function EvolutionChart({ data }: { data?: any[] }) {
  const defaultData = [
    { week: 'Semana 1', aceitacao: 20, oee: 15, dcd: 10 },
    { week: 'Semana 2', aceitacao: 40, oee: 35, dcd: 30 },
    { week: 'Semana 3', aceitacao: 65, oee: 55, dcd: 60 },
    { week: 'Semana 4', aceitacao: 80, oee: 75, dcd: 85 },
  ]
  const chartData = data && data.length > 0 ? data : defaultData

  return (
    <div className="min-h-[250px] w-full mt-2 pb-2 relative">
      <div className="absolute bottom-0 right-0 flex items-center gap-1 opacity-20 pointer-events-none z-10">
        <img src={logoUrl} alt="BekAI" className="w-3 h-3 grayscale rounded-sm" />
        <span className="text-[8px] font-bold">BekAI Analytics</span>
      </div>
      <ChartContainer config={evoConfig} className="w-full h-full">
        <ComposedChart data={chartData} margin={{ top: 20, right: 10, bottom: 10, left: -25 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            className="stroke-muted-foreground/20"
          />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fontWeight: 500 }}
            tickMargin={10}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            tickFormatter={(val) => `${val}%`}
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="aceitacao" fill="var(--color-aceitacao)" radius={[4, 4, 0, 0]} barSize={16}>
            <LabelList
              dataKey="aceitacao"
              position="top"
              offset={10}
              className="fill-foreground text-[10px] font-bold"
            />
          </Bar>
          <Bar dataKey="oee" fill="var(--color-oee)" radius={[4, 4, 0, 0]} barSize={16}>
            <LabelList
              dataKey="oee"
              position="top"
              offset={10}
              className="fill-foreground text-[10px] font-bold"
            />
          </Bar>
          <Line
            type="monotone"
            dataKey="dcd"
            stroke="var(--color-dcd)"
            strokeWidth={3}
            dot={{
              r: 4,
              fill: 'var(--color-dcd)',
              strokeWidth: 2,
              stroke: 'hsl(var(--background))',
            }}
            activeDot={{ r: 6 }}
          >
            <LabelList
              dataKey="dcd"
              position="bottom"
              offset={10}
              className="fill-foreground text-[10px] font-bold"
            />
          </Line>
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}
