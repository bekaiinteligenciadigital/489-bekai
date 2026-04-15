import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Activity, ArrowRight, ShieldAlert, ShieldCheck, ArrowLeft } from 'lucide-react'

export default function ScannerResultado() {
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
          <Activity className="w-4 h-4" /> Resultados de Influência
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight">
          PERFIL DE CONSUMO HOJE
        </h1>
        <h2 className="text-xl md:text-2xl text-secondary font-medium">
          Padrões detectados na rotina digital
        </h2>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl border-l-4 border-primary pl-4">
          A resposta comportamental é resultado direto da curadoria que o algoritmo oferece.
        </p>
      </div>

      <Alert className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm animate-fade-in-down mb-6">
        <ShieldCheck className="w-5 h-5 text-amber-600 top-4" />
        <AlertTitle className="font-bold text-sm">Aviso Educacional</AlertTitle>
        <AlertDescription className="text-xs mt-1">
          Esta ferramenta possui caráter estritamente educativo e informativo, não substituindo o
          diagnóstico ou acompanhamento de profissionais de saúde (psicólogos/psiquiatras).
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 pt-2">
        <Alert className="bg-rose-50 border-rose-200 text-rose-900 shadow-sm py-5">
          <ShieldAlert className="w-6 h-6 text-rose-600 top-5" />
          <AlertTitle className="font-bold text-lg flex items-center gap-2 mb-2">
            Alerta Analítico de Retenção
          </AlertTitle>
          <AlertDescription className="mt-1 space-y-1 text-sm leading-relaxed font-medium">
            <p>Detectamos sinais de exposição a padrões nocivos.</p>
            <p>O consumo está sendo moldado por informações rasas e aceleradas.</p>
          </AlertDescription>
        </Alert>

        <Card className="shadow-lg border-border/60">
          <CardHeader className="pb-5 border-b bg-muted/10">
            <CardTitle className="text-xl">Métricas de Influência Digital</CardTitle>
            <CardDescription className="text-sm">
              Avaliação baseada nos padrões de conteúdo consumidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Engajamento Educativo</span>
                <span>60%</span>
              </div>
              <Progress value={60} className="h-3 [&>div]:bg-emerald-500 bg-emerald-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Indicador de Exposição ao Conteúdo Acelerado</span>
                <span>90%</span>
              </div>
              <Progress value={90} className="h-3 [&>div]:bg-rose-500 bg-rose-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Padrões de Resposta Digital Polarizada</span>
                <span>50%</span>
              </div>
              <Progress value={50} className="h-3 [&>div]:bg-amber-500 bg-amber-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Consumo Passivo</span>
                <span>100%</span>
              </div>
              <Progress value={100} className="h-3 [&>div]:bg-indigo-600 bg-indigo-100" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-bold">
                <span>Exposição a Comparação Social</span>
                <span>90%</span>
              </div>
              <Progress value={90} className="h-3 [&>div]:bg-rose-500 bg-rose-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          className="w-full sm:w-auto px-10 h-14 text-base font-bold shadow-xl"
          onClick={() => navigate('/scanner/plano')}
        >
          Ver Guia de Curadoria <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
