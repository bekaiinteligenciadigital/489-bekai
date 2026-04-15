import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Download, HeartHandshake, Stethoscope } from 'lucide-react'
import { Child } from '@/services/parent'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent } from '@/components/ui/card'
import { createReportHistory } from '@/services/report_history'

interface Props {
  child: Child | null | { id: string; name: string; birth_date: string; parent: string }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportExportModal({ child, open, onOpenChange }: Props) {
  const { toast } = useToast()
  const { user } = useAuth()

  if (!child) return null

  const handleDownload = (type: 'clinica' | 'parental' | 'mensal') => {
    if (type === 'clinica') {
      const hasAccess = user?.role === 'professional' || user?.plan?.includes('especialista')
      if (!hasAccess && user?.role !== 'professional') {
        toast({
          title: 'Acesso Restrito',
          description:
            'A Versão Clínica é exclusiva para o plano Essencial com Especialista ou perfis profissionais validados.',
          variant: 'destructive',
        })
        return
      }
    }

    const formatName =
      type === 'clinica'
        ? 'Versão Clínica'
        : type === 'mensal'
          ? 'Dossiê Mensal'
          : 'Versão Parental'

    const reportType =
      type === 'clinica'
        ? 'clinical_deep_dive'
        : type === 'mensal'
          ? 'monthly_summary'
          : 'risk_alert'

    toast({
      title: 'Gerando Relatório...',
      description: `Preparando o arquivo ${formatName} para ${child.name}.`,
    })

    const route = type === 'clinica' ? 'clinical' : type === 'mensal' ? 'monthly' : 'parental'

    const openReport = () => {
      setTimeout(() => {
        window.open(`/reports/${route}/${child.id}`, '_blank')
        onOpenChange(false)
      }, 500)
    }

    // Tenta salvar histórico apenas se houver usuário autenticado
    if (user) {
      createReportHistory({
        child: child.id,
        title: `${formatName} - ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
        type: reportType,
      })
        .then(openReport)
        .catch((err) => {
          console.warn('Histórico não salvo (sem permissão):', err)
          openReport()
        })
    } else {
      openReport()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-amber-50 border-amber-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-primary" /> Exportar Relatório
          </DialogTitle>
          <DialogDescription>
            Escolha o formato ideal do relatório de literacia digital para{' '}
            <strong>{child.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card
            className="hover:border-primary/50 transition-colors cursor-pointer border-2"
            onClick={() => handleDownload('parental')}
          >
            <CardContent className="p-4 flex gap-4 items-start">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-full shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-emerald-900">Versão Parental</h4>
                <p className="text-xs text-muted-foreground">
                  Focado em literacia, orientação e diálogo. Inclui o Mapa de Influência e os
                  Scripts Parentais sugeridos.
                </p>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-2 text-emerald-800 bg-emerald-50 hover:bg-emerald-100"
                  >
                    <Download className="w-4 h-4" /> Baixar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="hover:border-primary/50 transition-colors cursor-pointer border-2"
            onClick={() => handleDownload('mensal')}
          >
            <CardContent className="p-4 flex gap-4 items-start">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-full shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-blue-900">Dossiê Mensal (PDF)</h4>
                <p className="text-xs text-muted-foreground">
                  Relatório consolidado de evolução, radar de interesses e riscos. Formato otimizado
                  para impressão.
                </p>
                <div className="pt-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full gap-2 text-blue-800 bg-blue-50 hover:bg-blue-100"
                  >
                    <Download className="w-4 h-4" /> Gerar PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {user?.role === 'professional' && (
            <Card
              className="hover:border-primary/50 transition-colors cursor-pointer border-2"
              onClick={() => handleDownload('clinica')}
            >
              <CardContent className="p-4 flex gap-4 items-start">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-full shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-indigo-900">Versão Clínica</h4>
                  <p className="text-xs text-muted-foreground">
                    Para uso profissional. Contém dados técnicos estruturados (JSON), histórico de
                    DQ e notas do especialista.
                  </p>
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full gap-2 text-indigo-800 bg-indigo-50 hover:bg-indigo-100"
                    >
                      <Download className="w-4 h-4" /> Baixar PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
