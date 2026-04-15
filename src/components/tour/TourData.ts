export interface TourStep {
  target?: string
  title: string
  content: string
}

export const SUBSCRIBER_TOUR_STEPS: TourStep[] = [
  {
    title: 'Bem-vindo ao BekAI (Insight)',
    content:
      'Nesta jornada interativa, vamos te ajudar a entender e aplicar a metodologia da plataforma. O fluxo principal é composto por três fases: Decisão (escolha do plano e aceite da LGPD), Setup (cadastro da escala de maturidade) e Análise (coleta de evidências comportamentais).',
  },
  {
    title: 'Fase de Setup',
    content:
      'Durante o Setup do Jovem, a idade informada define a Escala de Maturidade do algoritmo, calibrando a sensibilidade para riscos e a profundidade da curadoria sugerida.',
  },
  {
    title: 'Ciclo de Análise',
    content:
      'Na Nova Análise, você informará as plataformas e os padrões de resposta observados (ex: Vaping de Atenção). Isso alimentará o nosso motor para gerar diagnósticos precisos.',
  },
  {
    target: '#tour-dq',
    title: 'Quociente Digital (DQ)',
    content:
      'Pontuação que mede a resiliência e a maturidade digital. Ex: Aumento da pontuação quando o jovem opta por conteúdos mais profundos.',
  },
  {
    target: '#tour-risk',
    title: 'Nível de Risco Expositivo',
    content:
      "Avaliação do impacto nocivo. Ex: Nível 'Alto' quando o algoritmo entrega muita polarização.",
  },
  {
    title: 'Vaping de Atenção',
    content:
      'Consumo passivo e acelerado de conteúdos curtos. Ex: Passar 1 hora no scroll infinito sem reter nada.',
  },
  {
    title: 'Comparação Social Ascendente',
    content:
      "Sentimento de inferioridade por padrões irreais. Ex: Insatisfação após ver vidas 'perfeitas' de influencers.",
  },
  {
    target: '#tour-scripts',
    title: 'Scripts de Comunicação',
    content: 'Modelos de diálogos estruturados para pais abordarem temas complexos com segurança.',
  },
  {
    title: 'Equivalência Estética',
    content:
      'Substituição de criadores nocivos por positivos com mesma linguagem visual. Ex: Trocar canal de pegadinhas por um de ciência dinâmico.',
  },
]

export const PROFESSIONAL_TOUR_STEPS: TourStep[] = [
  {
    title: 'Bem-vindo ao BekAI (Execution)',
    content:
      'Este é o seu painel clínico. Aqui você revisará e validará as intervenções propostas pela Inteligência Digital. Clique em "Próximo".',
  },
  {
    target: '#prof-tour-validation',
    title: 'Validação de Protocolo',
    content:
      'Análise de planos de intervenção para aprovação ou recusa baseada na sua avaliação do quadro clínico do paciente.',
  },
  {
    title: 'Polarização Algorítmica',
    content:
      'Exposição contínua a conteúdos extremistas que afetam a estabilidade emocional do paciente. Marcador crítico em nossas avaliações.',
  },
  {
    title: 'Marcadores de Risco Crítico',
    content:
      'Sinais identificados no consumo digital que apontam para ansiedade severa, niilismo ou distorção de imagem corporal.',
  },
  {
    title: 'Refinamento de Scripts de PNL',
    content:
      'Ajuste técnico nos roteiros de comunicação entregues aos pais, garantindo a eficácia terapêutica das abordagens em casa.',
  },
  {
    title: 'Supervisão de Evolução',
    content:
      'Monitoramento longitudinal da resposta clínica às intervenções algorítmicas e comportamentais aplicadas.',
  },
]

export const TOUR_STEPS = SUBSCRIBER_TOUR_STEPS
