onRecordAfterCreateSuccess((e) => {
  try {
    const risk = e.record.get('risk_level')

    if (risk === 'High' || risk === 'Critical') {
      const childId = e.record.get('child')

      const plansCol = $app.findCollectionByNameOrId('clinical_plans')
      const plan = new Record(plansCol)

      plan.set('child', childId)
      plan.set('status', 'pending_approval')
      plan.set('suggested_actions', {
        actions: [
          'Intervenção imediata focada em higiene do sono',
          'Sessão de escuta ativa e acolhimento',
          'Monitoramento da resposta emocional perante frustrações algorítmicas',
        ],
        reason:
          e.record.get('insights_summary') ||
          'Padrões de alto risco clínico detectados na análise contínua',
      })

      $app.save(plan)
    }
  } catch (err) {
    console.log('Error in generate_plan:', err)
  }
  e.next()
}, 'analysis_records')
