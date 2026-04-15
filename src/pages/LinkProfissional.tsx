import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function LinkProfissional() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [children, setChildren] = useState<any[]>([])
  const [selectedChild, setSelectedChild] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const records = await pb.collection('children').getFullList({
          filter: `parent = "${user?.id}"`,
        })
        setChildren(records)
        if (records.length > 0) setSelectedChild(records[0].id)
      } catch (err) {
        console.error(err)
      } finally {
        setFetching(false)
      }
    }
    if (user) fetchChildren()
  }, [user])

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedChild || !inviteCode.trim()) return

    try {
      setLoading(true)
      const res = await pb.send('/backend/v1/link-professional', {
        method: 'POST',
        body: JSON.stringify({
          child_id: selectedChild,
          invite_code: inviteCode.trim().toUpperCase(),
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      toast({
        title: 'Profissional Vinculado!',
        description: `O perfil foi vinculado ao(à) profissional ${res.professional_name || ''} com sucesso.`,
      })
      navigate('/dashboard')
    } catch (err: any) {
      toast({
        title: 'Falha na vinculação',
        description: err.response?.message || 'Código inválido ou não encontrado.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-8 space-y-6 animate-fade-in-up mt-10">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-2 -ml-2 text-muted-foreground"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
      </Button>

      <Card className="border-primary/20 shadow-xl overflow-hidden">
        <div className="h-2 bg-primary w-full"></div>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Vincular Especialista</CardTitle>
          <CardDescription className="text-base mt-2">
            Insira o código de convite fornecido pelo seu profissional de saúde para compartilhar os
            relatórios e insights de forma segura.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLink} className="space-y-6">
            <div className="space-y-2">
              <Label>Selecione o Perfil do Jovem</Label>
              <Select value={selectedChild} onValueChange={setSelectedChild}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {children.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Nenhum perfil encontrado
                    </SelectItem>
                  ) : (
                    children.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} {c.assigned_professional ? '(Já possui profissional)' : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Código de Convite do Profissional</Label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Ex: A1B2C3"
                className="text-center text-xl tracking-widest font-mono uppercase h-12"
                maxLength={8}
                required
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                Ao vincular, o especialista terá acesso apenas aos relatórios de análise de risco
                deste perfil para auxiliar no acompanhamento clínico. Você pode revogar este acesso
                futuramente.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !selectedChild || !inviteCode}
              className="w-full h-12 font-bold text-md"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : 'Confirmar Vínculo'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
