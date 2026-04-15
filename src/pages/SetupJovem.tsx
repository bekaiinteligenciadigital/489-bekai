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
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import useFamilyStore from '@/stores/useFamilyStore'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, ArrowRight, CheckCircle2, Users, Plus, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { getErrorMessage } from '@/lib/pocketbase/errors'

interface PlatformInput {
  platform: string
  handle: string
}

export default function SetupJovem() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { addChild, plan, essentialChildrenCount } = useFamilyStore()

  const totalSlots = essentialChildrenCount || 1

  const [pendingProfiles, setPendingProfiles] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState(1)

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [platforms, setPlatforms] = useState<PlatformInput[]>([{ platform: '', handle: '' }])

  const isSpecialistPlan =
    plan.includes('Profissional') || sessionStorage.getItem('hasProfessional') === 'true'
  const pendingInviteCode = sessionStorage.getItem('pendingInviteCode') || ''

  const [hasProfessional, setHasProfessional] = useState(isSpecialistPlan)

  const [profSpecialties, setProfSpecialties] = useState<string[]>([])
  const [inviteCode, setInviteCode] = useState(pendingInviteCode)

  const availablePlatforms = [
    'WhatsApp',
    'Instagram',
    'TikTok',
    'YouTube',
    'Discord',
    'Roblox',
    'Outro',
  ]

  const resetForm = () => {
    setName('')
    setAge('')
    setPlatforms([{ platform: '', handle: '' }])
    setHasProfessional(isSpecialistPlan)
    setProfSpecialties([])
  }

  const updatePlatform = (index: number, field: keyof PlatformInput, value: string) => {
    const newPlatforms = [...platforms]
    newPlatforms[index][field] = value
    setPlatforms(newPlatforms)
  }

  const addPlatform = () => {
    setPlatforms([...platforms, { platform: '', handle: '' }])
  }

  const removePlatform = (index: number) => {
    setPlatforms(platforms.filter((_, i) => i !== index))
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()

    const validPlatforms = platforms.filter(
      (p) => p.platform.trim() !== '' && p.handle.trim() !== '',
    )

    if (!name || !age || validPlatforms.length === 0) {
      toast({
        title: 'Dados Incompletos',
        description:
          'Preencha os dados do jovem e cadastre pelo menos uma rede social com seu respectivo endereço ou @usuario.',
        variant: 'destructive',
      })
      return
    }

    if (hasProfessional && profSpecialties.length === 0) {
      toast({
        title: 'Dados do Especialista',
        description: 'Informe a especialidade do profissional.',
        variant: 'destructive',
      })
      return
    }

    const newProfile = {
      name,
      age: Number(age),
      platforms: validPlatforms,
      hasProfessional,
      inviteCode: hasProfessional ? inviteCode.trim().toUpperCase() : null,
      healthProfessional: hasProfessional ? { specialties: profSpecialties } : null,
    }

    setPendingProfiles([...pendingProfiles, newProfile])
    setCurrentStep((prev) => prev + 1)
    resetForm()

    if (currentStep < totalSlots) {
      toast({
        title: `Perfil ${currentStep} Salvo!`,
        description: `Vamos configurar o ${currentStep + 1}º perfil.`,
      })
    }
  }

  const handleFinish = async () => {
    try {
      for (const p of pendingProfiles.slice(0, totalSlots)) {
        const childRecord = await pb.collection('children').create({
          name: p.name,
          birth_date: new Date(
            new Date().setFullYear(new Date().getFullYear() - p.age),
          ).toISOString(),
          parent: pb.authStore.record?.id,
          platforms: p.platforms, // Saving JSON object array directly
          professional_info: p.healthProfessional,
        })
        addChild(p)

        if (p.inviteCode) {
          try {
            await pb.send('/backend/v1/professional/link', {
              method: 'POST',
              body: JSON.stringify({
                childId: childRecord.id,
                inviteCode: p.inviteCode,
              }),
              headers: { 'Content-Type': 'application/json' },
            })
          } catch (linkErr) {
            console.error('Failed to link professional on setup', linkErr)
            toast({
              title: 'Aviso',
              description: `O perfil ${p.name} foi criado, mas o código de convite do profissional era inválido.`,
              variant: 'destructive',
            })
          }
        }
      }
      toast({
        title: 'Setup Concluído!',
        description: 'Todos os perfis foram configurados. Bem-vindo ao seu Dashboard.',
      })
      navigate('/dashboard')
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  const progressPercentage =
    currentStep <= totalSlots ? ((currentStep - 1) / totalSlots) * 100 : 100

  // 8 to 18 years
  const ageOptions = Array.from({ length: 11 }, (_, i) => 8 + i)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      <div className="mb-8 text-center z-10 animate-fade-in-down mt-6">
        <h2 className="text-3xl font-serif font-bold text-primary flex items-center justify-center gap-3">
          <UserPlus className="w-8 h-8 text-secondary" /> Setup do Jovem
        </h2>
        <p className="text-muted-foreground mt-2 font-medium">
          Registre os perfis inclusos no seu plano.
        </p>
      </div>

      <div className="w-full max-w-md mb-6 z-10 animate-fade-in-up">
        <div className="flex justify-between text-sm font-semibold text-muted-foreground mb-2">
          <span>Progresso do Setup</span>
          <span>
            {currentStep <= totalSlots ? `Perfil ${currentStep} de ${totalSlots}` : 'Resumo Final'}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {currentStep <= totalSlots ? (
        <Card className="w-full max-w-md shadow-2xl border-primary/10 z-10 animate-fade-in-up bg-white">
          <CardHeader className="pb-2 border-b border-muted mb-4">
            <CardTitle className="text-xl">Cadastro do {currentStep}º Jovem</CardTitle>
            <CardDescription>
              Preencha os dados para iniciar o Mapeamento de Influência Digital.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNext} className="space-y-5">
              <div className="space-y-2">
                <Label>Nome ou Apelido *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`Ex: Lucas`}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Idade *</Label>
                <Select value={age} onValueChange={setAge}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Selecione a idade" />
                  </SelectTrigger>
                  <SelectContent>
                    {ageOptions.map((y) => (
                      <SelectItem key={y} value={y.toString()}>
                        {y} anos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
                  A idade define a <strong>Escala de Maturidade (8 a 18 anos)</strong> para
                  calibração do algoritmo de influência digital.
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t mt-4 border-border/50">
                <Label className="pt-2 block">Cadastre as Redes Sociais Utilizadas *</Label>
                <div className="space-y-3">
                  {platforms.map((p, idx) => (
                    <div key={idx} className="flex items-start gap-2 animate-fade-in">
                      <div className="w-1/3 min-w-[120px]">
                        <Select
                          value={p.platform}
                          onValueChange={(val) => updatePlatform(idx, 'platform', val)}
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Rede" />
                          </SelectTrigger>
                          <SelectContent>
                            {availablePlatforms.map((ap) => (
                              <SelectItem key={ap} value={ap}>
                                {ap}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={p.handle}
                          onChange={(e) => updatePlatform(idx, 'handle', e.target.value)}
                          placeholder="@usuario ou link"
                          className="bg-background"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removePlatform(idx)}
                          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={platforms.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPlatform}
                    className="w-full mt-2 border-dashed text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Rede Social
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t mt-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="has-prof" className="text-base font-semibold cursor-pointer">
                    Apoio de Profissional Especializado?
                  </Label>
                  <Switch
                    id="has-prof"
                    checked={hasProfessional}
                    onCheckedChange={setHasProfessional}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ative se o jovem recebe apoio clínico.
                </p>

                {hasProfessional && (
                  <div className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 animate-fade-in shadow-inner">
                    <div className="space-y-3">
                      <Label>Código de Convite do Profissional (Opcional)</Label>
                      <Input
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Ex: A1B2C3"
                        className="bg-background uppercase tracking-widest font-mono"
                        maxLength={8}
                      />
                      <p className="text-[11px] text-emerald-700/80">
                        Insira o código fornecido pelo profissional para compartilhar dados
                        automaticamente.
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-emerald-100 pt-3">
                      <Label>Especialidade Clínica *</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                          <Checkbox
                            checked={profSpecialties.includes('Psiquiatra')}
                            onCheckedChange={(c) =>
                              setProfSpecialties((prev) =>
                                c
                                  ? [...prev, 'Psiquiatra']
                                  : prev.filter((x) => x !== 'Psiquiatra'),
                              )
                            }
                          />
                          Psiquiatra
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                          <Checkbox
                            checked={profSpecialties.includes('Psicólogo')}
                            onCheckedChange={(c) =>
                              setProfSpecialties((prev) =>
                                c ? [...prev, 'Psicólogo'] : prev.filter((x) => x !== 'Psicólogo'),
                              )
                            }
                          />
                          Psicólogo
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full h-14 text-md mt-8 shadow-xl font-bold">
                {currentStep < totalSlots ? (
                  <>
                    Próximo Perfil <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Revisar Setup <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md shadow-2xl border-primary/10 z-10 animate-fade-in-up bg-white">
          <CardHeader className="pb-4 border-b border-muted text-center">
            <div className="mx-auto bg-emerald-100 p-3 rounded-full mb-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Resumo do Setup</CardTitle>
            <CardDescription>
              Confirme os {totalSlots} perfis registrados antes de acessar o painel.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 pb-2">
              {pendingProfiles.slice(0, totalSlots).map((p, idx) => (
                <div
                  key={idx}
                  className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-2"
                >
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-lg text-foreground">
                      {p.name}{' '}
                      <span className="text-sm font-normal text-muted-foreground">
                        ({p.age} anos)
                      </span>
                    </h4>
                    <span className="text-xs font-bold text-muted-foreground uppercase bg-background px-2 py-1 rounded-md border">
                      Perfil {idx + 1}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Redes:</strong>{' '}
                    {p.platforms
                      .map((plat: PlatformInput) => `${plat.platform} (${plat.handle})`)
                      .join(', ')}
                  </p>
                  {p.hasProfessional && (
                    <p className="text-sm text-emerald-700 flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-md border border-emerald-100/50 mt-2">
                      <Users className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        <strong>Especialidades:</strong>{' '}
                        {p.healthProfessional?.specialties.join(', ')}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={handleFinish}
              className="w-full h-14 text-md mt-6 shadow-xl font-bold bg-primary hover:bg-primary/90"
            >
              Confirmar e Acessar Plataforma <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
