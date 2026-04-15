migrate(
  (app) => {
    const childrenRecords = app.findRecordsByFilter('children', '1=1', '', 1, 0)
    if (childrenRecords.length === 0) return
    const childId = childrenRecords[0].id

    const questionnairesRecords = app.findRecordsByFilter('questionnaires', '1=1', '', 1, 0)
    if (questionnairesRecords.length === 0) return
    const qId = questionnairesRecords[0].id

    // 1. Assessment
    const assessCol = app.findCollectionByNameOrId('assessments')
    const assessment = new Record(assessCol)
    assessment.set('child', childId)
    assessment.set('questionnaire', qId)
    assessment.set('status', 'analyzed')
    assessment.set('started_at', new Date().toISOString())
    assessment.set('submitted_at', new Date().toISOString())
    assessment.set('analyzed_at', new Date().toISOString())
    assessment.set('final_risk_score', 45)
    assessment.set('safety_level', 'medium')
    assessment.set('summary_json', {
      insight: 'Exposição moderada a telas. Necessita ajuste de rotina.',
    })
    app.save(assessment)

    // 2. Risk Profile
    const rpCol = app.findCollectionByNameOrId('risk_profiles')
    const risk = new Record(rpCol)
    risk.set('assessment', assessment.id)
    risk.set('exposure_score', 45)
    risk.set('distortion_score', 30)
    risk.set('instability_score', 50)
    risk.set('protective_score', 60)
    risk.set('clinical_score', 42)
    risk.set('rationale_json', { analysis: 'Padrão de uso típico com pico noturno.' })
    app.save(risk)

    // 3. Recommendation Bundle
    const bundleCol = app.findCollectionByNameOrId('recommendation_bundles')
    const bundle = new Record(bundleCol)
    bundle.set('child', childId)
    bundle.set('assessment', assessment.id)
    bundle.set('status', 'active')
    bundle.set('priority', 'medium')
    bundle.set('rationale_summary', 'Adequar higiene do sono e propor conteúdo complementar.')
    app.save(bundle)

    // 4. Action Plan
    const planCol = app.findCollectionByNameOrId('action_plans')
    const plan = new Record(planCol)
    plan.set('child', childId)
    plan.set('assessment', assessment.id)
    plan.set('bundle', bundle.id)
    plan.set('status', 'active')
    plan.set('summary', 'Protocolo de Desmame Noturno')
    plan.set('version', '1.0')
    app.save(plan)

    // 5. Steps
    const stepCol = app.findCollectionByNameOrId('action_plan_steps')

    const step1 = new Record(stepCol)
    step1.set('action_plan', plan.id)
    step1.set('phase', '24h')
    step1.set('title', 'Configurar Modo Restrito')
    step1.set(
      'description',
      'Ativar bloqueio de aplicativos pós 21h nos dispositivos do adolescente.',
    )
    step1.set('order_index', 1)
    app.save(step1)

    const step2 = new Record(stepCol)
    step2.set('action_plan', plan.id)
    step2.set('phase', '7d')
    step2.set('title', 'Atividade Foca OFF')
    step2.set(
      'description',
      'Substituir 1h de tela por leitura ou interação familiar antes de dormir.',
    )
    step2.set('order_index', 2)
    app.save(step2)

    const step3 = new Record(stepCol)
    step3.set('action_plan', plan.id)
    step3.set('phase', '30d')
    step3.set('title', 'Acompanhamento Mensal')
    step3.set('description', 'Revisão dos combinados. Celebrar a redução do tempo de exposição.')
    step3.set('order_index', 3)
    app.save(step3)
  },
  (app) => {
    // Ignored for seeds
  },
)
