import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import pb from '@/lib/pocketbase/client'
import { TrendingUp, Users, Link2, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await pb.send('/backend/v1/admin/growth-metrics', { method: 'GET' })
        setData(res)
      } catch (err) {
        console.error('Failed to load admin metrics', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 animate-pulse flex flex-col gap-6">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
        <div className="h-96 bg-muted rounded"></div>
      </div>
    )
  }

  const chartConfig = {
    professionals: {
      label: 'Profissionais',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 px-4 md:px-0">
      <div>
        <h2 className="text-3xl font-serif font-bold text-primary">Monitoramento de Conversão</h2>
        <p className="text-muted-foreground mt-1">
          Visão administrativa do crescimento da rede de profissionais e investidores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Total de Profissionais
              <Users className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data?.totalProfessionals || 0}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
              <TrendingUp className="w-3 h-3 mr-1" /> Crescimento sustentável
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              Conectados a Famílias
              <Link2 className="w-4 h-4 text-secondary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">
              {data?.linkedToParentsCount || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Profissionais ativos via referrals</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary flex items-center justify-between">
              Leads de Investidores
              <Activity className="w-4 h-4 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {data?.investorLeads?.length || 0}
            </div>
            <p className="text-xs text-primary/80 mt-1">Interessados na tese de investimento</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Professional Growth via Referrals</CardTitle>
          <CardDescription>
            Crescimento orgânico da base de profissionais cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full mt-4">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart
                data={data?.chartData || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="professionals"
                  fill="var(--color-professionals)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Últimos Leads (Investidores)</CardTitle>
          <CardDescription>Pessoas e fundos interessados em investir na plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {data?.investorLeads?.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.investorLeads.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{new Date(lead.created).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                        Novo
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Nenhum lead de investidor registrado ainda.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
