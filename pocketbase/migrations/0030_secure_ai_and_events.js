migrate(
  (app) => {
    const events = app.findCollectionByNameOrId('digital_events')
    events.listRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    events.viewRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    events.createRule = null
    events.updateRule = null
    events.deleteRule = null
    app.save(events)

    const analysis = app.findCollectionByNameOrId('analysis_records')
    analysis.createRule = null
    analysis.updateRule = null
    analysis.deleteRule = null
    app.save(analysis)

    const plans = app.findCollectionByNameOrId('clinical_plans')
    plans.createRule = null
    plans.deleteRule = null
    app.save(plans)
  },
  (app) => {
    const events = app.findCollectionByNameOrId('digital_events')
    events.listRule = ''
    events.viewRule = ''
    events.createRule = ''
    events.updateRule = ''
    events.deleteRule = ''
    app.save(events)

    const analysis = app.findCollectionByNameOrId('analysis_records')
    analysis.createRule = ''
    analysis.updateRule = ''
    analysis.deleteRule = ''
    app.save(analysis)

    const plans = app.findCollectionByNameOrId('clinical_plans')
    plans.createRule = ''
    plans.deleteRule = ''
    app.save(plans)
  },
)
