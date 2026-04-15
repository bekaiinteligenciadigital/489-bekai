import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReportData } from '@/services/reports'
import { Button } from '@/components/ui/button'
import {
  Activity,
  ShieldCheck,
  Printer,
  Calendar,
  TrendingUp,
  BrainCircuit,
  Info,
} from 'lucide-react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { updateLastReport } from '@/services/parent'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'

export default function MonthlyDossier() {
  const { childId } = useParams()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (childId) {
      getReportData(childId).then((res) => {
        setData(res)
        updateLastReport(childId).catch(console.error)
      })
    }
  }, [childId])

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse mt-20">
        Compilando Dossiê Mensal...
      </div>
    )
  }

  const { child, analyses, riskProfiles, digitalEvents } = data
  const latestAnalysis = analyses[0]
  const latestProfile = riskProfiles[0]
  const oldestProfile = riskProfiles[riskProfiles.length - 1]

  const radarData = [
    { subject: 'Exposição', value: latestProfile?.exposure_score || 0 },
    { subject: 'Distorção', value: latestProfile?.distortion_score || 0 },
    { subject: 'Instabilidade', value: latestProfile?.instability_score || 0 },
    { subject: 'Agressividade', value: (latestProfile?.instability_score || 0) * 0.7 },
    { subject: 'Proteção', value: latestProfile?.protective_score || 0 },
  ]

  const topPlatforms = digitalEvents.reduce((acc: any, ev: any) => {
    acc[ev.platform] = (acc[ev.platform] || 0) + 1
    return acc
  }, {})
  const sortedPlatforms = Object.entries(topPlatforms)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 3)

  const evolutionText = () => {
    if (!oldestProfile || oldestProfile.id === latestProfile?.id)
      return 'Estável. Dados insuficientes para comparação de longo prazo.'
    const diff = (latestProfile?.exposure_score || 0) - (oldestProfile?.exposure_score || 0)
    if (diff > 5) return 'Aumento do risco expositivo em relação ao período inicial.'
    if (diff < -5) return 'Redução positiva do risco expositivo. Hábitos protetivos fortalecidos.'
    return 'Padrão de exposição e risco estável neste ciclo.'
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 bg-white min-h-screen print:p-0 print:m-0 font-sans text-slate-900 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-8 mb-10 gap-6">
        <div>
          <div className="uppercase tracking-widest text-slate-400 font-bold text-xs mb-2 flex items-center gap-2">
            <img src={logoUrl} alt="BekAI" className="w-5 h-5 rounded-sm" /> BekAI - Dossiê Mensal
            de Literacia
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Relatório de Acompanhamento
          </h1>
          <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Ciclo Referência:{' '}
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="w-full sm:w-auto text-left sm:text-right bg-slate-50 p-4 rounded-lg border border-slate-100 print:border-none print:p-0">
          <p className="text-sm text-slate-700">
            <strong>Perfil Monitorado:</strong> {child?.name || 'N/A'}
          </p>
          <p className="text-sm text-slate-700 mt-1">
            <strong>Data de Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-start sm:justify-end gap-1">
            <Activity className="w-3 h-3" /> Status:{' '}
            {child?.monitoring_status === 'active' ? 'Ativo' : 'Inativo'}
          </p>
        </div>
      </div>

      {/* Highlights Grid */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-6 page-break-inside-avoid">
        <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl text-center">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">
            Score de Qualidade (DQ)
          </h3>
          <span className="text-4xl font-black text-indigo-900">
            {latestAnalysis?.dq_score || '--'}
          </span>
          <p className="text-xs text-slate-500 mt-2">Indicador global de saúde digital</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl text-center">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">
            Risco Expositivo
          </h3>
          <span
            className={`text-3xl font-bold mt-1 block ${
              latestAnalysis?.risk_level === 'Critical'
                ? 'text-rose-600'
                : latestAnalysis?.risk_level === 'High'
                  ? 'text-orange-500'
                  : latestAnalysis?.risk_level === 'Medium'
                    ? 'text-amber-500'
                    : 'text-emerald-500'
            }`}
          >
            {latestAnalysis?.risk_level || 'Baixo'}
          </span>
          <p className="text-xs text-slate-500 mt-2">Nível de alerta atual</p>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl text-center flex flex-col items-center justify-center">
          <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-2">
            Principais Canais
          </h3>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {sortedPlatforms.length > 0 ? (
              sortedPlatforms.map(([plat]: any) => (
                <span
                  key={plat}
                  className="bg-white border border-slate-200 px-3 py-1 rounded-full text-sm font-medium text-slate-700 shadow-sm"
                >
                  {plat}
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-sm">Sem dados</span>
            )}
          </div>
        </div>
      </section>

      {/* Radar & Evolution */}
      <section className="mb-12 grid md:grid-cols-2 gap-10 page-break-inside-avoid items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" /> Radar de Interesses e Riscos
          </h2>
          <div className="h-[300px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  fill="#6366f1"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2 italic">
            Distribuição percentual das matrizes de risco (escala 0-100).
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Evolução Comportamental
            </h2>
            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-lg">
              <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                {evolutionText()}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-600" /> Síntese Algorítmica
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {latestAnalysis?.insights_summary ||
                'Sem insights suficientes neste período. O modelo necessita de mais amostragem de dados para inferir padrões sólidos de comportamento.'}
            </p>
          </div>
        </div>
      </section>

      {/* Clinical Legend */}
      <section className="mb-10 page-break-inside-avoid mt-16 pt-8 border-t border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-400" /> Legenda Técnica
        </h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-xs text-slate-600">
          <div>
            <strong className="text-slate-800">Quociente Digital (DQ):</strong> Métrica global de
            proficiência, equilíbrio e segurança no consumo de mídias digitais. Valores mais altos
            indicam maior letramento e menor vulnerabilidade.
          </div>
          <div>
            <strong className="text-slate-800">Risco Expositivo:</strong> Avaliação agregada da
            suscetibilidade do menor a conteúdos prejudiciais, contato com estranhos ou
            superexposição de imagem pessoal.
          </div>
          <div>
            <strong className="text-slate-800">Distorção:</strong> Mede o impacto de conteúdos que
            alteram a percepção da realidade, como filtros excessivos, narrativas irreais de sucesso
            ou padrões estéticos inatingíveis.
          </div>
          <div>
            <strong className="text-slate-800">Score de Proteção:</strong> Indica a presença de
            hábitos saudáveis, como engajamento em conteúdos educativos, limites de tempo e
            interação familiar positiva.
          </div>
        </div>
      </section>

      {/* Footer / Signature Block */}
      <footer className="mt-16 pt-8 border-t-2 border-slate-900 text-xs text-slate-500 leading-relaxed flex flex-col sm:flex-row justify-between gap-6 opacity-80 page-break-inside-avoid">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <img src={logoUrl} alt="BekAI" className="w-5 h-5 grayscale rounded-sm" />
            <p className="font-bold text-slate-800 uppercase tracking-widest m-0">BekAI Systems</p>
          </div>
          <p>
            Este dossiê é gerado automaticamente como ferramenta de{' '}
            <strong>Suporte à Decisão Clínica</strong> e letramento digital, com base no
            processamento de linguagem natural e análise de metadados. Não substitui o
            acompanhamento psicológico ou psiquiátrico presencial. O monitoramento foi autorizado
            digitalmente por {child?.consent_signature_name || 'Responsável Legal'} em{' '}
            {child?.consent_timestamp
              ? new Date(child.consent_timestamp).toLocaleDateString('pt-BR')
              : 'Data N/A'}
            .
          </p>
        </div>
        <div className="shrink-0 text-left sm:text-right">
          <div className="w-48 border-b border-slate-400 mb-2 pb-8"></div>
          <p className="uppercase font-bold tracking-wider">
            {child?.consent_signature_name || 'Responsável Legal'}
          </p>
          <p>Ciente e de Acordo</p>
        </div>
      </footer>

      {/* Print Button */}
      <div className="print:hidden fixed bottom-8 right-8 z-50">
        <Button
          onClick={() => window.print()}
          size="lg"
          className="rounded-full shadow-2xl font-bold gap-2 text-base h-14 px-8"
        >
          <Printer className="w-5 h-5" /> Salvar como PDF
        </Button>
      </div>
    </div>
  )
}
