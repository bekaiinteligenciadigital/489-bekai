import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { ChevronRight, CheckCircle2, ShieldCheck, User } from 'lucide-react'
import { MentorCard } from '@/components/MentorCard'
import { AnaliseColeta } from '@/components/AnaliseColeta'
import { AnaliseProcessando } from '@/components/AnaliseProcessando'
import useFamilyStore from '@/stores/useFamilyStore'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  'TikTok',
  'Instagram',
  'YouTube',
  'WhatsApp',
  'Roblox',
  'Discord',
  'X/Twitter',
  'Twitch',
]

const behaviorsList = [
  'Indicador de Comparação Social Excessiva',
  'Padrão de Uso Compulsivo (Vaping de Atenção)',
  'Indicador de Respostas Hostis / Polarização',
  'Indicador de Isolamento / Apatia',
  'Indicador de Consumo de Conteúdo de Risco Severo',
  'Sinais de Desinteresse Escolar / Desconexão',
]

export default function NovaAnalise() {
  const [step, setStep] = useState(1)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { childrenProfiles, setPendingAnalysis } = useFamilyStore()
  const [selectedChild, setSelectedChild] = useState(childrenProfiles[0]?.id || '')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([])

  useEffect(() => {
    if (step === 3) {
      toast({
        title: 'Motor de Mapeamento Ativado',
        description: 'Analisando padrões e preparando Agente Autônomo...',
      })
      const timer = setTimeout(
        () => navigate('/resultado', { state: { platforms: selectedPlatforms } }),
        5000,
      )
      return () => clearTimeout(timer)
    }
  }, [step, navigate, toast, selectedPlatforms])

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <div className="text-center sm:text-left">
        <h2 className="text-3xl font-serif font-bold text-primary">
          Novo Mapeamento de Influência
        </h2>
        <p className="text-muted-foreground mt-2">
          Forneça dados sobre os hábitos digitais para mapearmos a influência de consumo.
        </p>
      </div>

      <Alert className="bg-primary/5 text-primary border-primary/20">
        <ShieldCheck className="w-4 h-4" />
        <AlertTitle className="text-sm font-semibold">Uso Educativo e Privacidade</AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground mt-1">
          Nenhuma conta privada é monitorada invasivamente. A análise busca mapear influências
          algorítmicas, promovendo Substituição Intencional de conteúdo.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between mb-8 relative max-w-xl mx-auto sm:mx-0">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-muted -z-10 rounded-full" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-primary -z-10 transition-all duration-700 ease-in-out rounded-full"
          style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
        />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-4 border-background shadow-sm ${step >= i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-fade-in-up">
          <MentorCard title="A Perspectiva de Curadoria">
            <div className="space-y-3 text-sm text-indigo-950/80 leading-relaxed">
              <p>
                A tecnologia não precisa ser bloqueada, mas <strong>reeducada</strong>. O foco não é
                a restrição, mas a Substituição Intencional de conteúdo superficial por conteúdo que
                constrói a autonomia e virtudes culturais da vida real.
              </p>
            </div>
          </MentorCard>

          <Card className="shadow-md">
            <CardHeader className="pb-4">
              <CardTitle>Passo 1: Perfil e Padrões de Resposta Digital</CardTitle>
              <CardDescription>
                Escolha o perfil e os sinais de influência observados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <Label className="text-base font-semibold flex items-center gap-2 text-primary">
                  <User className="w-5 h-5" /> Iniciar mapeamento para:
                </Label>
                {childrenProfiles.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {childrenProfiles.map((child) => (
                      <div
                        key={child.id}
                        onClick={() => setSelectedChild(child.id)}
                        className={cn(
                          'p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between border-2',
                          selectedChild === child.id
                            ? 'bg-primary/10 border-primary text-primary shadow-sm'
                            : 'bg-background border-transparent hover:border-primary/30 hover:bg-background/50',
                        )}
                      >
                        <span className="font-bold">{child.name}</span>
                        {selectedChild === child.id && <CheckCircle2 className="w-5 h-5" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                    Nenhum filho cadastrado.{' '}
                    <Link to="/setup-jovem" className="text-primary font-bold hover:underline">
                      Cadastre agora.
                    </Link>
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-3 pt-2">
                  <Label className="text-base font-semibold">Plataformas a Reeducar</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <Badge
                        key={p}
                        variant={selectedPlatforms.includes(p) ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-all px-3 py-1.5 text-sm',
                          selectedPlatforms.includes(p)
                            ? 'shadow-md hover:bg-primary/90'
                            : 'hover:bg-muted',
                        )}
                        onClick={() =>
                          setSelectedPlatforms((prev) =>
                            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
                          )
                        }
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O Agente Autônomo irá sugerir curadoria nestas redes selecionadas.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-base font-semibold">
                    Padrões de Resposta Digital Observados
                  </Label>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Selecione as evidências comportamentais coletadas. Marque opções como{' '}
                    <strong>Padrão de Uso Compulsivo</strong> se houver indícios de{' '}
                    <em>Vaping de Atenção</em> (consumo passivo e ininterrupto de vídeos curtos).
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {behaviorsList.map((b) => (
                    <div
                      key={b}
                      className="flex items-start space-x-3 border p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <Checkbox
                        id={b}
                        checked={selectedBehaviors.includes(b)}
                        onCheckedChange={(checked) => {
                          setSelectedBehaviors((prev) =>
                            checked ? [...prev, b] : prev.filter((x) => x !== b),
                          )
                        }}
                        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor={b}
                        className="text-sm font-medium leading-tight cursor-pointer flex-1 group-hover:text-primary transition-colors"
                      >
                        {b}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t pt-6">
              <Button
                size="lg"
                onClick={() => {
                  if (!selectedChild && childrenProfiles.length > 0) {
                    toast({
                      title: 'Selecione um perfil',
                      description: 'Escolha para qual filho será o mapeamento.',
                      variant: 'destructive',
                    })
                    return
                  }
                  if (selectedPlatforms.length === 0) {
                    toast({
                      title: 'Selecione as plataformas',
                      description: 'Selecione ao menos uma plataforma.',
                      variant: 'destructive',
                    })
                    return
                  }
                  setPendingAnalysis({
                    childId: selectedChild,
                    platforms: selectedPlatforms,
                    behaviors: selectedBehaviors,
                  })
                  setStep(2)
                }}
              >
                Próximo Passo <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {step === 2 && <AnaliseColeta setStep={setStep} />}
      {step === 3 && <AnaliseProcessando />}
    </div>
  )
}
