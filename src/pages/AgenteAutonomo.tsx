import { Link } from 'react-router-dom'
import { AutonomousAgentTab } from '@/components/AutonomousAgentTab'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bot, BookOpen, FileText, Settings } from 'lucide-react'

export default function AgenteAutonomo() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-gradient-to-r from-primary/5 via-background to-secondary/10 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Bot className="w-4 h-4" /> Modulo Operacional
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Agente Autonomo
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Acompanhe o rebalanceamento algoritmico, veja a logica das intervencoes e conecte o
              plano de acao com biblioteca, framework e mapeamento.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link to="/analise">
                <FileText className="w-4 h-4" /> Novo Mapeamento
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/plano">
                <Bot className="w-4 h-4" /> Plano de Acao
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondary" /> Biblioteca
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Consulte referencias e conteudos de substituicao para apoiar a reeducacao digital.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/biblioteca">Abrir Biblioteca</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-secondary" /> Framework
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Revise os fundamentos pedagogicos que orientam as decisoes do agente.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/framework-inteligencia">Abrir Framework</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="w-4 h-4 text-secondary" /> Configuracoes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ajuste alertas, perfis monitorados e acompanhe o progresso dos modulos.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/config">Abrir Configuracoes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <AutonomousAgentTab />
    </div>
  )
}
