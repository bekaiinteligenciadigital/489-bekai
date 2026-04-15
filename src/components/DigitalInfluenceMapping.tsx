import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Target, ShieldCheck, Target as Mechanism, Loader2, Send, Activity } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function DigitalInfluenceMapping() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'result'>('idle')
  const { toast } = useToast()

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('processing')
    setTimeout(() => {
      setStatus('result')
      toast({
        title: 'Mapeamento Finalizado',
        description: 'Estratégias antagonistas geradas com sucesso.',
      })
    }, 2500)
  }

  const handleCuratorship = () => {
    toast({
      title: 'Workflow Híbrido Ativado',
      description: 'Enviado para verificação humana especializada.',
    })
    setStatus('idle')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-6">
        <h3 className="text-2xl font-serif font-bold text-primary flex items-center gap-2">
          <Target className="w-6 h-6 text-secondary" /> Mapeamento de Ecossistema Digital
        </h3>
        <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
          Ferramenta avançada para analisar canais e narrativas consumidas. O motor extrai o
          mecanismo psicológico de retenção e gera uma Narrativa Antagonista Positiva baseada em
          virtudes.
        </p>
      </div>

      {status === 'idle' && (
        <Card className="shadow-sm border-primary/20">
          <CardContent className="pt-6">
            <form onSubmit={handleAnalyze} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label>Perfil / Canal Alvo</Label>
                  <Input placeholder="Ex: @influenciador_x" required />
                </div>
                <div className="space-y-2">
                  <Label>Tema Central Mapeado</Label>
                  <Input placeholder="Ex: Desabafo solitário, Estilo de vida irreal" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Narrativa Ideológica Observada</Label>
                <Textarea
                  placeholder="Descreva brevemente a ideia que o perfil tenta vender..."
                  className="resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <Label>Padrão Psicológico</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaping">Vaping de Atenção</SelectItem>
                      <SelectItem value="comparacao">Comparação Ascendente</SelectItem>
                      <SelectItem value="niilismo">Niilismo Algorítmico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Emoção Estimulada</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ansiedade">Ansiedade</SelectItem>
                      <SelectItem value="furia">Fúria / Polarização</SelectItem>
                      <SelectItem value="apatia">Apatia / Conformismo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nível de Influência</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="healthy">Saudável</SelectItem>
                      <SelectItem value="neutral">Neutro</SelectItem>
                      <SelectItem value="noxious">Potencialmente Nocivo</SelectItem>
                      <SelectItem value="high_noxious">Altamente Nocivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="w-full shadow-md gap-2" size="lg">
                <Activity className="w-5 h-5" /> Analisar Mecanismo e Gerar Antagonista
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {status === 'processing' && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="py-20 flex flex-col items-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div>
              <p className="font-bold text-lg">Processando Ecossistema</p>
              <p className="text-sm text-muted-foreground mt-1">
                Extraindo ganchos emocionais e formulando contra-narrativas construtivas...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'result' && (
        <div className="space-y-6 animate-fade-in-up">
          <Card className="border-rose-200 bg-rose-50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-rose-800 text-lg flex items-center gap-2">
                <Mechanism className="w-5 h-5" /> Mecanismo Psicológico Identificado
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-rose-900 leading-relaxed">
              <strong>Intermitência de Recompensa & Comparação Social Ascendente:</strong> O perfil
              analisado utiliza picos de dopamina não naturais através da edição acelerada, gerando
              um "Vaping de Atenção". A exibição de padrões irreais promove insatisfação severa,
              incitando apatia perante a vida real e hostilidade contra o núcleo familiar que não
              reflete o falso ideal exibido.
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-emerald-800 text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Estratégia Narrativa Antagonista Positiva
              </CardTitle>
              <CardDescription className="text-emerald-700/80">
                Contraposição baseada em virtudes gerada pela IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-emerald-900 leading-relaxed">
              Para neutralizar a influência altamente nociva, o Agente Autônomo recomenda injetar
              conteúdos pautados na{' '}
              <strong>responsabilidade pessoal, espiritualidade cristã e propósito de vida</strong>.
              A estratégia envolve a substituição por canais que valorizem a{' '}
              <strong>disciplina, o respeito social e os vínculos de longo prazo</strong>. A meta
              não é o bloqueio agressivo, mas a exposição ao belo e à verdade, esvaziando o fascínio
              pelo conteúdo niilista.
            </CardContent>
          </Card>

          <Alert className="bg-indigo-50 border-indigo-200">
            <AlertTitle className="text-indigo-900 font-bold text-sm">
              Curadoria Híbrida Necessária
            </AlertTitle>
            <AlertDescription className="text-indigo-800 text-xs mt-1">
              Como protocolo de segurança da biblioteca, resultados gerados pela IA devem ser
              revisados. Ao enviar para curadoria, um especialista humano confirmará a validade
              desta análise.
            </AlertDescription>
            <Button
              onClick={handleCuratorship}
              className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto shadow-sm"
            >
              <Send className="w-4 h-4" /> Enviar para Curadoria Especializada
            </Button>
          </Alert>
        </div>
      )}
    </div>
  )
}
