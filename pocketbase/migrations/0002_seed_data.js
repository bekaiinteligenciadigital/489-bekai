migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('Nascimento')

    // 1. Seed Specialist User
    const admin = new Record(users)
    admin.setEmail('admcecc@gmail.com')
    admin.setPassword('securepassword123')
    admin.setVerified(true)
    admin.set('name', 'Dr. Especialista Validador')
    app.save(admin)

    // 2. Seed Parent User
    const parent = new Record(users)
    parent.setEmail('parent@example.com')
    parent.setPassword('securepassword123')
    parent.setVerified(true)
    parent.set('name', 'João Silva (Pai)')
    app.save(parent)

    // 3. Seed Child
    const childrenCol = app.findCollectionByNameOrId('children')
    const child1 = new Record(childrenCol)
    child1.set('name', 'Lucas Silva')
    child1.set('birth_date', '2010-05-10 00:00:00.000Z')
    child1.set('parent', parent.id)
    app.save(child1)

    // 4. Seed Scientific Library
    const libCol = app.findCollectionByNameOrId('scientific_library')
    const docs = [
      {
        title: 'Modelos de Regulação da Emoção no Uso de Telas',
        axis: 'Psicologia',
        clinical_status: 'Base Clínica',
        evidence_level: 'Meta-análise',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/25133628/',
        summary: 'Falhas na reavaliação cognitiva associadas ao uso excessivo de mídias.',
      },
      {
        title: 'Circuitos Amigdalinos e Sobrecarga de Informação',
        axis: 'Neurociência',
        clinical_status: 'Diretriz Clínica Principal',
        evidence_level: 'RCT',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/25633786/',
        summary: 'Hiperatividade da amígdala em resposta a micro-estressores contínuos do feed.',
      },
      {
        title: 'Efeito do Multitarefa Digital',
        axis: 'Psiquiatria',
        clinical_status: 'Base Clínica',
        evidence_level: 'Coorte',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/32467140/',
        summary: 'Queda de 35% na atenção sustentada devido a media multitasking.',
      },
      {
        title: 'Impacto de Agressões Digitais',
        axis: 'Psicologia',
        clinical_status: 'Diretriz Clínica Principal',
        evidence_level: 'Meta-análise',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/34123512/',
        summary: 'Vítimas apresentam altos índices de estresse pós-traumático e ideação suicida.',
      },
      {
        title: 'Reprogramação Mental Rápida',
        axis: 'PNL',
        clinical_status: 'Camada Complementar',
        evidence_level: 'Opinião',
        content_link: 'https://example.com',
        summary: 'Técnicas de âncoras para melhorar o humor após estímulos virtuais negativos.',
      },
    ]

    for (const doc of docs) {
      const record = new Record(libCol)
      record.set('title', doc.title)
      record.set('axis', doc.axis)
      record.set('clinical_status', doc.clinical_status)
      record.set('evidence_level', doc.evidence_level)
      record.set('content_link', doc.content_link)
      record.set('summary', doc.summary)
      app.save(record)
    }

    // 5. Seed pending Clinical Plan for Dashboard
    const plansCol = app.findCollectionByNameOrId('clinical_plans')
    const plan1 = new Record(plansCol)
    plan1.set('child', child1.id)
    plan1.set('status', 'pending_approval')
    plan1.set('suggested_actions', {
      actions: [
        'Reduzir tempo de tela em 30 min por dia',
        'Iniciar diário de emoções e escuta ativa',
        'Implementar pausas digitais de 1 hora',
      ],
      reason: 'Alto nível de interações agressivas via WhatsApp e tempo excessivo noturno.',
    })
    app.save(plan1)
  },
  (app) => {
    try {
      const admin = app.findAuthRecordByEmail('Nascimento', 'admcecc@gmail.com')
      app.delete(admin)
      const parent = app.findAuthRecordByEmail('Nascimento', 'parent@example.com')
      app.delete(parent)
    } catch (e) {}

    const libCol = app.findCollectionByNameOrId('scientific_library')
    app.truncateCollection(libCol)

    const plansCol = app.findCollectionByNameOrId('clinical_plans')
    app.truncateCollection(plansCol)

    const childrenCol = app.findCollectionByNameOrId('children')
    app.truncateCollection(childrenCol)
  },
)
