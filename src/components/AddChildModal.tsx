import { useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { PlusCircle, Lock } from 'lucide-react'
import { HealthProfessional } from '@/stores/useFamilyStore'
import useFamilyStore from '@/stores/useFamilyStore'
import { Checkbox } from '@/components/ui/checkbox'

interface Props {
  onAdd: (child: {
    name: string
    age: number
    platforms: string[]
    hasProfessional: boolean
    healthProfessional: any // relaxing type to allow inviteCode
    consentAccepted: boolean
    signatureName: string
  }) => void
}

export function AddChildModal({ onAdd }: Props) {
  const { plan, childrenProfiles } = useFamilyStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [platform, setPlatform] = useState('')

  const [hasProfessional, setHasProfessional] = useState(false)
  const [profName, setProfName] = useState('')
  const [profClinic, setProfClinic] = useState('')
  const [profPhone, setProfPhone] = useState('')
  const [profEmail, setProfEmail] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  const [consentAccepted, setConsentAccepted] = useState(false)
  const [signatureName, setSignatureName] = useState('')

  const isEssencial = plan === 'Plano Essencial' || plan === 'Pacote Essencial'
  const isDiamond = plan === 'Plano Diamond' || plan === 'Pacote Diamond'
  const maxChildren = isEssencial ? 1 : isDiamond ? 3 : 5
  const canAdd = childrenProfiles.length < maxChildren

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !canAdd) return
    setOpen(isOpen)
  }

  const handleSave = () => {
    if (!name || !age || !platform) return
    if (hasProfessional && !inviteCode && (!profName || !profPhone)) return

    onAdd({
      name,
      age: Number(age),
      platforms: [platform],
      hasProfessional,
      healthProfessional: hasProfessional
        ? {
            name: profName,
            clinic: profClinic,
            phone: profPhone,
            email: profEmail,
            inviteCode: inviteCode || undefined,
          }
        : null,
      consentAccepted,
      signatureName,
    })
    setOpen(false)
    setName('')
    setAge('')
    setPlatform('')
    setHasProfessional(false)
    setProfName('')
    setProfClinic('')
    setProfPhone('')
    setProfEmail('')
    setInviteCode('')
    setConsentAccepted(false)
    setSignatureName('')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={!canAdd}
          className="w-full border-dashed border-2 py-6 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors gap-2"
        >
          {canAdd ? <PlusCircle className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          {canAdd
            ? 'Adicionar Novo Perfil de Filho'
            : `Limite de Perfis Atingido (${childrenProfiles.length}/${maxChildren})`}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Perfil</DialogTitle>
          <DialogDescription>
            Cadastre as informações básicas do seu filho para iniciar o monitoramento direcionado.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome ou Apelido</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Lucas"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">Idade</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ex: 14"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="platform">Rede Social Principal</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger id="platform">
                <SelectValue placeholder="Selecione a plataforma..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TikTok">TikTok</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="YouTube">YouTube</SelectItem>
                <SelectItem value="Roblox/Discord">Jogos (Discord/Roblox)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-6 border-t">
            <div className="flex items-center justify-between">
              <Label htmlFor="modal-has-prof" className="text-sm font-semibold cursor-pointer">
                Acompanhamento Profissional?
              </Label>
              <Switch
                id="modal-has-prof"
                checked={hasProfessional}
                onCheckedChange={setHasProfessional}
              />
            </div>
            {hasProfessional && (
              <div className="space-y-3 bg-muted/30 p-4 rounded-xl border animate-fade-in">
                <div className="space-y-2">
                  <Label>Código de Convite do Profissional (Opcional)</Label>
                  <Input
                    placeholder="Ex: A1B2C3"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    className="uppercase bg-white"
                  />
                  <p className="text-xs text-muted-foreground">
                    Se tiver o código, a vinculação será automática.
                  </p>
                </div>
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label>Nome do Especialista {!inviteCode && '*'}</Label>
                  <Input
                    placeholder="Ex: Dra. Ana Silva"
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Clínica / Instituição</Label>
                  <Input
                    placeholder="Ex: Clínica Evoluir"
                    value={profClinic}
                    onChange={(e) => setProfClinic(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Telefone {!inviteCode && '*'}</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={profPhone}
                      onChange={(e) => setProfPhone(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="email@clinica.com"
                      value={profEmail}
                      onChange={(e) => setProfEmail(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-6 border-t">
            <h4 className="font-semibold text-sm">Termo de Autorização Legal</h4>
            <div className="h-28 overflow-y-auto text-xs text-muted-foreground bg-muted/30 p-3 rounded-md border">
              <p>
                Pelo presente instrumento, declaro ser o responsável legal pelo menor cadastrado e
                autorizo formalmente a coleta, processamento e análise de dados provenientes de suas
                interações em plataformas digitais, por meio da plataforma BekAI, em conformidade
                com a LGPD.
              </p>
              <p className="mt-2">
                Estou ciente de que o monitoramento é preventivo e os dados não serão
                comercializados.
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="consent"
                checked={consentAccepted}
                onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
                className="mt-0.5"
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="consent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Li e aceito os termos de monitoramento digital.
                </Label>
              </div>
            </div>

            {consentAccepted && (
              <div className="space-y-2 animate-fade-in pt-2">
                <Label htmlFor="signature">Assinatura Digital (Seu Nome Completo)</Label>
                <Input
                  id="signature"
                  placeholder="Ex: João da Silva Santos"
                  value={signatureName}
                  onChange={(e) => setSignatureName(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !name ||
              !age ||
              !platform ||
              (hasProfessional && !inviteCode && (!profName || !profPhone)) ||
              !consentAccepted ||
              !signatureName.trim()
            }
          >
            Salvar Perfil
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
