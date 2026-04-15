import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export function ClinicalFaq() {
  return (
    <section className="py-24 px-4 bg-white border-t border-slate-100">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">
            FAQ Clínica & Segurança
          </h2>
          <p className="text-slate-600 text-lg">
            Dúvidas frequentes de profissionais de saúde e instituições sobre nossa tecnologia.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary">
              Qual a base científica do BekAI?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed text-base">
              Nossa plataforma é integrada à BDIC (Biblioteca de Diretrizes Clínicas), baseando suas
              análises em métricas validadas por evidências nas áreas de psiquiatria, psicologia e
              neurociência. O algoritmo cruza padrões de consumo de conteúdo com marcadores de risco
              previamente documentados para o desenvolvimento infanto-juvenil saudável.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary">
              Como é garantida a conformidade com a LGPD?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed text-base">
              O KAIRÓS opera sob rigorosos protocolos de segurança e criptografia. A coleta de dados
              de consumo digital exige consentimento parental expresso. Além disso, as informações
              sensíveis são processadas e anonimizadas para a geração dos laudos comportamentais,
              garantindo proteção à privacidade e total conformidade com a LGPD.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary">
              O BekAI substitui o diagnóstico clínico?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed text-base">
              Não. O BekAI atua estritamente como um{' '}
              <strong>exame de imagem do comportamento digital</strong>. Ele extrai dados
              estruturados sobre a rotina de consumo online do paciente (uma camada invisível nas
              abordagens tradicionais) e oferece essas métricas de rastreamento com a finalidade de
              embasar e direcionar o diagnóstico do profissional de saúde.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary">
              Quais plataformas são analisadas?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed text-base">
              Nossa tecnologia identifica padrões comportamentais, engajamento e tempo de atenção
              ativo/passivo através de uma análise centralizada de plataformas como: WhatsApp,
              Instagram, TikTok, YouTube, Discord e Roblox.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5">
            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary">
              Como é mantido o sigilo médico-paciente?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed text-base">
              Os laudos gerados pelo BekAI são estritamente confidenciais e de propriedade exclusiva
              do profissional de saúde e do responsável legal. O sistema atua como uma ferramenta de
              apoio à decisão clínica, assegurando que todas as informações sigam rigorosamente os
              princípios do código de ética médica, não sendo compartilhadas com terceiros em
              nenhuma hipótese.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6">
            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary">
              O sistema possui criptografia de dados e conformidade com a LGPD?
            </AccordionTrigger>
            <AccordionContent className="text-slate-600 leading-relaxed text-base">
              Sim. Todos os dados de monitoramento, laudos analíticos e métricas comportamentais são
              protegidos com criptografia de ponta a ponta (AES-256 em repouso e TLS em trânsito). O
              acesso ao portal clínico é restrito por autenticação segura e operamos em total
              conformidade técnica com as exigências da LGPD, garantindo a integridade dos dados
              sensíveis.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
