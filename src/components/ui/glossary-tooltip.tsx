import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Info } from 'lucide-react'

const glossary: Record<string, string> = {
  'Quociente Digital (DQ)':
    'O Quociente de Inteligência Digital (DQ) mede o nível de inteligência e resiliência digital da criança com base no histórico de exposições e respostas aos desafios na rede.',
  'DQ Score':
    'O Quociente de Inteligência Digital (DQ) mede o nível de inteligência e resiliência digital da criança com base no histórico de exposições e respostas aos desafios na rede.',
  'Nível de Risco Expositivo':
    'Avaliação algorítmica do impacto nocivo e tempo de exposição às plataformas de maior vulnerabilidade.',
  'Risco Expositivo':
    'Avaliação algorítmica do impacto nocivo e tempo de exposição às plataformas de maior vulnerabilidade.',
  Distorção:
    'Grau de desvio da percepção da realidade induzido por filtros, padrões de beleza inatingíveis ou narrativas extremistas.',
  'Mapeamento de Influência':
    'Processo não invasivo que analisa a qualidade das interações digitais para identificar potenciais riscos à saúde mental.',
  'Vaping de Atenção':
    'Consumo compulsivo e passivo de vídeos curtos, que gera fadiga decisional e reduz o tempo de atenção.',
  'Equivalência Estética':
    'Técnica de curadoria que substitui criadores nocivos por positivos utilizando a mesma linguagem visual e ritmo.',
  'Narrativa Antagonista':
    'Conteúdos focados em polarização e hostilidade para gerar engajamento através da indignação.',
  'Técnica D.C.D.':
    'Metodologia de diálogo parental: Duvidar da perfeição, Criticar narrativas de ódio e Determinar o próprio caminho.',
  BDIC: 'Base de Dados de Inteligência Clínica, fundamentando as diretrizes e curadorias da plataforma KAIRÓS.',
}

interface TermTooltipProps {
  term: string
  children?: React.ReactNode
}

export function TermTooltip({ term, children }: TermTooltipProps) {
  const definition =
    glossary[term] ||
    'Definição técnica sobre avaliação comportamental e mapeamento de influência digital.'

  return (
    <HoverCard>
      <HoverCardTrigger className="underline decoration-dashed decoration-primary/50 underline-offset-4 cursor-help flex items-center gap-1.5 w-fit hover:text-primary transition-colors">
        {children || term}
        <Info className="w-3.5 h-3.5 text-muted-foreground" />
      </HoverCardTrigger>
      <HoverCardContent className="w-80 shadow-xl border-primary/10" sideOffset={8}>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-primary">{term}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{definition}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
