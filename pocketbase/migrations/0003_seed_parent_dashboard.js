migrate(
  (app) => {
    // 1. Ensure a parent user exists
    const usersCol = app.findCollectionByNameOrId('Nascimento')
    let user
    try {
      user = app.findAuthRecordByEmail('Nascimento', 'admcecc@gmail.com')
    } catch (e) {
      user = new Record(usersCol)
      user.setEmail('admcecc@gmail.com')
      user.setPassword('securepassword123')
      user.setVerified(true)
      user.set('name', 'Admin Parent')
      app.save(user)
    }

    // 2. Create a child for the parent
    const childrenCol = app.findCollectionByNameOrId('children')
    const child = new Record(childrenCol)
    child.set('name', 'Lucas Albuquerque')
    child.set('birth_date', '2010-08-15 00:00:00.000Z')
    child.set('parent', user.id)
    app.save(child)

    // 3. Create digital events
    const eventsCol = app.findCollectionByNameOrId('digital_events')
    const platforms = [
      'TikTok',
      'TikTok',
      'Instagram',
      'WhatsApp',
      'Discord',
      'TikTok',
      'YouTube',
      'YouTube',
    ]

    for (const p of platforms) {
      const evt = new Record(eventsCol)
      evt.set('child', child.id)
      evt.set('platform', p)
      evt.set('event_type', 'consumo')
      evt.set('content_summary', 'Visualização de vídeos e interações em grupo')
      evt.set('timestamp', new Date().toISOString())
      app.save(evt)
    }

    // 4. Create analysis record
    const analysisCol = app.findCollectionByNameOrId('analysis_records')
    const analysis = new Record(analysisCol)
    analysis.set('child', child.id)
    analysis.set('dq_score', 68)
    analysis.set('risk_level', 'Medium')
    analysis.set(
      'insights_summary',
      'Aumento sutil de isolamento e consumo contínuo de conteúdo de polarização rápida. Recomenda-se introduzir pausas ativas e iniciar diálogos de ancoragem familiar.',
    )
    analysis.set(
      'behavior_patterns',
      JSON.stringify([
        {
          issue: 'Exposição a ganchos de dopamina rápida no TikTok',
          trigger: 'Ansiedade e Irritabilidade',
        },
        {
          issue: 'Uso de Discord até tarde da noite',
          trigger: 'Privação de sono e isolamento físico',
        },
      ]),
    )
    app.save(analysis)

    // 5. Create scientific library item for PNL / Psicanálise (Camada Complementar)
    const libCol = app.findCollectionByNameOrId('scientific_library')
    const lib = new Record(libCol)
    lib.set('title', 'Comunicação Não-Violenta e Ancoragem na Adolescência')
    lib.set('axis', 'PNL')
    lib.set('clinical_status', 'Camada Complementar')
    lib.set('evidence_level', 'Meta-análise')
    lib.set('content_link', 'https://example.com/pnl-tecnicas')
    lib.set(
      'summary',
      'Técnicas de re-enquadramento de linguagem e rapport para reduzir defesas e aumentar a conexão empática com jovens superestimulados digitalmente.',
    )
    app.save(lib)
  },
  (app) => {
    // Optional down migration: remove the seeded child and cascading records
    try {
      const user = app.findAuthRecordByEmail('Nascimento', 'admcecc@gmail.com')
      const children = app.findRecordsByFilter('children', `parent = "${user.id}"`, '', 10, 0)
      for (const child of children) {
        app.delete(child)
      }
    } catch (e) {
      // ignore
    }
  },
)
