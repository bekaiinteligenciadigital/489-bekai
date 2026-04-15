import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Link, QrCode } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Child } from '@/services/parent'

interface ProfessionalReferralModalProps {
  child: Child | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfessionalReferralModal({
  child,
  open,
  onOpenChange,
}: ProfessionalReferralModalProps) {
  const { toast } = useToast()
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [accessCode, setAccessCode] = useState('')

  useEffect(() => {
    if (open && child) {
      setInviteCode('')
      const fetchAccessCode = async () => {
        try {
          const record = await pb.collection('children').getOne(child.id)
          setAccessCode(record.access_code || '')
        } catch (e) {
          console.error(e)
        }
      }
      fetchAccessCode()
    }
  }, [open, child])

  const handleLinkProfessional = async () => {
    if (!child || !inviteCode.trim()) return

    setLoading(true)
    try {
      await pb.send('/backend/v1/professional/link', {
        method: 'POST',
        body: JSON.stringify({ childId: child.id, inviteCode: inviteCode.trim() }),
      })

      toast({ title: 'Profissional vinculado com sucesso!' })
      onOpenChange(false)
      window.location.reload()
    } catch (err: any) {
      toast({
        title: 'Erro ao vincular',
        description: err?.response?.message || 'Código inválido ou profissional não encontrado.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const generateAccessCode = async () => {
    if (!child) return
    setLoading(true)
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      await pb.collection('children').update(child.id, { access_code: code })
      setAccessCode(code)
      toast({ title: 'Código de acesso gerado!' })
    } catch (err) {
      toast({ title: 'Erro ao gerar código', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Conexão com Profissional</DialogTitle>
          <DialogDescription>
            Vincule o perfil de {child?.name} ao seu médico ou terapeuta.
          </DialogDescription>
        </DialogHeader>

        {(child as any)?.expand?.assigned_professional ? (
          <div className="bg-primary/5 p-4 rounded-lg mt-4 text-center border border-primary/20">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Link className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-bold text-primary mb-1">Profissional Vinculado</h4>
            <p className="text-sm text-muted-foreground font-medium">
              {(child as any).expand.assigned_professional.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Este perfil já está compartilhando dados clínicos com o profissional acima.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="enter-code" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="enter-code" className="text-xs">
                <Link className="w-4 h-4 mr-2" /> Inserir Código
              </TabsTrigger>
              <TabsTrigger value="generate-code" className="text-xs">
                <QrCode className="w-4 h-4 mr-2" /> Gerar Acesso
              </TabsTrigger>
            </TabsList>

            <TabsContent value="enter-code" className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Se o seu profissional já utiliza o BekAI, peça o código de convite dele e insira
                  abaixo:
                </p>
                <Input
                  placeholder="Ex: PROF123"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  className="font-mono text-center text-lg uppercase"
                />
              </div>
              <Button
                onClick={handleLinkProfessional}
                disabled={loading || !inviteCode.trim()}
                className="w-full"
              >
                {loading ? 'Vinculando...' : 'Vincular Profissional'}
              </Button>
            </TabsContent>

            <TabsContent value="generate-code" className="space-y-4 mt-4">
              <div className="space-y-2 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Gere um código de acesso único e forneça ao seu profissional de saúde para que ele
                  vincule no painel dele.
                </p>

                {accessCode ? (
                  <div className="bg-muted p-4 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">
                      Código de Acesso de {child?.name}
                    </div>
                    <div className="font-mono text-2xl font-bold tracking-widest text-primary">
                      {accessCode}
                    </div>
                  </div>
                ) : (
                  <div className="bg-muted/50 p-4 rounded-md text-sm text-muted-foreground italic">
                    Nenhum código ativo no momento.
                  </div>
                )}
              </div>

              <Button
                onClick={generateAccessCode}
                disabled={loading}
                variant={accessCode ? 'outline' : 'default'}
                className="w-full"
              >
                {accessCode ? 'Gerar Novo Código' : 'Gerar Código de Acesso'}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
