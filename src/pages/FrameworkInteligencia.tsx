import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BookText } from 'lucide-react'
import { TermTooltip } from '@/components/ui/glossary-tooltip'

export default function FrameworkInteligencia() {
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
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="cap1">
        <AccordionItem
          value="cap1"
          className="border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors"
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            Capítulo 1: Literacia Midiática e Cidadania Digital
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
          className="border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors"
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            Capítulo 2: Padrões de Influência
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
          className="border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors"
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            Capítulo 3: Protocolos de Curadoria e Rotina
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
          className="border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors"
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            Capítulo 4: Scripts de Comunicação Parental
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
          className="border rounded-2xl px-6 bg-background shadow-sm hover:border-primary/30 transition-colors"
        >
          <AccordionTrigger className="font-bold text-primary hover:no-underline py-5 text-xl">
            Capítulo 5: Limites Educacionais (Disclaimer)
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
