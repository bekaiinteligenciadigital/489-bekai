import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ArrowUpIcon, ArrowDownIcon, Info, TrendingUp, ShieldCheck } from 'lucide-react'
import { CorrelationChart } from './CorrelationChart'

export function EvolutionMetricsTab() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-sm border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Aceitação Saudável (%)
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1.5 rounded-full hover:bg-muted cursor-pointer transition-colors">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs leading-relaxed p-3 shadow-xl">
                  <strong className="block mb-1 text-foreground">Aceitação Saudável</strong>
                  Mede o engajamento do jovem com o conteúdo positivo sugerido pelo Agente Autônomo
                  e a substituição orgânica de gatilhos nocivos por hábitos digitais construtivos.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">65%</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <ArrowUpIcon className="h-3.5 w-3.5 mr-1" />
                +12% evolução
              </span>
              <span className="text-xs text-muted-foreground font-medium">vs semana passada</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Eficácia da Estratégia (OEE)
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1.5 rounded-full hover:bg-muted cursor-pointer transition-colors">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs leading-relaxed p-3 shadow-xl">
                  <strong className="block mb-1 text-foreground">Eficácia (OEE)</strong>
                  Cruza a redução quantitativa de riscos digitais (tempo de tela nocivo) com o tempo
                  de qualidade efetivamente gasto em atividades educativas e de propósito (bolha
                  saudável).
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">78%</div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-emerald-700 font-bold flex items-center bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                <ArrowUpIcon className="h-3.5 w-3.5 mr-1" />
                +5% eficácia
              </span>
              <span className="text-xs text-muted-foreground font-medium">vs semana passada</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-secondary hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground">
              Nível D.C.D.
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-1.5 rounded-full hover:bg-muted cursor-pointer transition-colors">
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px] text-xs leading-relaxed p-3 shadow-xl">
                  <strong className="block mb-1 text-foreground">
                    Diálogo, Conexão, Direcionamento
                  </strong>
                  Pontuação de 0 a 10 baseada na frequência e na qualidade das interações sugeridas
                  pelo sistema que foram efetivamente aplicadas pelos pais com o jovem.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground flex items-baseline">
              8.4 <span className="text-lg text-muted-foreground font-medium ml-1">/10</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-rose-700 font-bold flex items-center bg-rose-50 px-2 py-1 rounded-full border border-rose-100">
                <ArrowDownIcon className="h-3.5 w-3.5 mr-1" />
                -0.2 queda
              </span>
              <span className="text-xs text-muted-foreground font-medium">vs semana passada</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="pb-4 bg-muted/20 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-primary" /> Correlação Evolutiva
              </CardTitle>
              <CardDescription className="text-sm mt-1 max-w-2xl">
                Observe visualmente como a dedicação parental através das técnicas de D.C.D.
                impulsiona a evolução da mentalidade e do rebalanceamento digital do jovem.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-2">
          <CorrelationChart />
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-dashed border-2 border-primary/20 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
            <ShieldCheck className="w-5 h-5" /> Compreendendo a Metodologia e Fundamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-muted-foreground leading-relaxed">
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">1. OEE Adaptado à Saúde Mental</h4>
              <p>
                A <strong>Eficácia da Estratégia (OEE)</strong> adapta princípios de engenharia para
                o cuidado psicológico. Medimos não o uso da tela, mas a "disponibilidade emocional"
                do jovem, verificando se o tempo de exposição está sendo preenchido com narrativas
                que geram qualidade de pensamento e aceitação de virtudes.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-foreground">2. O Esforço D.C.D. em Ação</h4>
              <p>
                O pilar <strong>Diálogo, Conexão e Direcionamento</strong> é a sua métrica de
                participação ativa. O sistema mapeia o quão frequentemente você utiliza os roteiros
                práticos recomendados. O gráfico acima comprova de forma contínua que o
                rebalanceamento orgânico depende intrinsecamente da presença intencional dos
                responsáveis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
