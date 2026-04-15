import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, Sparkles, ArrowRight, Minus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useFamilyStore from '@/stores/useFamilyStore'
import { cn } from '@/lib/utils'

export const SUBSCRIPTION_PLANS = [
  {
    id: 'essencial_familia',
    name: 'Essencial Família',
    isDynamic: true,
    basePrice: 35.0,
    priceStr: '',
    priceLabel: 'por participante',
    period: '/mês',
    desc: 'Ideal para o acompanhamento educativo individualizado e rebalanceamento.',
    features: [
      '{CHILD_COUNT}',
      'Dashboard de Métricas de Evolução',
      'Acompanhamento de Aceitação Educativa',
      'Nível D.C.D. (Diálogo, Conexão e Direcionamento)',
      'Eficácia da Curadoria (OEE)',
    ],
  },
  {
    id: 'essencial_profissional',
    name: 'Essencial Profissional',
    isDynamic: false,
    basePrice: 50.0,
    priceStr: 'R$ 50,00',
    priceLabel: 'assinatura mensal',
    period: '/mês',
    desc: 'Mapeamento técnico de perfil digital e padrões de consumo (Ativo vs Passivo).',
    features: [
      'Acesso a Múltiplos Pacientes',
      'Dashboard Profissional Técnico',
      'Relatórios de Eficácia (OEE)',
      'Métricas Base de Influência',
      'Mapeamento de Indicadores Iniciais',
    ],
    popular: false,
  },
  {
    id: 'clinical_expert',
    name: 'BekAI Clinical Expert',
    isDynamic: false,
    basePrice: 150.0,
    priceStr: 'R$ 150,00',
    priceLabel: 'assinatura mensal',
    period: '/mês',
    desc: 'Suíte completa de Suporte à Decisão Clínica e mapeamento comportamental.',
    features: [
      'Tudo do Essencial Profissional',
      'Alertas Clínicos (Safety Flags)',
      'Racional da IA em Profundidade',
      'Integração com Biblioteca BDIC',
      'Gestão de Conduta e Notas Privadas',
    ],
    popular: true,
    highlightText: 'Para Especialistas',
  },
]

export default function Planos() {
  const { setPlan, essentialChildrenCount, setEssentialChildrenCount } = useFamilyStore()
  const navigate = useNavigate()

  const handleSelect = (planId: string, price: number) => {
    setPlan(planId, price)
    navigate('/pagamento')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const handleIncrement = () => {
    if (essentialChildrenCount < 10) {
      setEssentialChildrenCount(essentialChildrenCount + 1)
    }
  }

  const handleDecrement = () => {
    if (essentialChildrenCount > 1) {
      setEssentialChildrenCount(essentialChildrenCount - 1)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 relative overflow-hidden flex flex-col justify-center">
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10 animate-fade-in w-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-secondary font-bold tracking-wider uppercase text-sm">
            Planos de Assinatura
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
            Escolha o Nível de Apoio Necessário
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Selecione o plano adequado para famílias, profissionais com foco em triagem técnica, ou
            a suíte completa de suporte à decisão clínica para especialistas.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto gap-6 items-stretch pt-4 w-full">
          {SUBSCRIPTION_PLANS.map((p) => {
            const currentPrice = p.isDynamic ? p.basePrice * essentialChildrenCount : p.basePrice
            const priceStr = p.isDynamic ? formatPrice(currentPrice) : p.priceStr

            return (
              <Card
                key={p.id}
                className={cn(
                  'relative flex flex-col transition-all duration-500 border-2',
                  p.popular
                    ? 'border-secondary shadow-2xl md:-translate-y-2 md:scale-105 bg-gradient-to-b from-background to-secondary/10 z-10'
                    : 'border-border/50 hover:border-primary/30 hover:shadow-xl bg-background',
                )}
              >
                {p.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md whitespace-nowrap z-20">
                    <Sparkles className="w-3.5 h-3.5" /> {p.highlightText || 'Nível Recomendado'}
                  </div>
                )}

                <CardHeader className="text-center pb-6 border-b border-border/50">
                  <CardTitle className="text-xl lg:text-2xl font-bold text-primary">
                    {p.name}
                  </CardTitle>
                  <CardDescription className="h-12 mt-2 leading-relaxed text-xs lg:text-sm">
                    {p.desc}
                  </CardDescription>
                  <div className="mt-6 flex flex-col items-center justify-center gap-1">
                    {p.isDynamic && (
                      <span className="text-sm font-semibold text-muted-foreground">
                        {formatPrice(p.basePrice)} {p.priceLabel}
                      </span>
                    )}
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black text-foreground tracking-tight">
                        {priceStr}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">
                        {p.period}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 flex-1 px-6 lg:px-8 flex flex-col">
                  {p.isDynamic && (
                    <div className="mb-6 bg-muted/50 rounded-xl p-4 flex flex-col items-center gap-3 border border-border/50">
                      <span className="text-sm font-semibold text-foreground text-center">
                        Quantos filhos deseja acompanhar?
                      </span>
                      <div className="flex items-center gap-4 bg-background rounded-lg border shadow-sm p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleDecrement}
                          disabled={essentialChildrenCount <= 1}
                          className="h-8 w-8 hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-bold w-6 text-center">
                          {essentialChildrenCount}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleIncrement}
                          disabled={essentialChildrenCount >= 10}
                          className="h-8 w-8 hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <ul className="space-y-4 text-xs lg:text-sm font-medium text-muted-foreground mt-2">
                    {p.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <ShieldCheck
                          className={cn(
                            'w-5 h-5 shrink-0',
                            p.popular ? 'text-secondary' : 'text-primary',
                          )}
                        />
                        <span className="leading-tight text-left">
                          {feat === '{CHILD_COUNT}' ? 'NÚMERO FLEXÍVEL DE PARTICIPANTE' : feat}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <div className="p-6 lg:p-8 pt-0 mt-auto">
                  <Button
                    onClick={() => handleSelect(p.id, currentPrice)}
                    variant={p.popular ? 'default' : 'secondary'}
                    className={cn(
                      'w-full h-12 lg:h-14 font-bold text-sm lg:text-base gap-2 shadow-md hover:shadow-lg',
                      p.popular ? 'bg-primary hover:bg-primary/90 text-primary-foreground' : '',
                    )}
                  >
                    Assinar {p.name} <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
