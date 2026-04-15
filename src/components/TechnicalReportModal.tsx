import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, Download, Activity, AlertTriangle, Scale, ShieldAlert } from 'lucide-react'
import { ChildProfile } from '@/stores/useFamilyStore'
import { useToast } from '@/hooks/use-toast'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'

interface Props {
  child: ChildProfile | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TechnicalReportModal({ child, open, onOpenChange }: Props) {
  const { toast } = useToast()

  if (!child) return null

  const handleDownload = () => {
    toast({
      title: 'Gerando Dossiê...',
      description: 'O sumário clínico de apoio está sendo preparado para impressão/PDF.',
    })
    setTimeout(() => {
      window.open(`/reports/clinical/${child.id}`, '_blank')
      onOpenChange(false)
    }, 800)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 pb-4 border-b">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl text-primary">
              <FileText className="w-5 h-5" /> Relatório de Influência Digital
            </DialogTitle>
            <DialogDescription>
              Pré-visualização do sumário de mapeamento para análise e apoio.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-muted/10 space-y-4">
          <Alert className="bg-amber-50 border-amber-200 text-amber-900 shadow-sm mb-2 relative overflow-hidden">
            <img
              src={logoUrl}
              alt="BekAI"
              className="absolute right-0 top-0 w-20 h-20 opacity-10 pointer-events-none grayscale"
            />
            <ShieldAlert className="w-4 h-4 text-amber-600 top-4 relative z-10" />
            <AlertTitle className="font-bold text-sm relative z-10">
              Aviso de Limitação (Suporte à Decisão Clínica)
            </AlertTitle>
            <AlertDescription className="text-xs mt-1 relative z-10">
              Esta ferramenta oferece Suporte à Decisão Clínica e possui caráter estritamente
              educativo, não substituindo a avaliação clínica final de profissionais de saúde
              (psicólogos/psiquiatras). O processamento destes dados visa a literacia midiática e
              prevenção.
            </AlertDescription>
          </Alert>

          <div className="space-y-6 border rounded-lg p-5 sm:p-8 bg-white shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
              <img src={logoUrl} alt="BekAI Watermark" className="w-64 h-64 object-contain" />
            </div>
            <div className="text-center pb-6 border-b relative z-10">
              <img src={logoUrl} alt="BekAI" className="w-12 h-12 mx-auto mb-3 rounded shadow-sm" />
              <h3 className="font-serif font-bold text-3xl text-primary tracking-widest">BekAI</h3>
              <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wider font-semibold">
                Suporte à Decisão Clínica - Curadoria
              </p>
              <div className="mt-4 inline-flex items-center gap-4 bg-muted/50 p-3 rounded-md text-sm">
                <p>
                  <strong>Perfil:</strong> {child.name}
                </p>
                <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                <p>
                  <strong>Idade:</strong> {child.age} anos
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="font-bold flex items-center gap-2 text-emerald-700 text-lg">
                <Activity className="w-5 h-5" /> Eficácia da Curadoria (OEE)
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground border-l-4 border-emerald-200 pl-4">
                Progresso de aceitação orgânica de conteúdos culturais em torno de{' '}
                <strong>65% nas últimas 3 semanas</strong>. O perfil tem engajado ativamente com a
                bolha de "Propósito e Foco", reduzindo a exposição a narrativas superficiais.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="font-bold flex items-center gap-2 text-rose-700 text-lg">
                <AlertTriangle className="w-5 h-5" /> Mapeamento de Influência
              </h4>
              <ul className="text-sm space-y-3 pl-4 border-l-4 border-rose-200 text-muted-foreground">
                <li>
                  <strong className="text-foreground">Padrões de Risco:</strong> Alta incidência de
                  exposição a gatilhos de polarização e conformismo registrados no consumo das
                  plataformas {child.platforms.join(', ')}.
                </li>
                <li>
                  <strong className="text-foreground">Padrões Positivos:</strong> Aumento sutil na
                  formação de conexões enriquecedoras através do consumo de referências em literacia
                  e resiliência.
                </li>
              </ul>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="font-bold flex items-center gap-2 text-indigo-700 text-lg">
                <Scale className="w-5 h-5" /> Evolução D.C.D. 2.0
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground border-l-4 border-indigo-200 pl-4">
                A aplicação da técnica de literacia midiática D.C.D. (Duvidar, Criticar, Determinar)
                indica uma redução de 30% em padrões de respostas impulsivas. Adoção de pensamento
                crítico fortalecida.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-background">
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button onClick={handleDownload} className="gap-2 shadow-md">
              <Download className="w-4 h-4" /> Baixar Relatório PDF
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
