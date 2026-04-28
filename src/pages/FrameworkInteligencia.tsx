import { useEffect, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookText, CheckCircle2, Loader2 } from 'lucide-react'
import { TermTooltip } from '@/components/ui/glossary-tooltip'
import { loadModuleProgress, saveModuleProgress } from '@/services/moduleProgress'

const CHAPTERS = ['cap1', 'cap2', 'cap3', 'cap4', 'cap5']

export default function FrameworkInteligencia() {
  const [readChapters, setReadChapters] = useState<string[]>([])
  const [loadingProgress, setLoadingProgress] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProgress = async () => {
      const progress = await loadModuleProgress('framework_inteligencia')
      const savedChapters = Array.isArray(progress.progressJson.readChapters)
        ? progress.progressJson.readChapters
        : []

      if (mounted) {
        setReadChapters(savedChapters)
        setLoadingProgress(false)
      }
    }

    fetchProgress()

    return () => {
      mounted = false
    }
  }, [])

  const markRead = (chapterId: string) => {
    setReadChapters((prev) => {
      const updated = prev.includes(chapterId) ? prev : [...prev, chapterId]
      void saveModuleProgress('framework_inteligencia', {
        completedItems: updated.length,
        totalItems: CHAPTERS.length,
        completed: updated.length === CHAPTERS.length,
        lastViewedKey: chapterId,
        progressJson: { readChapters: updated },
      })
      return updated
    })
  }

  const progress = Math.round((readChapters.length / CHAPTERS.length) * 100)

  if (loadingProgress) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-primary/70 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Carregando progresso do framework...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-fade-in">
      <div className="space-y-4 mt-6 border-b pb-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight flex items-center gap-4">
          <BookText className="w-10 h-10 text-secondary shrink-0" /> Framework de Inteligencia
          Digital
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
          Este framework contem os fundamentos educativos e operacionais focados em literacia
          midiatica e desenvolvimento cultural que baseiam o Agente Autonomo da plataforma BekAI.
        </p>
        <div className="flex items-center gap-4 pt-2 flex-wrap">
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Progresso de Leitura
              </span>
              <span className="text-xs font-bold text-primary">
                {readChapters.length}/{CHAPTERS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {readChapters.length > 0 && progress < 100 && (
            <Badge variant="outline" className="text-primary border-primary/20">
              Retome de onde parou
            </Badge>
          )}
          {progress === 100 && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluido
            </Badge>
          )}
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full space-y-4"
        defaultValue="cap1"
        onValueChange={(val) => {
          if (val) markRead(val)
        }}
      >
        <AccordionItem
          value="cap1"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap1') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap1') && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              Capitulo 1: Literacia Midiatica e Cidadania Digital
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <p>
              A educacao para a midia foca em desenvolver o pensamento critico dos jovens perante
              as recompensas intermitentes do ambiente digital, combatendo a desinformacao e a
              fadiga decisional atraves do consumo consciente.
            </p>
            <p>
              A compreensao da influencia algoritmica e essencial para promover a autonomia na
              escolha do conteudo e proteger o desenvolvimento intelectual.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="cap2"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap2') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap2') && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              Capitulo 2: Padroes de Influencia
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="text-foreground">Consumo Passivo (Vaping de Atencao):</strong>{' '}
                O cerebro capta e arquiva informacoes rasas de forma acelerada, sem filtro
                critico, gerando conformismo e letargia no mundo offline.
              </li>
              <li>
                <strong className="text-foreground">Comparacao Social Ascendente:</strong>{' '}
                Padroes irreais de vida e estetica promovem insatisfacao e comportamentos
                evitativos.
              </li>
              <li>
                <strong className="text-foreground">Bolhas de Polarizacao:</strong> Algoritmos que
                priorizam a furia e a indignacao para manter a retencao, moldando respostas hostis
                no comportamento do jovem.
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="cap3"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap3') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap3') && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              Capitulo 3: Protocolos de Curadoria e Rotina
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <p>
              <strong className="text-foreground">Objetivo Educativo:</strong> Reduzir a aceleracao
              mental e substituir referencias nocivas por referencias que promovam virtudes e
              proposito.
            </p>
            <p>
              <strong className="text-foreground">Acao Recomendada:</strong> Aplicacao do{' '}
              <em>Agente Autonomo</em> com a tecnica da Equivalencia Estetica para inserir no
              algoritmo conteudos de alta qualidade visual sobre desenvolvimento pessoal, esportes
              e responsabilidade social.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="cap4"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap4') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap4') && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              Capitulo 4: Scripts de Comunicacao Parental
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <p className="text-lg text-primary font-medium mb-2">
              A diretriz fundamental para pais e: <strong>Dialogo e Conexao sem Ruptura.</strong>
            </p>
            <p>
              <strong className="text-foreground">
                <TermTooltip term="Tecnica D.C.D." />:
              </strong>{' '}
              Ensinar o jovem a Duvidar da perfeicao digital, Criticar as narrativas de odio e
              Determinar seu proprio caminho offline.
            </p>
            <p>
              <strong className="text-foreground">Limites Inteligentes:</strong> O Pacto do Sono
              para proteger a regulacao e estabilizar a rotina de estudos.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="cap5"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap5') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap5') && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              )}
              Capitulo 5: Limites Educacionais (Disclaimer)
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
              <strong className="text-amber-900 block mb-2 text-lg">
                Avisos Eticos e Educacionais
              </strong>
              <p className="text-amber-800 leading-relaxed">
                O sistema atua como ferramenta de interpretacao e apoio educacional, e{' '}
                <strong>nunca substitui diagnostico ou intervencao medica</strong>. Esta ferramenta
                possui carater estritamente educativo e informativo.
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
