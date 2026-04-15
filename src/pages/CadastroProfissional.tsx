import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Stethoscope, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function CadastroProfissional() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [fullName, setFullName] = useState(pb.authStore.record?.name || '')
  const [phone, setPhone] = useState(pb.authStore.record?.phone || '')
  const [email, setEmail] = useState(pb.authStore.record?.email || '')
  const [specialty, setSpecialty] = useState('')
  const [councilId, setCouncilId] = useState('')
  const [attendanceTypes, setAttendanceTypes] = useState<string[]>([])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length > 11) val = val.slice(0, 11)
    if (val.length > 2) val = `(${val.slice(0, 2)}) ${val.slice(2)}`
    if (val.length > 10) val = `${val.slice(0, 10)}-${val.slice(10)}`
    setPhone(val)
  }

  const handleAttendanceChange = (type: string, checked: boolean) => {
    if (checked) {
      setAttendanceTypes((prev) => [...prev, type])
    } else {
      setAttendanceTypes((prev) => prev.filter((t) => t !== type))
    }
  }

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!fullName || !phone || !email || !specialty || !councilId || attendanceTypes.length === 0) {
      toast({
        title: 'Dados Incompletos',
        description:
          'Por favor, preencha todos os campos obrigatórios (incluindo Tipo de Atendimento).',
        variant: 'destructive',
      })
      return
    }

    try {
      if (pb.authStore.record) {
        let inviteCode = pb.authStore.record.invite_code
        if (!inviteCode) {
          inviteCode = generateInviteCode()
        }

        await pb.collection('Nascimento').update(pb.authStore.record.id, {
          name: fullName,
          phone,
          specialty,
          council_id: councilId,
          attendance_type: attendanceTypes,
          invite_code: inviteCode,
          role: 'professional',
        })

        await pb.collection('Nascimento').authRefresh()
      }

      toast({
        title: 'Cadastro Concluído',
        description: 'Seu perfil profissional foi configurado com sucesso.',
      })
      navigate('/specialist/dashboard')
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      <div className="mb-8 text-center z-10 animate-fade-in-down mt-6">
        <h2 className="text-3xl font-serif font-bold text-primary flex items-center justify-center gap-3">
          <Stethoscope className="w-8 h-8 text-secondary" /> Onboarding Profissional
        </h2>
        <p className="text-muted-foreground mt-2 font-medium">
          Configure suas credenciais clínicas para acessar o módulo Execution.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-primary/10 z-10 animate-fade-in-up bg-white">
        <CardHeader className="pb-4 border-b border-muted">
          <CardTitle className="text-xl">Dados do Especialista</CardTitle>
          <CardDescription>
            Estas informações serão utilizadas nos relatórios clínicos gerados pela plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Dra. Ana Silva"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone / WhatsApp *</Label>
              <Input
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(11) 99999-9999"
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label>Email de Contato *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ana@clinica.com"
                className="bg-background"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Especialidade *</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Psiquiatra">Psiquiatra</SelectItem>
                    <SelectItem value="Psicólogo">Psicólogo</SelectItem>
                    <SelectItem value="Neurologista">Neuro</SelectItem>
                    <SelectItem value="Pediatra">Pediatra</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Registro (CRM/CRP) *</Label>
                <Input
                  value={councilId}
                  onChange={(e) => setCouncilId(e.target.value)}
                  placeholder="Ex: 12345/SP"
                  className="bg-background"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Label>Tipo de Atendimento *</Label>
              <div className="flex flex-wrap gap-4">
                {['Consultório', 'Clínica', 'Hospital'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`att-${type}`}
                      checked={attendanceTypes.includes(type)}
                      onCheckedChange={(checked) =>
                        handleAttendanceChange(type, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={`att-${type}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-md mt-8 shadow-xl font-bold bg-primary hover:bg-primary/90"
            >
              Concluir e Continuar <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
