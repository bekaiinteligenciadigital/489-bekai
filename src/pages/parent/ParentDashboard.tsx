import { useEffect, useState, useCallback } from 'react'
import {
  Child,
  DigitalEvent,
  AnalysisRecord,
  ScientificRef,
  getMyChildren,
  getChildDigitalEvents,
  getChildAnalysis,
  getScientificLibrary,
} from '@/services/parent'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Shield, Activity, AlertTriangle, Download, BrainCircuit } from 'lucide-react'
import { DigitalInfluenceMap } from '@/components/parent/DigitalInfluenceMap'
import { ParentalScriptsLibrary } from '@/components/parent/ParentalScriptsLibrary'
import { MonitoringStatus } from '@/components/parent/MonitoringStatus'
import { BehavioralStratification } from '@/components/parent/BehavioralStratification'
import { ReportExportModal } from '@/components/parent/ReportExportModal'
import { ProfessionalReferralModal } from '@/components/parent/ProfessionalReferralModal'
import { TermTooltip } from '@/components/ui/glossary-tooltip'
import pb from '@/lib/pocketbase/client'
import { AnaliseProcessando } from '@/components/AnaliseProcessando'
import { ConsentModal } from '@/components/parent/ConsentModal'
import useFamilyStore from '@/stores/useFamilyStore'
import { SocialConnectionsPanel } from '@/components/parent/SocialConnectionsPanel'
import { CounterbalancePanel } from '@/components/parent/CounterbalancePanel'
import { YouTubeAgentPanel } from '@/components/parent/YouTubeAgentPanel'
import {
  SocialConnection,
  SyncJob,
  connectSocialManually,
  disconnectSocialConnection,
  completeOAuthConnection,
  getChildSocialConnections,
  getChildSyncJobs,
  startOAuthConnection,
  syncSocialData,
} from '@/services/monitoring'

const ACTIVE_CHILD_STORAGE_KEY = 'bekai:parent-dashboard:active-child'

