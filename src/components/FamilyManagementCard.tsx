import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Link as LinkIcon, FileText, CheckCircle2, Loader2, Stethoscope } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ChildProfile } from '@/stores/useFamilyStore'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'

interface FamilyManagementCardProps {
  childrenProfiles: ChildProfile[]
  onOpenReport: (child: ChildProfile) => void
}

export function FamilyManagementCard({
  childrenProfiles,
  onOpenReport,
}: FamilyManagementCardProps) {
  const { toast } = useToast()
  const [linkingChildId, setLinkingChildId] = useState<string | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [isLinking, setIsLinking] = useState(false)

  const handleLinkProfessional = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteCode || !linkingChildId) return

    setIsLinking(true)
    try {
      const res = await pb.send('/backend/v1/professional/link', {
        method: 'POST',
        body: JSON.stringify({
          childId: linkingChildId,
          inviteCode: inviteCode.trim().toUpperCase(),
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      toast({
        title: 'Profissional Vinculado!',
        description: `O perfil foi vinculado com sucesso ao profissional ${res.professionalName}.`,
      })
      setLinkingChildId(null)
      setInviteCode('')
    } catch (err: any) {
      toast({
        title: 'Erro ao vincular',
        description: err.response?.message || 'Verifique o código e tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3 border-b border-muted">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Gestão Familiar
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" asChild>
            <Link to="/config">Editar</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {childrenProfiles.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum perfil cadastrado.
          </p>
        ) : (
          childrenProfiles.map((c) => (
            <div
              key={c.id}
              className="p-3 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/40 transition-colors space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0 uppercase text-lg">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">
                    {c.name}{' '}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({c.age} anos)
                    </span>
                  </p>
                  <div className="flex gap-1 mt-1.5 overflow-x-auto hide-scrollbar">
                    {c.platforms.map((p) => (
                      <Badge
                        key={p}
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 font-medium"
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40">
                <Dialog
                  open={linkingChildId === c.id}
                  onOpenChange={(open) => !open && setLinkingChildId(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs h-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setLinkingChildId(c.id)}
                    >
                      <Stethoscope className="w-3 h-3 mr-1" /> Vincular Especialista
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleLinkProfessional}>
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Stethoscope className="w-5 h-5 text-primary" /> Vincular Profissional
                        </DialogTitle>
                        <DialogDescription>
                          Insira o código de 6 caracteres fornecido pelo seu profissional de saúde
                          para compartilhar os relatórios de <strong>{c.name}</strong> de forma
                          segura.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-6">
                        <div className="grid gap-2">
                          <Label htmlFor="code">Código de Convite</Label>
                          <Input
                            id="code"
                            placeholder="Ex: A1B2C3"
                            className="font-mono uppercase text-center tracking-widest text-lg h-12"
                            maxLength={8}
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setLinkingChildId(null)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={isLinking || inviteCode.length < 5}>
                          {isLinking ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <LinkIcon className="w-4 h-4 mr-2" />
                          )}
                          Confirmar Vínculo
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs h-8 text-primary hover:bg-primary/5 border-primary/20"
                  onClick={() => onOpenReport(c)}
                >
                  <FileText className="w-3 h-3 mr-1" /> Relatório PDF
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
