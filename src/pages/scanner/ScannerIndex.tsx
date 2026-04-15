import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Skull, CloudOff, ArrowRightLeft, Activity, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

const cards = [
  { id: 'ram', title: 'Hiperestimulação', icon: Brain },
  { id: 'killer', title: 'Padrões Nocivos', icon: Skull },
  { id: 'apatia', title: 'Consumo Passivo', icon: CloudOff },
  { id: 'comparacao', title: 'Comparação', icon: ArrowRightLeft },
]

export default function ScannerIndex() {
  const [selected, setSelected] = useState<string[]>([])
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-fade-in">
      <div className="pt-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Dashboard
        </Button>
      </div>
      <div className="text-center space-y-4 mt-2 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
          <Activity className="w-4 h-4" /> Mapeador de Influência Digital
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary tracking-tight">
          MAPEADOR DE INFLUÊNCIA
        </h1>
        <h2 className="text-xl md:text-2xl text-secondary font-medium">
          Mapeamos como o algoritmo molda hábitos e cultura
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto pt-2">
          Entenda como o ambiente digital está influenciando padrões de resposta e literacia
          midiática.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 pt-4">
        {cards.map((c) => {
          const isSelected = selected.includes(c.id)
          return (
            <Card
              key={c.id}
              className={cn(
                'cursor-pointer transition-all duration-300 border-2 hover:shadow-lg',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                  : 'border-border/60 hover:border-primary/40',
              )}
              onClick={() =>
                setSelected((prev) =>
                  prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id],
                )
              }
            >
              <CardContent className="p-6 md:p-8 flex items-center gap-5">
                <div
                  className={cn(
                    'p-4 rounded-2xl transition-colors',
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-inner'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  <c.icon className="w-8 h-8" />
                </div>
                <h3
                  className={cn(
                    'font-bold text-xl',
                    isSelected ? 'text-primary' : 'text-foreground',
                  )}
                >
                  {c.title}
                </h3>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center pt-10">
        <Button
          size="lg"
          className="w-full sm:w-auto px-12 h-14 text-lg font-bold shadow-xl hover:scale-105 transition-transform"
          onClick={() => navigate('/scanner/resultado')}
        >
          Iniciar Mapeamento <Activity className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
