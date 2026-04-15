import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Book,
  AlertTriangle,
  MessageSquare,
  FileText,
  CheckCircle,
  ShieldCheck,
  Activity,
  ArrowLeft,
} from 'lucide-react'

const resources = [
  {
    title: 'Como o algoritmo influencia a cultura',
    icon: Book,
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    title: 'Sinais de exposição nociva',
    icon: AlertTriangle,
    color: 'text-rose-600',
    bg: 'bg-rose-100',
  },
  {
    title: 'Diálogos de literacia midiática',
    icon: MessageSquare,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  { title: 'Scripts de comunicação', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
  {
    title: 'Protocolos de curadoria e rotina',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
]

export default function ScannerGuia() {
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
          <Activity className="w-4 h-4" /> Apoio Educacional
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight">
          GUIA PARENTAL DE INTELIGÊNCIA DIGITAL
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl font-medium border-l-4 border-primary pl-4 leading-relaxed">
          A mediação parental precisa ser constante, baseada em diálogo e compreensão cultural.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5 pt-4">
        {resources.map((r, i) => (
          <Card
            key={i}
            className="hover:shadow-lg transition-all cursor-pointer border-border/60 hover:-translate-y-1"
          >
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`p-4 rounded-xl ${r.bg} ${r.color} shadow-sm`}>
                <r.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-foreground text-base leading-tight">{r.title}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary/5 p-8 rounded-2xl border-2 border-primary/20 mt-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div>
          <h3 className="font-bold text-2xl flex items-center gap-2 text-primary mb-2">
            <ShieldCheck className="w-7 h-7" /> Conhecimento Técnico Completo
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
            Acesse o Framework de Inteligência Digital contendo as bases educacionais, literacia
            midiática e protocolos de curadoria em detalhes.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate('/framework-inteligencia')}
          className="w-full md:w-auto h-14 px-8 font-bold shadow-md shrink-0 bg-primary hover:bg-primary/90"
        >
          Ler Framework Educacional
        </Button>
      </div>
    </div>
  )
}
