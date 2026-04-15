import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Activity, Bot, Zap } from 'lucide-react'

const roadmapSteps = [
  {
    id: 'w1',
    title: 'Semanas 1-2: Inserção Silenciosa',
    icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
    status: 'Concluído',
    tasks: [
      {
        type: 'Ação do Agente',
        desc: 'Emite 3-5 sinais/dia em conteúdo positivo da Biblioteca. Nenhuma remoção de itens nocivos para evitar suspeita ou ruptura.',
      },
      {
        type: 'Ação Parental',
        desc: 'Aplicar a Técnica do Silêncio Proativo caso haja explosão emocional. Não questionar tempo de tela ainda.',
      },
    ],
  },
  {
    id: 'w3',
    title: 'Semanas 3-4: Amplificação (Fase Atual)',
    icon: <Activity className="w-5 h-5 text-emerald-500" />,
    status: 'Em Andamento',
    tasks: [
      {
        type: 'Ação do Agente',
        desc: 'Aumenta para 8-12 sinais/dia. Começa a marcar "Não tenho interesse" em 1-2 itens focais de fúria/polarização por dia.',
      },
      {
        type: 'Ação Parental',
        desc: 'Introduzir a "Mesa Redonda do Eu". Falar sobre os próprios medos no jantar para gerar identificação.',
      },
    ],
  },
  {
    id: 'w5',
    title: 'Semanas 5-8: Reconfiguração',
    icon: <Bot className="w-5 h-5 text-amber-500" />,
    status: 'Pendente',
    tasks: [
      {
        type: 'Ação do Agente',
        desc: '15-20 sinais/dia. Segue ativamente 2-3 novos criadores de "Equivalência Positiva" por semana.',
      },
      {
        type: 'Ação Parental',
        desc: 'Instituir o "Pacto do Sono": Celular dorme fora do quarto 1 hora antes de deitar.',
      },
    ],
  },
  {
    id: 'w9',
    title: 'Semanas 9-12: Consolidação Moral',
    icon: <Zap className="w-5 h-5 text-indigo-500" />,
    status: 'Pendente',
    tasks: [
      {
        type: 'Ação do Agente',
        desc: 'Manutenção do feed. Meta: 85%+ de conteúdo construtivo no For You Page.',
      },
      {
        type: 'Ação Parental',
        desc: 'Ensinar ativamente a técnica D.C.D. 2.0 (Duvidar, Criticar, Determinar) para que o jovem seja Autor da própria vida.',
      },
    ],
  },
]

export function PlanoRoadmapTab({ steps = roadmapSteps }: { steps?: any[] }) {
  const displaySteps = steps && steps.length > 0 ? steps : roadmapSteps
  return (
    <Card className="shadow-sm border-primary/10">
      <CardHeader className="pb-4">
        <CardTitle>Linha do Tempo de Rebalanceamento (30-90 Dias)</CardTitle>
        <CardDescription>
          Progresso estruturado da substituição algorítmica e intervenção parental.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['w3', 'w1']} className="w-full">
          {displaySteps.map((step: any) => (
            <AccordionItem
              value={step.id}
              key={step.id}
              className="border-b-0 mb-4 bg-muted/20 rounded-lg px-4"
            >
              <AccordionTrigger className="font-semibold py-4 hover:no-underline text-left">
                <div className="flex items-center gap-3 w-full pr-4">
                  {step.icon}
                  <span className="text-primary flex-1">{step.title}</span>
                  <Badge
                    variant={
                      step.status === 'Concluído'
                        ? 'secondary'
                        : step.status === 'Em Andamento'
                          ? 'default'
                          : 'outline'
                    }
                    className="ml-auto shrink-0 hidden sm:flex"
                  >
                    {step.status}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pb-4">
                {step.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className={`bg-background p-4 rounded-xl border shadow-sm flex flex-col gap-1 ${task.type.includes('Agente') ? 'border-emerald-200 bg-emerald-50/30' : ''}`}
                  >
                    <h5
                      className={`font-bold text-sm flex items-center gap-2 ${task.type.includes('Agente') ? 'text-emerald-700' : 'text-indigo-700'}`}
                    >
                      {task.type}
                    </h5>
                    <p className="text-sm text-muted-foreground leading-relaxed">{task.desc}</p>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
