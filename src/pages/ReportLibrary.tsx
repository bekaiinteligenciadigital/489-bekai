import { useEffect, useState } from 'react'
import { getReportHistory, ReportFilter } from '@/services/report_history'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { FileText, Download, CalendarIcon, Layers, Search, FilterX } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

export default function ReportLibrary() {
  const [reports, setReports] = useState<any[]>([])
  const [children, setChildren] = useState<any[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  const [childFilter, setChildFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [date, setDate] = useState<DateRange | undefined>()

  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isGeneratingEvolution, setIsGeneratingEvolution] = useState(false)

  const loadReports = async (overrideFilters?: ReportFilter) => {
    try {
      const filters = overrideFilters || {
        childId: childFilter !== 'all' ? childFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        startDate: date?.from,
        endDate: date?.to,
      }
      const data = await getReportHistory(filters)
      setReports(data)
    } catch (e) {
      console.error(e)
    }
  }

  const loadChildren = async () => {
    try {
      const data = await pb.collection('children').getFullList()
      setChildren(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (user) {
      loadChildren()
      loadReports()
    }
  }, [user])

  useRealtime(
    'report_history',
    () => {
      loadReports()
    },
    !!user,
  )

  const handleSearch = () => {
    loadReports()
    setSelectedReports([])
  }

  const handleClearFilters = () => {
    setChildFilter('all')
    setTypeFilter('all')
    setDate(undefined)
    loadReports({})
    setSelectedReports([])
  }

  const toggleSelectAll = () => {
    if (selectedReports.length === reports.length && reports.length > 0) {
      setSelectedReports([])
    } else {
      setSelectedReports(reports.map((r) => r.id))
    }
  }

  const toggleReport = (id: string) => {
    setSelectedReports((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id],
    )
  }

  const handleEvolutionReport = () => {
    if (selectedReports.length < 2) {
      toast({
        title: 'Seleção Insuficiente',
        description: 'Selecione pelo menos dois relatórios para gerar um Relatório de Evolução.',
        variant: 'destructive',
      })
      return
    }

    const selected = reports.filter((r) => selectedReports.includes(r.id))
    const childIds = new Set(selected.map((r) => r.child))
    if (childIds.size > 1) {
      toast({
        title: 'Múltiplos Filhos Selecionados',
        description: 'O Relatório de Evolução deve ser gerado para um único filho por vez.',
        variant: 'destructive',
      })
      return
    }

    selected.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
    const oldest = selected[0]
    const newest = selected[selected.length - 1]

    setIsGeneratingEvolution(true)
    toast({
      title: 'Gerando Relatório de Evolução',
      description: `Compilando dados de ${new Date(oldest.created).toLocaleDateString(
        'pt-BR',
      )} a ${new Date(newest.created).toLocaleDateString('pt-BR')}...`,
    })

    setTimeout(() => {
      setIsGeneratingEvolution(false)
      window.open(
        `/reports/monthly/${oldest.child}?evolution=true&from=${oldest.id}&to=${newest.id}`,
        '_blank',
      )
      setSelectedReports([])
      toast({
        title: 'Sucesso',
        description: 'Relatório de Evolução gerado com sucesso.',
      })
    }, 2500)
  }

  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case 'monthly_summary':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Mensal
          </Badge>
        )
      case 'risk_alert':
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
          >
            Parental
          </Badge>
        )
      case 'clinical_deep_dive':
        return (
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
            Clínica
          </Badge>
        )
      default:
        return <Badge variant="outline">Geral</Badge>
    }
  }

  const handleDownload = (report: any) => {
    if (report.report_file) {
      const url = pb.files.getUrl(report, report.report_file)
      window.open(url, '_blank')
    } else {
      let route = 'parental'
      if (report.type === 'monthly_summary') route = 'monthly'
      if (report.type === 'clinical_deep_dive') route = 'clinical'
      window.open(`/reports/${route}/${report.child}`, '_blank')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-primary">Biblioteca de Relatórios</h2>
          <p className="text-muted-foreground mt-1">
            Histórico completo de dossiês e análises gerados para seus filhos.
          </p>
        </div>
        {selectedReports.length > 0 && (
          <Button
            onClick={handleEvolutionReport}
            disabled={isGeneratingEvolution}
            className="bg-primary text-primary-foreground shadow-sm"
          >
            <Layers className="w-4 h-4 mr-2" />
            Gerar Evolução ({selectedReports.length})
          </Button>
        )}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-lg">Filtros de Pesquisa</CardTitle>
          <CardDescription>
            Refine a listagem para encontrar relatórios específicos.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Filho(a)</label>
            <Select value={childFilter} onValueChange={setChildFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os filhos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de Relatório</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="monthly_summary">Mensal</SelectItem>
                <SelectItem value="risk_alert">Parental</SelectItem>
                <SelectItem value="clinical_deep_dive">Clínica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Período</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {date.from.toLocaleDateString('pt-BR')} -{' '}
                        {date.to.toLocaleDateString('pt-BR')}
                      </>
                    ) : (
                      date.from.toLocaleDateString('pt-BR')
                    )
                  ) : (
                    <span>Selecione as datas</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end gap-2">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="w-4 h-4 mr-2" /> Buscar
            </Button>
            <Button
              onClick={handleClearFilters}
              variant="outline"
              size="icon"
              title="Limpar Filtros"
            >
              <FilterX className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {reports.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Nenhum relatório encontrado</h3>
              <p className="text-sm text-muted-foreground max-w-md mt-2">
                Ajuste os filtros ou gere novos relatórios no dashboard de monitoramento.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={reports.length > 0 && selectedReports.length === reports.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Filho(a)</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow
                    key={report.id}
                    data-state={selectedReports.includes(report.id) ? 'selected' : undefined}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={() => toggleReport(report.id)}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(report.created)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.expand?.child?.name || 'Desconhecido'}
                    </TableCell>
                    <TableCell>{getReportTypeBadge(report.type)}</TableCell>
                    <TableCell>{report.title}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(report)}
                        className="text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Download className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Baixar PDF</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
