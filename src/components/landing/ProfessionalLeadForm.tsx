import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { createLead } from '@/services/leads'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import { Stethoscope } from 'lucide-react'

const leadSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  clinic: z.string().optional(),
  message: z.string().optional(),
})

type LeadFormValues = z.infer<typeof leadSchema>

export function ProfessionalLeadForm() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: '',
      email: '',
      clinic: '',
      message: '',
    },
  })

  const onSubmit = async (data: LeadFormValues) => {
    setIsLoading(true)
    try {
      const combinedMessage = `Clínica/Instituição: ${data.clinic || 'Não informada'}\n\nMensagem:\n${data.message || ''}`

      await createLead({
        name: data.name,
        email: data.email,
        interest_type: 'professional',
        message: combinedMessage,
      })

      toast({
        title: 'Sucesso',
        description:
          'Solicitação enviada com sucesso. A equipe do BekAI entrará em contato em breve.',
      })
      form.reset()
    } catch (error) {
      const fieldErrors = extractFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) {
        Object.entries(fieldErrors).forEach(([field, msg]) => {
          if (field in form.getValues()) {
            form.setError(field as any, { message: msg })
          }
        })
      } else {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível enviar sua solicitação. Tente novamente.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-24 px-4 bg-slate-900 text-slate-100 border-t border-slate-800">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 rounded-xl mb-4 border border-emerald-500/30">
              <Stethoscope className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
              Potencialize sua Prática Clínica
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed">
              Integre o exame de imagem do comportamento digital ao seu fluxo de atendimento. Receba
              laudos comportamentais detalhados e direcione intervenções terapêuticas com precisão
              analítica.
            </p>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ferramenta de
                rastreamento de risco digital
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Acompanhamento objetivo
                de evolução
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Acesso à Biblioteca de
                Diretrizes (BDIC)
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Dr(a). Nome"
                          className="bg-slate-900 border-slate-700 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">E-mail Profissional</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="contato@clinica.com"
                          type="email"
                          className="bg-slate-900 border-slate-700 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clinic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">
                        Nome da Clínica/Instituição (Opcional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Clínica Exemplo"
                          className="bg-slate-900 border-slate-700 text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Mensagem (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Como podemos ajudar em sua rotina clínica?"
                          className="bg-slate-900 border-slate-700 text-white resize-none h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 mt-6 text-md"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processando...' : 'Solicite acesso ao BekAI para sua clínica'}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  )
}
