migrate(
  (app) => {
    // 1. Create glossary_terms collection
    const glossary = new Collection({
      name: 'glossary_terms',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'term', type: 'text', required: true },
        { name: 'definition', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(glossary)

    // 2. Create manual_chapters collection
    const manual = new Collection({
      name: 'manual_chapters',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: 'number', type: 'number', required: true },
        { name: 'title', type: 'text', required: true },
        { name: 'content', type: 'editor', required: true },
        { name: 'route_reference', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(manual)

    // 3. Seed Glossary Data
    const terms = [
      {
        term: 'DQ Score',
        definition:
          'O Quociente de Inteligência Digital (DQ) mede o nível de inteligência e resiliência digital da criança com base no histórico de exposições e respostas aos desafios na rede.',
      },
      {
        term: 'Vaping de Atenção',
        definition:
          'Consumo compulsivo e passivo de vídeos curtos, que gera fadiga decisional e reduz o tempo de atenção.',
      },
      {
        term: 'Equivalência Estética',
        definition:
          'Técnica de curadoria que substitui criadores nocivos por positivos utilizando a mesma linguagem visual e ritmo.',
      },
      {
        term: 'Narrativa Antagonista',
        definition:
          'Conteúdos focados em polarização e hostilidade para gerar engajamento através da indignação.',
      },
      {
        term: 'Técnica D.C.D.',
        definition:
          'Metodologia de diálogo parental: Duvidar da perfeição, Criticar narrativas de ódio e Determinar o próprio caminho.',
      },
      {
        term: 'Risco Expositivo',
        definition:
          'Avaliação algorítmica do impacto nocivo e tempo de exposição às plataformas de maior vulnerabilidade.',
      },
      {
        term: 'BDIC',
        definition:
          'Base de Dados de Inteligência Clínica, fundamentando as diretrizes e curadorias da plataforma KAIRÓS.',
      },
    ]
    terms.forEach((t) => {
      const record = new Record(glossary)
      record.set('term', t.term)
      record.set('definition', t.definition)
      app.save(record)
    })

    // 4. Seed Manual Chapters Data
    const chapters = [
      {
        number: 1,
        title: 'Decisão e Acesso Inicial',
        route_reference: '/planos',
        content:
          '<p>Este capítulo aborda a seleção de planos e o Cadastro de Clientes. Durante o registro de segurança, os responsáveis devem fornecer o Consentimento Parental LGPD (Art. 14 da Lei 13.709/2018), confirmando ciência de que a ferramenta não substitui avaliações clínicas e possui caráter estritamente educativo para proteção de dados sensíveis de menores.</p>',
      },
      {
        number: 2,
        title: 'Configuração de Perfis (Onboarding)',
        route_reference: '/setup-jovem',
        content:
          '<p>Detalha o processo de cadastro de jovens e profissionais. O Setup do Jovem exige a definição da idade, que calibra a <strong>Escala de Maturidade (8 a 18 anos)</strong> do algoritmo, ajustando a sensibilidade da detecção de riscos e a complexidade da curadoria recomendada.</p>',
      },
      {
        number: 3,
        title: 'Ciclo de Análise',
        route_reference: '/analise',
        content:
          '<p>Instrui sobre como fornecer dados para a Nova Análise. O sistema separa a coleta de Evidências dos Padrões de Resposta. Aqui monitoramos comportamentos como o <strong>Vaping de Atenção</strong> (consumo passivo e acelerado de conteúdos curtos) para calibrar as intervenções.</p>',
      },
      {
        number: 4,
        title: 'Diagnóstico e Literacia',
        route_reference: '/resultado',
        content:
          '<p>Apresenta as métricas do Dashboard. O <strong>DQ Score</strong> (Quociente Digital) quantifica a resiliência e maturidade digital do jovem. O <strong>Nível de Risco Expositivo</strong> categoriza a severidade das influências algorítmicas detectadas, servindo como base para as ações corretivas de curadoria.</p>',
      },
      {
        number: 5,
        title: 'Estratégia e Agente Autônomo',
        route_reference: '/plano',
        content:
          '<p>Explica o Plano de Ação, onde o Agente Autônomo atua. A principal estratégia é a <strong>Equivalência Estética</strong>, substituindo conteúdos nocivos por equivalentes positivos de mesma linguagem visual. O agente mede a Evolução Quantitativa (redução de tempo de tela nocivo) e Qualitativa (aumento de engajamento orgânico positivo).</p>',
      },
      {
        number: 6,
        title: 'Base de Inteligência Clínica',
        route_reference: '/biblioteca',
        content:
          '<p>Navegação na Biblioteca e no Framework. A <strong>BDIC</strong> (Base de Dados de Inteligência Clínica) fundamenta as recomendações. Inclui a <strong>Técnica D.C.D.</strong> (Diálogo, Conexão e Direcionamento) para comunicação parental eficaz e sem rupturas.</p>',
      },
    ]
    chapters.forEach((c) => {
      const record = new Record(manual)
      record.set('number', c.number)
      record.set('title', c.title)
      record.set('content', c.content)
      record.set('route_reference', c.route_reference)
      app.save(record)
    })
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId('manual_chapters'))
    } catch (_) {}
    try {
      app.delete(app.findCollectionByNameOrId('glossary_terms'))
    } catch (_) {}
  },
)
