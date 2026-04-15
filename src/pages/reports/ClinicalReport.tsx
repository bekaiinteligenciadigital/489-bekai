import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getReportData } from '@/services/reports'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Activity,
  Stethoscope,
  BookOpen,
  BrainCircuit,
  Scale,
  ShieldAlert,
  Lock,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'

export default function ClinicalReport() {
  const { childId } = useParams()
  const [data, setData] = useState<any>(null)
  const { user } = useAuth()
  const isProfessional = user?.role === 'professional'
  const isExpert = user?.active_plan === 'clinical_expert'
  const navigate = useNavigate()

  useEffect(() => {
    if (childId) {
      getReportData(childId).then(setData)
    }
  }, [childId])

  if (!isProfessional) {
    return (
      <div className="p-8 text-center max-w-2xl mx-auto mt-20 bg-rose-50 rounded-xl border border-rose-200">
        <Lock className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-rose-900 mb-2">Acesso Restrito (Uso Clínico)</h2>
        <p className="text-rose-700">
          Este relatório técnico destina-se exclusivamente a profissionais de saúde. Por favor,
          acesse com uma conta profissional vinculada ao paciente.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
        >
          Voltar
        </button>
      </div>
    )
  }

  if (!data)
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Compilando Sumário Técnico...
      </div>
    )

  const { child, analyses, riskProfiles, safetyFlags, library, clinicalPlans } = data
  const latestAnalysis = analyses[0]
  const latestProfile = riskProfiles[0]
  const latestPlan = clinicalPlans[0]
  const primaryLibrary =
    library?.filter(
      (l: any) =>
        l.clinical_status === 'Diretriz Clínica Principal' || l.clinical_status === 'Base Clínica',
    ) || []

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white min-h-screen print:p-0 print:m-0 font-sans text-slate-900 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start border-b-4 border-indigo-900 pb-6 mb-8 gap-6">
        <div>
          <div className="uppercase tracking-widest text-indigo-700 font-bold text-xs mb-3 flex items-center gap-2 bg-indigo-50 w-fit px-3 py-1 rounded">
            <img src={logoUrl} alt="BekAI" className="w-4 h-4 rounded-sm" />{' '}
            {isExpert
              ? 'Dossiê Diamante (Uso Profissional)'
              : 'Mapeamento Técnico (Uso Profissional)'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            {isExpert ? 'Suporte à Decisão Clínica' : 'Relatório de Perfil Digital'}
          </h1>
          <p className="text-lg text-slate-500 mt-2 font-medium">
            Dossiê Técnico de Literacia e Saúde Digital
          </p>
        </div>
        <div className="w-full sm:w-auto text-left sm:text-right bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-700">
            <strong>Paciente:</strong> {child?.name || 'N/A'}
          </p>
          <p className="text-sm text-slate-700 mt-1">
            <strong>Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p className="text-[10px] text-slate-400 mt-2 font-mono break-all">
            ID: {child?.id || '---'}
          </p>
        </div>
      </div>

      <section className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 page-break-inside-avoid">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Activity className="w-6 h-6 text-indigo-600 mb-2" />
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Score DQ Global
            </h3>
            <span className="text-3xl font-black text-slate-800">
              {latestAnalysis?.dq_score || '--'}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <ShieldAlert className="w-6 h-6 text-rose-500 mb-2" />
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Exposição (Risco)
            </h3>
            <span className="text-2xl font-bold text-rose-600 mt-1">
              {latestProfile?.exposure_score || 0}%
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Scale className="w-6 h-6 text-amber-500 mb-2" />
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Distorção / Instabilidade
            </h3>
            <span className="text-2xl font-bold text-amber-600 mt-1">
              {latestProfile?.distortion_score || 0}% / {latestProfile?.instability_score || 0}%
            </span>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <Stethoscope className="w-6 h-6 text-emerald-500 mb-2" />
            <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Fatores Protetivos
            </h3>
            <span className="text-2xl font-bold text-emerald-600 mt-1">
              {latestProfile?.protective_score || 0}%
            </span>
          </CardContent>
        </Card>
      </section>

      {isExpert ? (
        <>
          {safetyFlags?.length > 0 && (
            <section className="mb-12 page-break-inside-avoid">
              <h2 className="text-xl font-bold text-rose-900 border-b-2 border-rose-100 pb-2 mb-5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> Alertas Clínicos (Safety Flags)
              </h2>
              <div className="grid gap-3">
                {safetyFlags.map((flag: any) => (
                  <div
                    key={flag.id}
                    className="bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-start gap-3"
                  >
                    <div
                      className={`mt-0.5 shrink-0 px-2 py-1 text-[10px] uppercase font-bold rounded-md ${flag.level === 'critical' ? 'bg-rose-600 text-white' : 'bg-rose-200 text-rose-800'}`}
                    >
                      {flag.level}
                    </div>
                    <p className="text-sm text-rose-900 leading-relaxed font-medium">
                      {flag.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mb-12 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-indigo-950 border-b-2 border-indigo-100 pb-2 mb-5 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" /> Mapeamento de Indicadores
              Comportamentais (IA)
            </h2>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-lg text-sm text-slate-700 leading-relaxed shadow-sm">
              {latestProfile?.rationale_json ? (
                <div className="space-y-4">
                  {Object.entries(latestProfile.rationale_json).map(([key, val]: [string, any]) => (
                    <div key={key}>
                      <strong className="text-indigo-900 capitalize">
                        {key.replace(/_/g, ' ')}:
                      </strong>
                      <p className="mt-1 pl-3 border-l-2 border-indigo-200">{val}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Fundamentação técnica indisponível para este corte de dados.</p>
              )}
            </div>
          </section>

          <section className="mb-12 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-indigo-950 border-b-2 border-indigo-100 pb-2 mb-5 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" /> Diretrizes Clínicas Relacionadas
            </h2>
            <div className="grid gap-4">
              {primaryLibrary?.length > 0 ? (
                primaryLibrary.slice(0, 3).map((ref: any) => (
                  <div
                    key={ref.id}
                    className="border-l-4 border-l-indigo-500 border-y border-r border-slate-200 rounded-r-lg p-5 bg-white shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                      <h3 className="font-bold text-slate-800 text-base leading-tight">
                        {ref.title}
                      </h3>
                      <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded shadow-sm shrink-0 whitespace-nowrap">
                        {ref.evidence_level}
                      </span>
                    </div>
                    <div className="text-[11px] uppercase font-bold text-slate-400 mb-3 tracking-wider flex gap-3">
                      <span>Eixo: {ref.axis}</span>
                      <span>•</span>
                      <span className="text-indigo-600">Status: {ref.clinical_status}</span>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 pb-2">
                      {ref.summary}
                    </p>
                    {ref.content_link && (
                      <a
                        href={ref.content_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline inline-block mt-2"
                      >
                        Acessar Estudo Original
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded text-center">
                  Nenhuma evidência de nível diamante correlacionada no momento.
                </p>
              )}
            </div>
          </section>

          <section className="mb-12 page-break-inside-avoid">
            <h2 className="text-xl font-bold text-indigo-950 border-b-2 border-indigo-100 pb-2 mb-5">
              Conduta Sugerida (Plano de Ação)
            </h2>
            <div className="bg-indigo-900 border border-indigo-950 p-6 rounded-lg text-white shadow-md">
              <h3 className="font-bold text-indigo-200 mb-4 text-sm uppercase tracking-widest border-b border-indigo-800 pb-2">
                Estratégias para Suporte Clínico
              </h3>
              {latestPlan ? (
                <ul className="space-y-4">
                  {latestPlan.suggested_actions?.actions?.map((action: string, idx: number) => (
                    <li
                      key={idx}
                      className="text-sm text-indigo-50 flex items-start gap-3 bg-indigo-800/50 p-3 rounded"
                    >
                      <div className="bg-indigo-400 text-indigo-950 font-bold text-[10px] w-5 h-5 flex items-center justify-center rounded-full shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{action}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-indigo-300 italic text-center p-4">
                  Plano de intervenção pendente ou não submetido.
                </p>
              )}
            </div>
          </section>
        </>
      ) : (
        <section className="mb-12 page-break-inside-avoid print:hidden">
          <div className="bg-indigo-50 border border-indigo-200 p-8 rounded-xl text-center shadow-sm">
            <Lock className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-indigo-900 mb-2">
              Desbloqueie o BekAI Clinical Expert
            </h3>
            <p className="text-sm text-indigo-700 mb-6 max-w-lg mx-auto leading-relaxed">
              O plano Essencial Profissional fornece o mapeamento técnico acima. Para acessar
              Alertas Clínicos (Safety Flags), Mapeamento de Indicadores da IA, Diretrizes Clínicas
              e Planos de Ação Integrados, faça o upgrade para o BekAI Clinical Expert.
            </p>
            <Button
              asChild
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md px-8"
            >
              <Link to="/planos">Ver Planos de Assinatura</Link>
            </Button>
          </div>
        </section>
      )}

      <footer className="mt-16 pt-8 border-t-2 border-indigo-100 text-[10px] text-slate-500 text-justify leading-relaxed opacity-80">
        <p className="mb-3 uppercase tracking-widest font-bold text-indigo-900/60 text-center">
          BekAI - Inteligência Digital a Serviço da Saúde Mental
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
          <img src={logoUrl} alt="BekAI" className="w-8 h-8 grayscale opacity-60 rounded" />
          <p className="font-bold text-indigo-900 text-center sm:text-left text-xs m-0">
            Aviso Legal e Ético: Os dados apresentados destinam-se exclusivamente ao Suporte à
            Decisão Clínica. A interpretação final e a avaliação clínica são atos exclusivos do
            profissional de saúde.
          </p>
        </div>
        <p>
          <strong>Confidencialidade e Marco Legal:</strong> Este instrumento consiste em material de
          apoio e compilação algorítmica, não substituindo a avaliação clínica final tradicional. O
          tratamento de dados pessoais sensíveis do menor aderiu estritamente aos ditames do Art.
          14, § 1º, da Lei 13.709/2018 (LGPD), sendo gerado sob autorização legal prévia. Fica
          terminantemente vedada a sua difusão pública ou emprego secundário fora do escopo do
          tratamento contínuo do paciente, devendo o profissional recebedor zelar pelo sigilo
          preconizado por seu respectivo conselho de classe.
        </p>
      </footer>

      <div className="print:hidden fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50">
        <button
          onClick={() => window.print()}
          className="bg-indigo-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-2xl font-bold hover:bg-indigo-800 transition-all transform hover:scale-105 flex items-center gap-2 border-2 border-indigo-700"
        >
          <Stethoscope className="w-5 h-5" /> Exportar Relatório PDF
        </button>
      </div>
    </div>
  )
}
