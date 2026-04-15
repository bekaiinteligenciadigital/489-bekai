import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Target, Users, BookOpen, Bot, Sparkles, Activity, ArrowLeft } from 'lucide-react'

export default function ScannerPlano() {
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
          <Activity className="w-4 h-4" /> Orientação Educativa
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary tracking-tight">
          GUIA DE CURADORIA E ROTINA
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl border-l-4 border-emerald-500 pl-4">
          Nada de bloquear — vamos reeducar o algoritmo com literacia midiática.
        </p>
      </div>

      <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm py-5 mt-4">
        <Sparkles className="w-6 h-6 text-emerald-600 top-5" />
        <AlertTitle className="font-bold text-lg flex items-center gap-2 mb-2">
          Estratégia Positiva
        </AlertTitle>
        <AlertDescription className="mt-1 space-y-1 text-sm leading-relaxed font-medium">
          <p>Conteúdos equivalentes positivos promovem referências culturais construtivas.</p>
          <p>O consumo digital está sendo enriquecido com propósito.</p>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 pt-2">
        <Card className="shadow-md border-l-4 border-l-emerald-500 border-y-border border-r-border hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 bg-muted/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Target className="w-6 h-6" />
              </div>
              Sugestão de Curadoria: Propósito & Foco
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-3 flex gap-2">
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md">
                Esportes
              </span>
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-md">
                Rotina
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Substituição de conteúdo superficial por referências focadas em disciplina, cultura e
              atividades enriquecedoras.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-indigo-500 border-y-border border-r-border hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 bg-muted/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              Sugestão de Curadoria: Valor Relacional
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-3 flex gap-2">
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md">
                Cidadania
              </span>
              <span className="text-xs font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md">
                Podcasts
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Injeção de narrativas que valorizam a convivência social real e promovem conversas
              construtivas e conexões autênticas.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-amber-500 border-y-border border-r-border hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 bg-muted/10">
            <CardTitle className="text-xl flex items-center gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              Sugestão de Curadoria: Literacia e Profundidade
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-3 flex gap-2">
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                Documentários
              </span>
              <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                Leituras
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Expansão do tempo de tela qualificado, aumentando a capacidade analítica e reduzindo o
              consumo passivo.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          size="lg"
          className="w-full sm:w-auto px-10 h-14 text-base font-bold shadow-xl bg-primary hover:bg-primary/90 hover:scale-105 transition-transform"
          onClick={() => navigate('/scanner/evolucao')}
        >
          <Bot className="w-6 h-6 mr-2" /> Ativar Agente Autônomo
        </Button>
      </div>
    </div>
  )
}
