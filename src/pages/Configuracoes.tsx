import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { User, CreditCard, Users, History, Save, BellRing, Smartphone, CheckCircle2, Clock, AlertCircle, LogOut } from 'lucide-react'
import useFamilyStore from '@/stores/useFamilyStore'
import { ChildProfileItem } from '@/components/ChildProfileItem'
import { AddChildModal } from '@/components/AddChildModal'
import { useNavigate } from 'react-router-dom'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export default function Configuracoes() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { user, plan, childrenProfiles, essentialChildrenCount, setUser, removeChild, addChild } =
    useFamilyStore()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [telegramId, setTelegramId] = useState('')

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
      setWhatsappEnabled(user.whatsapp_enabled || false)
      setTelegramEnabled(user.telegram_enabled || false)
      setTelegramId(user.telegram_id || '')
    } else if (pb.authStore.record) {
      const r = pb.authStore.record
      setName(r.name || '')
      setEmail(r.email || '')
      setPhone(r.phone || '')
      setWhatsappEnabled(r.whatsapp_enabled || false)
      setTelegramEnabled(r.telegram_enabled || false)
      setTelegramId(r.telegram_id || '')
    }
  }, [user])

  const handleSave = async () => {
    try {
      if (whatsappEnabled && phone && !phone.startsWith('+')) {
        toast({
          title: 'Aviso de Validação',
          description: 'O número de WhatsApp deve incluir o código do país (ex: +5511999999999).',
          variant: 'destructive',
        })
        return
      }

      if (pb.authStore.record?.id) {
        await pb.collection('Nascimento').update(pb.authStore.record.id, {
          name,
          email,
          phone,
          whatsapp_enabled: whatsappEnabled,
          telegram_enabled: telegramEnabled,
          telegram_id: telegramId,
        })
      }

      setUser({
        ...(user || {}),
        name,
        email,
        phone,
        whatsapp_enabled: whatsappEnabled,
        telegram_enabled: telegramEnabled,
        telegram_id: telegramId,
      })

      toast({
        title: 'Configurações Atualizadas',
        description: 'Suas preferências foram salvas com sucesso.',
      })
    } catch (e: any) {
      toast({
        title: 'Erro ao salvar',
        description: e.message || 'Houve um problema ao salvar as configurações.',
        variant: 'destructive',
      })
    }
  }

  const authRecord = pb.authStore.record
  const subscriptionStatus = authRecord?.subscription_status || 'trialing'
  const activePlanId = authRecord?.active_plan || ''

  const isSpecialist =
    activePlanId === 'clinical_expert' ||
    plan === 'Pacote Specialist' ||
    plan === 'Plano Specialist' ||
    plan === 'Plano Essencial com Especialista'
  const getPlanLimit = () => essentialChildrenCount || 2

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    active: {
      label: 'Ativa',
      icon: <CheckCircle2 className="w-4 h-4" />,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    trialing: {
      label: 'Período de Teste',
      icon: <Clock className="w-4 h-4" />,
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    canceled: {
      label: 'Cancelada',
      icon: <AlertCircle className="w-4 h-4" />,
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    past_due: {
      label: 'Pagamento Pendente',
      icon: <AlertCircle className="w-4 h-4" />,
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  }
  const statusInfo = statusConfig[subscriptionStatus] ?? statusConfig['trialing']

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-primary">Configurações</h2>
          <p className="text-muted-foreground mt-1">
            Gerencie sua conta, perfis familiares e detalhes da assinatura.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive shadow-sm"
        >
          <LogOut className="w-4 h-4" /> Sair da Conta
        </Button>
      </div>

      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full sm:max-w-md grid-cols-2 mb-6 bg-muted/50 h-12 p-1">
          <TabsTrigger value="perfil" className="data-[state=active]:bg-background">
            <User className="w-4 h-4 mr-2 hidden sm:block" /> Perfil e Família
          </TabsTrigger>
          <TabsTrigger value="faturamento" className="data-[state=active]:bg-background">
            <CreditCard className="w-4 h-4 mr-2 hidden sm:block" /> Faturamento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6 animate-fade-in">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-secondary" /> Perfil do Responsável
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSave} className="gap-2 shadow-sm">
                  <Save className="w-4 h-4" /> Salvar Perfil
                </Button>
                <Button
                  onClick={() => navigate('/admin/growth')}
                  variant="outline"
                  className="shadow-sm"
                >
                  Acessar Painel de Crescimento
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BellRing className="w-5 h-5 text-secondary" /> Alertas e Mensageria
              </CardTitle>
              <CardDescription>
                Configure como deseja receber alertas de riscos críticos e novos relatórios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex flex-col gap-4 p-4 border rounded-xl bg-muted/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-emerald-600" /> WhatsApp
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas instantâneos no seu WhatsApp.
                    </p>
                  </div>
                  <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
                </div>
                {whatsappEnabled && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Número do WhatsApp</Label>
                    <Input
                      placeholder="+55 11 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                    />
                    <p className="text-xs text-muted-foreground">
                      Inclua o código do país obrigatoriamente (ex: +55).
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 p-4 border rounded-xl bg-muted/10 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <svg
                        viewBox="0 0 24 24"
                        className="w-4 h-4 fill-current text-sky-500"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.21-1.12-.32-1.08-.68.02-.19.29-.39.81-.6 3.17-1.38 5.28-2.29 6.33-2.75 3.02-1.32 3.64-1.53 4.05-1.54.09 0 .29.02.4.11.09.07.13.18.15.28 0 .04.01.12 0 .17z" />
                      </svg>
                      Telegram
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receba alertas via bot do Telegram.
                    </p>
                  </div>
                  <Switch checked={telegramEnabled} onCheckedChange={setTelegramEnabled} />
                </div>
                {telegramEnabled && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label>Chat ID do Telegram</Label>
                    <Input
                      placeholder="Ex: 123456789"
                      value={telegramId}
                      onChange={(e) => setTelegramId(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Inicie uma conversa com nosso bot e digite /start para obter seu Chat ID.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSave} className="gap-2 shadow-sm">
                  <Save className="w-4 h-4" /> Salvar Preferências
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="bg-muted/20 border-b pb-4">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" /> Perfis Monitorados
                </div>
                <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-1 rounded-full border">
                  {childrenProfiles.length} / {getPlanLimit()} utilizados
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {childrenProfiles.map((child) => (
                <ChildProfileItem key={child.id} child={child} onRemove={removeChild} />
              ))}
              {childrenProfiles.length < getPlanLimit() ? (
                <AddChildModal
                  onAdd={async (c) => {
                    try {
                      if (pb.authStore.record?.id) {
                        await pb.collection('children').create({
                          name: c.name,
                          parent: pb.authStore.model.id,
                          platforms: c.platforms,
                          consent_accepted: c.consentAccepted,
                          consent_timestamp: c.consentAccepted ? new Date().toISOString() : null,
                          consent_signature_name: c.signatureName,
                          monitoring_status: c.consentAccepted ? 'active' : 'inactive',
                        })
                      }
                    } catch (e) {
                      console.error('Failed to save child to PB', e)
                    }
                    addChild(c as any)
                    toast({ title: 'Perfil Adicionado' })
                  }}
                />
              ) : (
                <p className="text-sm text-amber-600 font-medium text-center bg-amber-50 p-2 rounded-md border border-amber-100">
                  Limite de perfis atingido. Faça o upgrade de plano para adicionar mais jovens.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faturamento" className="space-y-6 animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            <Card className="shadow-sm border-secondary/20 bg-gradient-to-b from-background to-secondary/5 h-full">
              <CardHeader className="border-b border-secondary/10 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Assinatura Atual</CardTitle>
                  <Badge
                    variant="outline"
                    className={`flex items-center gap-1.5 text-xs font-semibold shadow-sm ${statusInfo.className}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 flex flex-col justify-between h-[calc(100%-60px)] space-y-4">
                <div>
                  <p className="font-bold text-2xl text-primary">{plan || 'Sem plano ativo'}</p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {isSpecialist
                      ? 'Acesso total à Ponte de Apoio e relatórios avançados de influência clínica.'
                      : 'Agente Autônomo ativo. Faça o upgrade para desbloquear suporte de Especialistas.'}
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/planos')}
                  variant={isSpecialist ? 'outline' : 'default'}
                  className="w-full shadow-sm mt-auto font-bold"
                >
                  {isSpecialist ? 'Ver Planos' : 'Desbloquear Nível Especialista'}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm h-full">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Método de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center gap-4 py-6 text-center text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                  <CreditCard className="w-8 h-8 text-muted-foreground/50" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Nenhum cartão cadastrado</p>
                    <p className="text-xs mt-1">
                      O gerenciamento de pagamentos será habilitado em breve.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5 text-secondary" /> Histórico de Pagamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="py-10">
              <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                <History className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-foreground">Nenhuma cobrança encontrada</p>
                <p className="text-xs max-w-xs">
                  Seu histórico de faturas aparecerá aqui assim que a integração de pagamentos estiver ativa.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
