onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const clinical_score = record.get('clinical_score')

  if (clinical_score >= 70) {
    // 1. Safety Flag
    const flagsCol = $app.findCollectionByNameOrId('safety_flags')
    const flag = new Record(flagsCol)
    flag.set('risk_profile', record.id)
    flag.set('level', 'critical')
    flag.set('description', 'Nível de risco clínico crítico detectado. Intervenção sugerida.')
    $app.save(flag)

    // 2. Link to analysis_records to alert on Dashboard
    try {
      const assessment = $app.findRecordById('assessments', record.get('assessment'))
      const analysisCol = $app.findCollectionByNameOrId('analysis_records')
      const analysis = new Record(analysisCol)
      analysis.set('child', assessment.get('child'))
      analysis.set('dq_score', 100 - clinical_score) // Inverted score for health
      analysis.set('risk_level', 'Critical')
      analysis.set('behavior_patterns', { critical_clinical_score: clinical_score })
      analysis.set(
        'insights_summary',
        'Alerta Crítico: Padrões severos identificados via questionário de avaliação clínica.',
      )
      $app.save(analysis)
    } catch (err) {}
  }

  e.next()
}, 'risk_profiles')
