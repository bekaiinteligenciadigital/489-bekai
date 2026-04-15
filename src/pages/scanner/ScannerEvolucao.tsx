import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, ArrowRight, Activity, ArrowLeft } from 'lucide-react'

const metrics = [
  { label: 'Engajamento Educativo', val: 75, color: 'bg-emerald-500' },
  { label: 'Literacia Midiática', val: 40, color: 'bg-blue-500' },
  { label: 'Exposição Acelerada', val: 80, color: 'bg-rose-500' },
  { label: 'Resposta Polarizada', val: 45, color: 'bg-amber-500' },
  { label: 'Consumo Analítico', val: 70, color: 'bg-indigo-500' },
]

export default function ScannerEvolucao() {
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
      <div className="space-y-4 mt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
          <Activity className="w-4 h-4" /> Monitoramento Contínuo
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight">
          EVOLUÇÃO EDUCACIONAL
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl border-l-4 border-indigo-500 pl-4 leading-relaxed">
          Sua evolução mostra o progresso no consumo crítico e adoção de hábitos saudáveis.
        </p>
        <p className="text-primary font-bold text-sm bg-primary/5 inline-block px-3 py-1.5 rounded-md border border-primary/10">
          Acompanhe semanalmente sua curva de literacia digital.
        </p>
      </div>

      <Card className="shadow-lg border-border/60 mt-8">
        <CardHeader className="pb-5 border-b bg-muted/10">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <TrendingUp className="w-7 h-7 text-primary" /> Curva de Progresso
          </CardTitle>
          <CardDescription className="text-sm">
            Acompanhamento dos indicadores de curadoria e influência pós-implementação.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          {metrics.map((m) => (
            <div key={m.label} className="space-y-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-foreground uppercase tracking-wider">{m.label}</span>
                <span className="text-muted-foreground">{m.val}%</span>
              </div>
              <div className="h-5 w-full bg-muted/30 rounded-md overflow-hidden flex border border-border/50 shadow-inner">
                <div
                  className={`h-full ${m.color} transition-all duration-1000 relative`}
                  style={{ width: `${m.val}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          className="w-full sm:w-auto px-10 h-14 text-base font-bold shadow-xl"
          onClick={() => navigate('/scanner/guia')}
        >
          Acessar Guia Parental <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
