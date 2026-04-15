import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Brain, Shield, Users, Activity, ChevronRight } from 'lucide-react'

export default function ProfessionalDemo() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Portal do Especialista (Demo)
            </h1>
            <p className="text-slate-500 mt-2">
              Visão geral dos seus pacientes e ferramentas clínicas.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/">Voltar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro-profissional">Assinar Agora</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pacientes Ativos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">24</div>
              <p className="text-xs text-slate-500">+4 esta semana</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                Análises Pendentes
              </CardTitle>
              <Activity className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">7</div>
              <p className="text-xs text-slate-500">2 com risco crítico</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Média DQ Score</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">76/100</div>
              <p className="text-xs text-slate-500">+2.5% vs mês anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Novos Insights</CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">12</div>
              <p className="text-xs text-slate-500">Gerados por IA</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pacientes Recentes</CardTitle>
            <CardDescription>
              Acompanhe a evolução do consumo digital e riscos dos pacientes acompanhados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  id: 1,
                  name: 'Lucas M.',
                  days: 2,
                  status: 'Crítico',
                  color: 'text-red-600 bg-red-50',
                },
                {
                  id: 2,
                  name: 'Sofia T.',
                  days: 5,
                  status: 'Estável',
                  color: 'text-green-600 bg-green-50',
                },
                {
                  id: 3,
                  name: 'Miguel A.',
                  days: 8,
                  status: 'Atenção',
                  color: 'text-orange-600 bg-orange-50',
                },
              ].map((paciente) => (
                <div
                  key={paciente.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-medium text-slate-600">
                      {paciente.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{paciente.name}</h4>
                      <p className="text-sm text-slate-500">
                        Última análise há {paciente.days} dias
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${paciente.color}`}
                    >
                      {paciente.status}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-2 shrink-0" asChild>
                      <Link to={`/reports/clinical/${paciente.id}`}>
                        Ver Relatório <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
