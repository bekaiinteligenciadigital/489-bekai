import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import ParentalReport from './pages/reports/ParentalReport'
import ClinicalReport from './pages/reports/ClinicalReport'
import MonthlyDossier from './pages/reports/MonthlyDossier'
import Index from './pages/Index'
import NovaAnalise from './pages/NovaAnalise'
import ParentDashboard from './pages/parent/ParentDashboard'
import Resultado from './pages/Resultado'
import PlanoDeAcao from './pages/PlanoDeAcao'
import Biblioteca from './pages/Biblioteca'
import Configuracoes from './pages/Configuracoes'
import Landing from './pages/Landing'
import Investidores from './pages/Investidores'
import CadastroCliente from './pages/CadastroCliente'
import CadastroProfissional from './pages/CadastroProfissional'
import Profissionais from './pages/Profissionais'
import Planos from './pages/Planos'
import Pagamento from './pages/Pagamento'
import SetupJovem from './pages/SetupJovem'
import NotFound from './pages/NotFound'
import ScannerIndex from './pages/scanner/ScannerIndex'
import ScannerResultado from './pages/scanner/ScannerResultado'
import ScannerPlano from './pages/scanner/ScannerPlano'
import ScannerEvolucao from './pages/scanner/ScannerEvolucao'
import ScannerGuia from './pages/scanner/ScannerGuia'
import FrameworkInteligencia from './pages/FrameworkInteligencia'
import AgenteAutonomo from './pages/AgenteAutonomo'
import AdminDashboard from './pages/admin/AdminDashboard'
import ReportLibrary from './pages/ReportLibrary'
import Manual from './pages/Manual'
import LinkProfissional from './pages/LinkProfissional'
import { FamilyProvider } from './stores/useFamilyStore'
import { AuthProvider } from './hooks/use-auth'
import SpecialistDashboard from './pages/specialist/SpecialistDashboard'
import ProfessionalDemo from './pages/ProfessionalDemo'
import ClinicalDemo from './pages/ClinicalDemo'
import { TourProvider } from './components/tour/TourContext'
import { TourUI } from './components/tour/TourUI'
import PagamentoSucesso from './pages/PagamentoSucesso'
import SubscriptionDashboard from './pages/subscription/SubscriptionDashboard'
import { RequireActiveSubscription } from './components/RequireActiveSubscription'
import { PendingInviteLinker } from './components/PendingInviteLinker'

const App = () => (
  <AuthProvider>
    <FamilyProvider>
      <TourProvider>
        <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <TourUI />
            <PendingInviteLinker />
            <Routes>
              {/* Landing and Onboarding Flow Outside Layout */}
              <Route path="/" element={<Landing />} />
              <Route path="/investidores" element={<Investidores />} />
              <Route path="/cadastro-cliente" element={<CadastroCliente />} />
              <Route path="/reports/parental/:childId" element={<ParentalReport />} />
              <Route path="/reports/clinical/:childId" element={<ClinicalReport />} />
              <Route path="/reports/monthly/:childId" element={<MonthlyDossier />} />
              <Route path="/cadastro-profissional" element={<CadastroProfissional />} />
              <Route path="/profissionais" element={<Profissionais />} />
              <Route path="/planos" element={<Planos />} />
              <Route path="/pagamento" element={<Pagamento />} />
              <Route path="/setup-jovem" element={<SetupJovem />} />
              <Route path="/demo/professional" element={<ProfessionalDemo />} />
              <Route path="/clinical-demo" element={<ClinicalDemo />} />
              <Route path="/pagamento/sucesso" element={<PagamentoSucesso />} />

              {/* App Dashboard & Features */}
              <Route element={<Layout />}>
                <Route element={<RequireActiveSubscription />}>
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/dashboard/reports" element={<ReportLibrary />} />
                  <Route path="/analise" element={<NovaAnalise />} />
                  <Route path="/diagnostico" element={<NovaAnalise />} />
                  <Route path="/perfil" element={<NovaAnalise />} />
                  <Route path="/resultado" element={<Resultado />} />
                  <Route path="/mapeamento-riscos" element={<Resultado />} />
                  <Route path="/plano" element={<PlanoDeAcao />} />
                  <Route path="/agente-autonomo" element={<AgenteAutonomo />} />
                  <Route path="/ativacao" element={<PlanoDeAcao />} />
                  <Route path="/biblioteca" element={<Biblioteca />} />
                  <Route path="/rebalanceamento" element={<Biblioteca />} />
                  <Route path="/monitoramento" element={<ParentDashboard />} />
                  <Route path="/config" element={<Configuracoes />} />
                  <Route path="/scanner" element={<ScannerIndex />} />
                  <Route path="/scanner/resultado" element={<ScannerResultado />} />
                  <Route path="/scanner/plano" element={<ScannerPlano />} />
                  <Route path="/scanner/evolucao" element={<ScannerEvolucao />} />
                  <Route path="/scanner/guia" element={<ScannerGuia />} />
                  <Route path="/framework-inteligencia" element={<FrameworkInteligencia />} />
                  <Route path="/manual" element={<Manual />} />
                  <Route path="/admin/growth" element={<AdminDashboard />} />
                  <Route path="/specialist/dashboard" element={<SpecialistDashboard />} />
                  <Route path="/parent/dashboard" element={<ParentDashboard />} />
                  <Route path="/vincular-profissional" element={<LinkProfissional />} />
                </Route>
                <Route path="/dashboard/subscription" element={<SubscriptionDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </TourProvider>
    </FamilyProvider>
  </AuthProvider>
)

export default App
