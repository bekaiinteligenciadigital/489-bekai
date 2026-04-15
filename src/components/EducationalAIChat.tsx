import { useState, useRef, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, User, Send, ShieldAlert, Sparkles, Loader2 } from 'lucide-react'
import { chatWithAssistant } from '@/services/ai'
import useFamilyStore from '@/stores/useFamilyStore'

type Message = {
  role: 'user' | 'ai'
  text: string
  loading?: boolean
}

export function EducationalAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { aiResults, childrenProfiles, pendingAnalysis } = useFamilyStore()

  const child = childrenProfiles.find((c) => c.id === aiResults.analyzedChildId)

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: 'Olá! Sou o Assistente Educacional do Guardião Digital. Posso te ajudar a interpretar os dados de literacia midiática, entender o perfil de influência digital do seu filho e encontrar estratégias de curadoria saudável. O que você gostaria de saber?',
    },
  ])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userText = input.trim()
    setInput('')

    // Adiciona mensagem do usuário
    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    setIsTyping(true)

    // Adiciona placeholder de loading
    setMessages((prev) => [...prev, { role: 'ai', text: '', loading: true }])

    try {
      // Monta histórico para a API (apenas user/assistant, sem loading)
      const history = messages
        .filter((m) => !m.loading)
        .map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        }))
      history.push({ role: 'user', content: userText })

      // Contexto do usuário para personalizar a resposta
      const context = {
        childName: child?.name,
        platforms: pendingAnalysis?.platforms ?? child?.platforms,
        overallRisk: aiResults.analysisResult?.overallRisk,
      }

      const response = await chatWithAssistant(history, context)

      // Substitui o placeholder pelo texto real
      setMessages((prev) => {
        const updated = [...prev]
        const loadingIdx = updated.findLastIndex((m) => m.loading)
        if (loadingIdx !== -1) {
          updated[loadingIdx] = { role: 'ai', text: response, loading: false }
        }
        return updated
      })
    } catch (err: any) {
      const errorMsg = err?.message?.includes('VITE_GROQ_API_KEY')
        ? 'API Key não configurada. Adicione VITE_GROQ_API_KEY no arquivo .env do projeto. Obtenha gratuitamente em console.groq.com/keys'
        : 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.'

      setMessages((prev) => {
        const updated = [...prev]
        const loadingIdx = updated.findLastIndex((m) => m.loading)
        if (loadingIdx !== -1) {
          updated[loadingIdx] = { role: 'ai', text: errorMsg, loading: false }
        }
        return updated
      })
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-24 right-6 rounded-full w-14 h-14 shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white z-50 border-4 border-background"
          size="icon"
          title="Assistente Educacional IA"
        >
          <Sparkles className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full z-[100] border-l-0 sm:border-l p-0">
        <div className="p-6 pb-4 border-b bg-indigo-50/50">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-indigo-900">
              <Bot className="w-5 h-5 text-indigo-600" /> Assistente Educacional
            </SheetTitle>
            <SheetDescription>
              Interpretação de influência digital e literacia midiática
              {child && ` — ${child.name}`}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 py-3">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-md text-xs text-amber-900 shadow-sm">
            <div className="flex gap-2 items-start">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Aviso Importante:</strong> Ferramenta estritamente educativa. Não substitui
                diagnóstico ou acompanhamento de profissionais de saúde.
              </p>
            </div>
          </div>
        </div>

        {/* Contexto ativo */}
        {(child || aiResults.analysisResult) && (
          <div className="px-6 pb-2">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 text-xs text-indigo-700 flex flex-wrap gap-2">
              {child && <span className="bg-indigo-100 px-2 py-0.5 rounded">👤 {child.name}</span>}
              {aiResults.analysisResult && (
                <span className="bg-indigo-100 px-2 py-0.5 rounded">
                  🎯 Risco {aiResults.analysisResult.overallRisk}
                </span>
              )}
              {pendingAnalysis?.platforms?.map((p) => (
                <span key={p} className="bg-indigo-100 px-2 py-0.5 rounded">{p}</span>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'ai' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl text-sm leading-relaxed max-w-[85%] shadow-sm ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-muted/60 border rounded-tl-none'
                  }`}
                >
                  {m.loading ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="text-xs animate-pulse">Assistente digitando...</span>
                    </div>
                  ) : (
                    <>
                      {m.text}
                      {m.role === 'ai' && !m.loading && (
                        <div className="mt-3 pt-2 border-t border-indigo-200/30 text-[10px] font-medium opacity-70">
                          Apenas profissionais de saúde estão aptos a emitir opiniões clínicas.
                        </div>
                      )}
                    </>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Sugestões rápidas */}
        {messages.length <= 1 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Como interpretar o score de risco?',
                'O que é Substituição Intencional?',
                'Como usar o Plano de Ação?',
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q)
                  }}
                  className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-background border-t">
          <div className="flex gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Pergunte sobre as métricas..."
              className="bg-muted/50 border-border/50"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isTyping || !input.trim()}
            >
              {isTyping ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