export default function ParentDashboard() {
  const { user, plan } = useFamilyStore()
  const [children, setChildren] = useState<Child[]>([])
  const [activeChildId, setActiveChildId] = useState<string>('')

  const [events, setEvents] = useState<DigitalEvent[]>([])
  const [analysisRecords, setAnalysisRecords] = useState<AnalysisRecord[]>([])
  const [library, setLibrary] = useState<ScientificRef[]>([])
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([])
  const [reportHistory, setReportHistory] = useState<any[]>([])
  const [actionPlans, setActionPlans] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [referralModalOpen, setReferralModalOpen] = useState(false)
  const [consentModalOpen, setConsentModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [busyConnectionId, setBusyConnectionId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [kids, refs, notif] = await Promise.all([
        getMyChildren(),
        getScientificLibrary(),
        pb.collection('notifications').getFullList({ sort: '-created' }).catch(() => []),
      ])
      setChildren(kids)
      if (kids.length > 0 && !activeChildId) {
        const storedChildId =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(ACTIVE_CHILD_STORAGE_KEY)
            : null
        setActiveChildId(
          storedChildId && kids.some((kid) => kid.id === storedChildId) ? storedChildId : kids[0].id,
        )
      }
      setLibrary(refs)
      setNotifications(notif)
    } catch (err) {
      console.error('Failed to load base dashboard data', err)
    } finally {
      setLoading(false)
    }
  }, [activeChildId])

  const loadChildData = useCallback(async (childId: string) => {
    try {
      const [evts, analyses, social, jobs, assessments, reports, plans] = await Promise.all([
        getChildDigitalEvents(childId),
        getChildAnalysis(childId),
        getChildSocialConnections(childId),
        getChildSyncJobs(childId),
        pb.collection('assessments').getFullList({ filter: `child = "${childId}"` }),
        pb.collection('report_history').getFullList({ filter: `child = "${childId}"`, sort: '-created' }).catch(() => []),
        pb.collection('action_plans').getFullList({
          filter: `child = "${childId}"`,
          sort: '-created',
          expand: 'bundle',
        }).catch(() => []),
      ])

      setEvents(evts)
      setAnalysisRecords(analyses)
      setConnections(social)
      setSyncJobs(jobs)
      setReportHistory(reports)
      setActionPlans(plans)
      setIsAnalyzing(assessments.some((a) => a.status === 'submitted'))
    } catch (err) {
      console.error('Failed to load child specific data', err)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (activeChildId) loadChildData(activeChildId)
  }, [activeChildId, loadChildData])

  useEffect(() => {
    if (activeChildId && typeof window !== 'undefined') {
      window.localStorage.setItem(ACTIVE_CHILD_STORAGE_KEY, activeChildId)
    }
  }, [activeChildId])

  useRealtime('digital_events', () => {
    if (activeChildId) loadChildData(activeChildId)
  })
  useRealtime('analysis_records', () => {
    if (activeChildId) loadChildData(activeChildId)
  })
  useRealtime('assessments', () => {
    if (activeChildId) loadChildData(activeChildId)
  })
  useRealtime('children', () => {
    loadData()
  })
  useRealtime('social_connections', () => {
    if (activeChildId) loadChildData(activeChildId)
  })
  useRealtime('sync_jobs', () => {
    if (activeChildId) loadChildData(activeChildId)
  })

  const activeChild = children.find((c) => c.id === activeChildId) || null
  const latestAnalysis = analysisRecords[0] || null
  const latestSyncJob = syncJobs[0] || null
  const latestReport = reportHistory[0] || null
  const activePlan = actionPlans.find((plan) => plan.status === 'active') || actionPlans[0] || null
  const unreadNotifications = notifications.filter((item) => !item.is_read).length

  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    }
  }

  const handleSync = async () => {
    if (!activeChild) return
    setSyncing(true)
    try {
      await syncSocialData(activeChild.id)
      await Promise.all([loadChildData(activeChild.id), loadData()])
    } catch (err) {
      console.error('Failed to sync social data', err)
    } finally {
      setSyncing(false)
    }
  }

  const handleStartOAuth = async (connection: SocialConnection) => {
    setBusyConnectionId(connection.id)
    try {
      const result = await startOAuthConnection(connection.id)
      const useMock = window.confirm(
        `Fluxo OAuth preparado para ${connection.platform}.\n\nScopes:\n${result.scopes.join(', ')}\n\nDeseja concluir com uma credencial de teste agora?`,
      )

      if (useMock) {
        await completeOAuthConnection(connection.id, {
          credential_reference: `${connection.platform.toLowerCase()}_${connection.handle.replace(/[^a-z0-9]/gi, '').toLowerCase()}_token`,
          external_account_id: `${connection.platform.toLowerCase()}_${connection.id}`,
          granted_scopes: result.scopes,
          profile_url: connection.profile_url,
          expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        })
      } else {
        window.alert(`URL de autorização preparada:\n\n${result.authorization_url}`)
      }

      if (activeChild) {
        await loadChildData(activeChild.id)
        await loadData()
      }
    } catch (err) {
      console.error('Failed to start oauth flow', err)
    } finally {
      setBusyConnectionId(null)
    }
  }

  const handleConnectManual = async (connection: SocialConnection) => {
    const credentialReference = window.prompt(
      `Informe a referência segura da credencial para ${connection.platform} (${connection.handle}):`,
      connection.credential_reference || '',
    )

    if (!credentialReference) return

    setBusyConnectionId(connection.id)
    try {
      await connectSocialManually(connection.id, {
        credential_reference: credentialReference,
        external_account_id: `${connection.platform.toLowerCase()}_${connection.id}`,
        granted_scopes: Array.isArray(connection.consent_scope_json)
          ? (connection.consent_scope_json as string[])
          : ['basic.read'],
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      })

      if (activeChild) {
        await loadChildData(activeChild.id)
        await loadData()
      }
    } catch (err) {
      console.error('Failed to connect social credential manually', err)
    } finally {
      setBusyConnectionId(null)
    }
  }

  const handleDisconnect = async (connection: SocialConnection) => {
    setBusyConnectionId(connection.id)
    try {
      await disconnectSocialConnection(connection.id)
      if (activeChild) {
        await loadChildData(activeChild.id)
        await loadData()
      }
    } catch (err) {
      console.error('Failed to disconnect social connection', err)
    } finally {
      setBusyConnectionId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando painel educacional...
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <Shield className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Dashboard de Literacia</h2>
        <p className="text-muted-foreground">
          Nenhum perfil de criança associado à sua conta. Entre em contato com o suporte para
          concluir o setup.
        </p>
      </div>
    )
  }

  if (isAnalyzing) {
    return (
      <div className="max-w-3xl mx-auto mt-20 p-6">
        <AnaliseProcessando />
      </div>
    )
  }

  const firstName = (user?.name || pb.authStore.record?.name || 'Responsável').split(' ')[0]
  const totalChildren = children.length
  const activeChildren = children.filter(
    (c) => (c as any).monitoring_status === 'active' || (c as any).consent_accepted,
  ).length
  const pendingConsent = children.filter((c) => !(c as any).consent_accepted).length

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Welcome Header with real user data */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1">
              Bem-vindo ao painel
            </p>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              Olá, {firstName}!
            </h1>
            {plan && (
              <span className="inline-block mt-2 px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider">
                {plan}
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[80px]">
              <p className="text-2xl font-bold">{totalChildren}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">Perfis</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[80px]">
              <p className="text-2xl font-bold">{activeChildren}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">Ativos</p>
            </div>
            {latestAnalysis && (
              <div className="bg-white/10 rounded-xl p-4 text-center min-w-[80px]">
                <p className="text-2xl font-bold">{latestAnalysis.dq_score ?? '--'}</p>
                <p className="text-xs text-primary-foreground/70 mt-1">DQ Score</p>
              </div>
            )}
            <div className="bg-white/10 rounded-xl p-4 text-center min-w-[80px]">
              <p className="text-2xl font-bold">{unreadNotifications}</p>
              <p className="text-xs text-primary-foreground/70 mt-1">Alertas</p>
            </div>
          </div>
        </div>
      </div>

      {pendingConsent > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <BrainCircuit className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <strong>{pendingConsent} perfil(s)</strong> aguardam assinatura do Termo de Autorização de Monitoramento.
          </p>
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-primary/80 leading-relaxed">
          <strong>Privacidade e Conformidade:</strong> O BekAI não exerce controle invasivo sobre o
          uso de redes sociais, mas traça um perfil da qualidade do conteúdo consumido para
          identificar riscos à saúde mental e emocional, respeitando a legislação vigente e exigindo
          o consentimento expresso dos pais.
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary tracking-tight">
            Literacia Familiar
          </h2>
          <p className="text-muted-foreground mt-1">
            Acompanhe, entenda e oriente o comportamento digital.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => setReferralModalOpen(true)}
            className="gap-2 shadow-sm border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            disabled={!activeChild?.consent_accepted}
          >
            <Activity className="w-4 h-4" /> Conectar Profissional
          </Button>
          <Button
            onClick={() => setExportModalOpen(true)}
            className="gap-2 shadow-sm"
            disabled={!activeChild?.consent_accepted}
          >
            <Download className="w-4 h-4" /> Gerar Relatório
          </Button>
        </div>
      </div>

      <Tabs value={activeChildId} onValueChange={setActiveChildId} className="w-full">
        <TabsList className="mb-6">
          {children.map((child) => (
            <TabsTrigger
              key={child.id}
              value={child.id}
              className="min-w-[120px] flex items-center gap-2"
            >
              {child.name}
              {!child.consent_accepted && <AlertTriangle className="w-3 h-3 text-amber-500" />}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeChild && !activeChild.consent_accepted ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center max-w-2xl mx-auto mt-8 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-amber-900 mb-2">Autorização Legal Pendente</h2>
            <p className="text-amber-700 mb-6">
              Para iniciar o monitoramento do perfil de <strong>{activeChild.name}</strong>, é
              necessário aceitar o Termo de Autorização de Monitoramento Digital, conforme
              exigências da LGPD.
            </p>
            <Button
              onClick={() => setConsentModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
            >
              Revisar e Assinar Termo
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {activeChild && <MonitoringStatus child={activeChild} />}
              <SocialConnectionsPanel
                connections={connections}
                latestJob={latestSyncJob}
                onSync={handleSync}
                onStartOAuth={handleStartOAuth}
                onConnectManual={handleConnectManual}
                onDisconnect={handleDisconnect}
                syncing={syncing}
                busyConnectionId={busyConnectionId}
              />
              {activeChild && (
                <CounterbalancePanel childId={activeChild.id} childName={activeChild.name} />
              )}
              {activeChild && (
                <YouTubeAgentPanel childId={activeChild.id} childName={activeChild.name} />
              )}
              {activeChild && <BehavioralStratification events={events} />}
              <DigitalInfluenceMap events={events} />
              <div id="tour-scripts">
                <ParentalScriptsLibrary analysis={latestAnalysis} library={library} />
              </div>
            </div>

            <div className="space-y-6">
              <Card className="shadow-sm border-t-4 border-t-primary" id="tour-dq">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <TermTooltip term="Quociente Digital (DQ)" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">
                    {latestAnalysis?.dq_score || '--'}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </CardContent>
              </Card>

              <Card className="shadow-sm" id="tour-risk">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                    <TermTooltip term="Nível de Risco Expositivo" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {latestAnalysis ? (
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-sm font-semibold ${getRiskColor(latestAnalysis.risk_level)}`}
                    >
                      Risco {latestAnalysis.risk_level}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">Sem dados</span>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm bg-indigo-50/50 border-indigo-100">
                <CardHeader>
                  <CardTitle className="text-indigo-800 text-base flex items-center gap-2">
                    <BrainCircuit className="w-5 h-5" /> Insights de Literacia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-indigo-900 leading-relaxed">
                    {latestAnalysis?.insights_summary ||
                      'Nenhum insight consolidado no momento. Continue acompanhando os eventos para que o Agente BekAI gere recomendações.'}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Estado Operacional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Plano ativo</span>
                    <Badge variant="outline">
                      {activePlan?.status === 'active'
                        ? 'Em execucao'
                        : activePlan?.status === 'completed'
                          ? 'Concluido'
                          : activePlan?.status === 'pending'
                            ? 'Pendente'
                            : 'Nao gerado'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Relatorios gerados</span>
                    <span className="font-semibold">{reportHistory.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Eventos sincronizados</span>
                    <span className="font-semibold">{events.length}</span>
                  </div>
                  <div className="rounded-xl bg-muted/30 border p-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Ultimo relatorio
                    </p>
                    <p className="mt-1 font-medium text-foreground">
                      {latestReport?.title || 'Ainda nao gerado'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {latestReport
                        ? new Date(latestReport.created).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'Gere um relatorio para acompanhar a evolucao do caso.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </Tabs>

      <ReportExportModal
        child={activeChild}
        open={exportModalOpen}
        onOpenChange={setExportModalOpen}
      />
      {activeChild && (
        <ProfessionalReferralModal
          child={activeChild}
          open={referralModalOpen}
          onOpenChange={setReferralModalOpen}
        />
      )}
      {activeChild && (
        <ConsentModal
          child={activeChild}
          open={consentModalOpen}
          onOpenChange={setConsentModalOpen}
          onSuccess={loadData}
        />
      )}
    </div>
  )
}
