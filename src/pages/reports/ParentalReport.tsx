import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getReportData } from '@/services/reports'
import { Card, CardContent } from '@/components/ui/card'
import { Info, HeartHandshake, AlertTriangle, PlayCircle, BookOpen } from 'lucide-react'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'

export default function ParentalReport() {
  const { childId } = useParams()
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (childId) {
      getReportData(childId).then(setData)
    }
  }, [childId])

  if (!data)
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Construindo Relatório de Perfil Digital...
      </div>
    )

  const { child, analyses, digitalEvents, scripts, library } = data
  const latestAnalysis = analyses[0]

  const translateRisk = (level: string) => {
    if (!level) return 'Pendente de Análise'
    const map: Record<string, string> = {
      Low: 'Baixo',
      Medium: 'Médio',
      High: 'Alto',
      Critical: 'Crítico',
    }
    return map[level] || level
  }

  const complementaryLibrary =
    library?.filter((l: any) => l.clinical_status === 'Camada Complementar') || []

  // age calculation from birth_date
  let age = 'N/A'
  if (child?.birth_date) {
    const bd = new Date(child.birth_date)
    const ageDifMs = Date.now() - bd.getTime()
    const ageDate = new Date(ageDifMs)
    age = Math.abs(ageDate.getUTCFullYear() - 1970).toString()
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white min-h-screen print:p-0 print:m-0 animate-fade-in text-slate-800">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end border-b-2 border-primary pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img src={logoUrl} alt="BekAI" className="w-8 h-8 rounded-sm" />
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-primary">
              Relatório de Perfil Digital (Nível Prata)
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            Mapeamento de Padrões de Consumo para Famílias
          </p>
        </div>
        <div className="text-left md:text-right bg-primary/5 p-3 rounded-md border border-primary/10">
          <p className="text-sm font-bold text-primary">
            Emissão: {new Date().toLocaleDateString('pt-BR')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Perfil Curado: <strong>{child?.name || 'Não Identificado'}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Idade Estimada: <strong>{age} anos</strong>
          </p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-5 rounded-lg mb-8 flex flex-col sm:flex-row items-start gap-4 text-amber-900 shadow-sm relative overflow-hidden">
        <img
          src={logoUrl}
          alt="BekAI"
          className="absolute right-[-10px] top-[-10px] w-24 h-24 opacity-10 pointer-events-none grayscale"
        />
        <Info className="w-6 h-6 shrink-0 text-amber-600 mt-0.5 relative z-10" />
        <p className="text-sm leading-relaxed relative z-10">
          <strong>Aviso de Literacia:</strong> Este documento possui caráter educativo e formativo,
          com foco no letramento midiático familiar. Ele sumariza tendências de exposição a
          algoritmos com linguagem acessível e oferece <strong>Suporte à Decisão Clínica</strong>,
          mas não substitui a avaliação presencial por profissionais de saúde.
        </p>
      </div>

      <section className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-primary mb-5 flex items-center gap-2 border-b pb-2">
          <PlayCircle className="w-6 h-6 text-secondary" /> Perfil de Consumo
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <Card className="shadow-none border-slate-200 bg-slate-50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">
                Ecossistema Digital
              </h3>
              <div className="flex flex-wrap gap-2">
                {child?.platforms?.map((p: string) => (
                  <span
                    key={p}
                    className="bg-white border px-2.5 py-1.5 rounded-md text-sm text-slate-800 shadow-sm font-medium"
                  >
                    {p}
                  </span>
                )) || (
                  <span className="text-sm text-slate-500">Nenhuma plataforma registrada.</span>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-none border-slate-200 bg-slate-50">
            <CardContent className="p-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wider">
                Nível de Risco Identificado
              </h3>
              <span className="inline-block bg-primary text-primary-foreground px-4 py-1.5 rounded-full font-bold text-sm shadow-sm">
                Risco Atual: {translateRisk(latestAnalysis?.risk_level)}
              </span>
              <p className="text-xs text-slate-500 mt-3">
                {latestAnalysis?.insights_summary ||
                  'Métrica baseada na proporção de conteúdos de fricção vs. orgânicos consumidos recentemente.'}
              </p>
            </CardContent>
          </Card>
        </div>

        {digitalEvents.length > 0 && (
          <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wider">
              Últimos Interesses Observados
            </h3>
            <ul className="space-y-3">
              {digitalEvents.slice(0, 4).map((evt: any) => (
                <li
                  key={evt.id}
                  className="text-sm text-slate-600 flex flex-col sm:flex-row sm:items-start gap-2 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-bold text-primary w-24 shrink-0 bg-primary/5 px-2 py-0.5 rounded text-center sm:text-left">
                    {evt.platform}
                  </span>
                  <span className="leading-relaxed">{evt.content_summary}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {complementaryLibrary.length > 0 && (
        <section className="mb-10 page-break-inside-avoid">
          <h2 className="text-2xl font-bold text-primary mb-5 flex items-center gap-2 border-b pb-2">
            <BookOpen className="w-6 h-6 text-indigo-500" /> Resumo de Evidências (Camada
            Complementar)
          </h2>
          <div className="bg-indigo-50/50 border border-indigo-100 p-5 rounded-lg">
            <p className="text-sm text-indigo-900 mb-4 leading-relaxed">
              Separamos diretrizes científicas simplificadas que ajudam a entender o impacto da
              mídia no comportamento, embasando as atitudes preventivas em casa.
            </p>
            <div className="space-y-4">
              {complementaryLibrary.slice(0, 3).map((lib: any) => (
                <div
                  key={lib.id}
                  className="bg-white p-4 rounded-md border border-indigo-50 shadow-sm"
                >
                  <h4 className="font-bold text-indigo-800 text-sm mb-1">{lib.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{lib.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mb-10 page-break-inside-avoid">
        <h2 className="text-2xl font-bold text-primary mb-5 flex items-center gap-2 border-b pb-2">
          <HeartHandshake className="w-6 h-6 text-emerald-600" /> Scripts Parentais Recomendados
        </h2>
        <div className="grid gap-5">
          {scripts?.length > 0 ? (
            scripts.map((s: any) => (
              <Card key={s.id} className="shadow-sm border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-5 sm:p-6">
                  <h3 className="font-bold text-emerald-900 mb-2 text-lg">{s.title}</h3>
                  <p className="text-sm text-emerald-800/80 mb-4 bg-white p-2 rounded border border-emerald-100 italic">
                    <strong>Momento ideal:</strong> {s.context}
                  </p>
                  <div className="text-sm text-slate-700 leading-relaxed">
                    <span className="font-bold text-emerald-700 block mb-1 uppercase tracking-wider text-xs">
                      Como Abordar:
                    </span>
                    <p className="pl-3 border-l-2 border-emerald-400">{s.script_text}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-xl">
              <p className="text-sm text-slate-500">
                O sistema ainda está coletando informações suficientes para formular diálogos
                guiados altamente personalizados. Retorne após o preenchimento de novas avaliações.
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="mt-16 pt-8 border-t-2 border-slate-100 text-xs text-slate-500 text-justify leading-relaxed">
        <p className="mb-3 text-center uppercase font-bold tracking-widest text-slate-400">
          Plataforma BekAI • Guardião Digital Familiar
        </p>
        <p>
          <strong>Adequação à LGPD:</strong> O processamento de dados do menor de idade refletido
          neste relatório é realizado com base no consentimento explícito e sob a gestão de seu
          responsável legal. A plataforma não comercializa estas informações a terceiros.
        </p>
      </footer>

      <div className="print:hidden fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50">
        <button
          onClick={() => window.print()}
          className="bg-primary text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-2xl font-bold hover:bg-primary/90 transition-all transform hover:scale-105 flex items-center gap-2"
        >
          Imprimir / Baixar PDF
        </button>
      </div>
    </div>
  )
}
