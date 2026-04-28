import { useState, useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookText, CheckCircle2 } from 'lucide-react'
import { TermTooltip } from '@/components/ui/glossary-tooltip'

const CHAPTERS = ['cap1', 'cap2', 'cap3', 'cap4', 'cap5']
const STORAGE_KEY = 'bekai_framework_read'

export default function FrameworkInteligencia() {
  const [readChapters, setReadChapters] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
      return []
    }
  })

  const markRead = (chapterId: string) => {
    setReadChapters((prev) => {
      const updated = prev.includes(chapterId) ? prev : [...prev, chapterId]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  const progress = Math.round((readChapters.length / CHAPTERS.length) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-fade-in">
      <div className="space-y-4 mt-6 border-b pb-8">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight flex items-center gap-4">
          <BookText className="w-10 h-10 text-secondary shrink-0" /> Framework de Inteligência
          Digital
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
          Este framework contém os fundamentos educativos e operacionais focados em literacia
          midiática e desenvolvimento cultural que baseiam o Agente Autônomo da plataforma BekAI.
        </p>
        <div className="flex items-center gap-4 pt-2">
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progresso de Leitura</span>
              <span className="text-xs font-bold text-primary">{readChapters.length}/{CHAPTERS.length}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          {progress === 100 && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
            </Badge>
          )}
        </div>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full space-y-4"
        defaultValue="cap1"
        onValueChange={(val) => { if (val) markRead(val) }}
      >
        <AccordionItem
          value="cap1"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap1') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap1') && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              Capítulo 1: Literacia Midiática e Cidadania Digital
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <p>
              A educação para a mídia foca em desenvolver o pensamento crítico dos jovens perante as
              recompensas intermitentes do ambiente digital, combatendo a desinformação e a fadiga
              decisional através do consumo consciente.
            </p>
            <p>
              A compreensão da influência algorítmica é essencial para promover a autonomia na
              escolha do conteúdo e proteger o desenvolvimento intelectual.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="cap2"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap2') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap2') && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              Capítulo 2: Padrões de Influência
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <ul className="list-disc pl-6 space-y-3">
              <li>
                <strong className="text-foreground">Consumo Passivo (Vaping de Atenção):</strong> O
                cérebro capta e arquiva informações rasas de forma acelerada, sem filtro crítico,
                gerando conformismo e letargia no mundo offline.
              </li>
              <li>
                <strong className="text-foreground">Comparação Social Ascendente:</strong> Padrões
                irreais de vida e estética promovem insatisfação e comportamentos evitativos.
              </li>
              <li>
                <strong className="text-foreground">Bolhas de Polarização:</strong> Algoritmos que
                priorizam a fúria e a indignação para manter a retenção, moldando respostas hostis
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
              {readChapters.includes('cap3') && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              Capítulo 3: Protocolos de Curadoria e Rotina
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <p>
              <strong className="text-foreground">Objetivo Educativo:</strong> Reduzir a aceleração
              mental e substituir referências nocivas por referências que promovam virtudes e
              propósito.
            </p>
            <p>
              <strong className="text-foreground">Ação Recomendada:</strong> Aplicação do{' '}
              <em>Agente Autônomo</em> com a técnica da Equivalência Estética — inserir no algoritmo
              conteúdos de alta qualidade visual sobre desenvolvimento pessoal, esportes e
              responsabilidade social.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="cap4"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap4') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap4') && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              Capítulo 4: Scripts de Comunicação Parental
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <p className="text-lg text-primary font-medium mb-2">
              A diretriz fundamental para pais é: <strong>Diálogo e Conexão sem Ruptura.</strong>
            </p>
            <p>
              <strong className="text-foreground">
                <TermTooltip term="Técnica D.C.D." />:
              </strong>{' '}
              Ensinar o jovem a Duvidar da perfeição digital, Criticar as narrativas de ódio e
              Determinar seu próprio caminho offline.
            </p>
            <p>
              <strong className="text-foreground">Limites Inteligentes:</strong> O Pacto do Sono
              (remover telas do quarto 1 hora antes de dormir) para proteger a regulação e
              estabilizar a rotina de estudos.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          value="cap5"
          className={`border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors ${readChapters.includes('cap5') ? 'border-emerald-200' : ''}`}
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            <span className="flex items-center gap-3">
              {readChapters.includes('cap5') && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
              Capítulo 5: Limites Educacionais (Disclaimer)
            </span>
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground leading-relaxed pb-6 space-y-4 pt-2">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl shadow-sm">
              <strong className="text-amber-900 block mb-2 text-lg">
                Avisos Éticos e Educacionais
              </strong>
              <p className="text-amber-800 leading-relaxed">
                O sistema atua como ferramenta de interpretação e apoio educacional, e{' '}
                <strong>nunca substitui diagnóstico ou intervenção médica</strong>. Esta ferramenta
                possui caráter estritamente educativo e informativo, não substituindo o
                acompanhamento de profissionais de saúde (psicólogos/psiquiatras).
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
