import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, CheckCircle } from 'lucide-react'
import { Child, acceptConsent } from '@/services/parent'
import { useToast } from '@/hooks/use-toast'

interface Props {
  child: Child
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ConsentModal({ child, open, onOpenChange, onSuccess }: Props) {
  const [accepted, setAccepted] = useState(false)
  const [signature, setSignature] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!accepted || !signature.trim()) return
    setLoading(true)
    try {
      await acceptConsent(child.id, signature)
      toast({
        title: 'Consentimento Registrado',
        description: `O monitoramento para ${child.name} foi autorizado com sucesso.`,
      })
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Erro ao registrar',
        description: 'Não foi possível salvar o consentimento. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-5 h-5 text-primary" /> Termo de Autorização
          </DialogTitle>
          <DialogDescription>
            Leia atentamente as condições de monitoramento digital para o perfil de{' '}
            <strong>{child.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="h-48 overflow-y-auto text-sm text-slate-600 bg-slate-50 p-4 rounded-md border border-slate-200 shadow-inner">
            <p className="font-semibold text-slate-800 mb-2">
              TERMO DE AUTORIZAÇÃO DE MONITORAMENTO DIGITAL E TRATAMENTO DE DADOS
            </p>
            <p className="mb-2">
              Pelo presente instrumento, declaro ser o responsável legal pelo menor cadastrado e
              autorizo formalmente a coleta, processamento e análise de dados provenientes de suas
              interações em plataformas digitais e redes sociais, por meio da plataforma BekAI.
            </p>
            <p className="mb-2">
              Compreendo que a BekAI atuará estritamente de acordo com a Lei Geral de Proteção de
              Dados (LGPD - Lei nº 13.709/2018), garantindo o sigilo, a segurança e a anonimização
              dos dados sensíveis, utilizando-os exclusivamente para fins de monitoramento de saúde
              mental, literacia digital e emissão de relatórios de risco expositivo.
            </p>
            <p className="mb-2">
              Estou ciente de que o monitoramento não tem caráter punitivo ou investigativo
              invasivo, mas sim preventivo e de orientação familiar e clínica. Os dados não serão
              comercializados ou compartilhados com terceiros sem consentimento explícito.
            </p>
            <p>
              Posso revogar este consentimento a qualquer momento nas configurações da conta,
              resultando na suspensão imediata da coleta de novos dados.
            </p>
          </div>

          <div className="flex items-start space-x-3 bg-primary/5 p-4 rounded-lg border border-primary/20">
            <Checkbox
              id="modal-consent"
              checked={accepted}
              onCheckedChange={(c) => setAccepted(c as boolean)}
              className="mt-1"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="modal-consent"
                className="text-sm font-semibold leading-relaxed cursor-pointer text-primary"
              >
                Li, compreendo e aceito os termos de autorização para o monitoramento digital.
              </Label>
            </div>
          </div>

          {accepted && (
            <div className="space-y-3 animate-fade-in bg-slate-50 p-4 rounded-lg border border-slate-200">
              <Label htmlFor="modal-signature" className="font-semibold text-slate-700">
                Assinatura Digital
              </Label>
              <p className="text-xs text-slate-500 mb-2">
                Digite seu nome completo como responsável legal para assinar este termo
                digitalmente.
              </p>
              <Input
                id="modal-signature"
                placeholder="Ex: João da Silva Santos"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="bg-white"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!accepted || !signature.trim() || loading}
            className="gap-2"
          >
            <CheckCircle className="w-4 h-4" /> Assinar Digitalmente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
