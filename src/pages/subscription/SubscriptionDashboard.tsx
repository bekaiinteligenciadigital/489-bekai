import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Calendar, ArrowUpCircle, CheckCircle2, History } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useNavigate } from 'react-router-dom'

export default function SubscriptionDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const planNames: Record<string, string> = {
    essencial_familia: 'Plano Essencial Família',
    essencial_profissional: 'Plano Essencial Profissional',
  }

  const planName = planNames[user?.active_plan] || 'Plano Essencial Família'
  const isPro = user?.active_plan === 'essencial_profissional'

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary tracking-tight">
          Gerenciar Assinatura
        </h1>
        <p className="text-muted-foreground mt-1">
          Visualize os detalhes do seu plano e histórico de pagamentos.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 shadow-sm border-emerald-100">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Plano Atual
                </CardTitle>
                <CardDescription className="mt-1 text-emerald-700/80">
                  Sua assinatura está ativa e regular.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
                {user?.subscription_status === 'past_due' ? 'Pagamento Pendente' : 'Ativo'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plano Selecionado</p>
                  <p className="text-lg font-bold text-foreground">{planName}</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" /> Próxima renovação em breve
                </div>
              </div>
              <div className="space-y-4 md:text-right">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor Mensal</p>
                  <p className="text-3xl font-black text-primary">
                    {isPro ? 'R$ 50,00' : 'R$ 35,00'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5" /> Upgrade de Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-primary/80 leading-relaxed">
              {isPro
                ? 'Você já possui o plano mais completo da plataforma. Aproveite todos os recursos clínicos!'
                : 'Mude para o Plano Profissional e tenha acesso a múltiplos perfis e dashboards clínicos detalhados.'}
            </p>
            {!isPro && (
              <Button onClick={() => navigate('/planos')} className="w-full shadow-sm">
                Fazer Upgrade
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" /> Histórico de Faturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Fatura Recente</TableCell>
                <TableCell>{planName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CreditCard className="w-4 h-4" /> **** 1234
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                    Pago
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {isPro ? 'R$ 50,00' : 'R$ 35,00'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
