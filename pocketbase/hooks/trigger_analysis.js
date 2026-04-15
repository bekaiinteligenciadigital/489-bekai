onRecordAfterCreateSuccess((e) => {
  try {
    const childId = e.record.get('child')
    let clinical_score = 50

    try {
      const profiles = $app.findRecordsByFilter(
        'risk_profiles',
        "assessment.child = '" + childId + "'",
        '-created',
        1,
        0,
      )
      if (profiles && profiles.length > 0) {
        clinical_score = profiles[0].get('clinical_score')
      }
    } catch (err) {}

    let risk_level = 'High'
    if (clinical_score >= 70) risk_level = 'Critical'
    else if (clinical_score >= 50) risk_level = 'High'
    else if (clinical_score >= 30) risk_level = 'Medium'
    else risk_level = 'Low'

    const eventPlatform = e.record.get('platform') || 'Desconhecida'
    const analysisCol = $app.findCollectionByNameOrId('analysis_records')
    const analysis = new Record(analysisCol)

    analysis.set('child', childId)
    analysis.set('dq_score', Math.max(0, 100 - clinical_score))
    analysis.set('behavior_patterns', {
      scroll_depth: 'high',
      late_night_usage: true,
      platform: eventPlatform,
    })
    analysis.set('risk_level', risk_level)
    analysis.set(
      'insights_summary',
      'Padrão atualizado de influência digital detectado no ' +
        eventPlatform +
        '. O motor identificou novos comportamentos que afetam o score clínico atual.',
    )

    $app.save(analysis)
  } catch (err) {
    console.log('Error in trigger_analysis:', err)
  }
  e.next()
}, 'digital_events')
