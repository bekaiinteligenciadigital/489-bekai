migrate(
  (app) => {
    // 1. Nascimento (users) collection
    const users = app.findCollectionByNameOrId('Nascimento')

    if (!users.fields.getByName('invite_code')) {
      users.fields.add(new TextField({ name: 'invite_code' }))
    }
    app.save(users)

    try {
      users.addIndex('idx_nascimento_invite_code', true, 'invite_code', "invite_code != ''")
      app.save(users)
    } catch (e) {}

    // 2. children collection
    const children = app.findCollectionByNameOrId('children')
    if (!children.fields.getByName('assigned_professional')) {
      children.fields.add(
        new RelationField({ name: 'assigned_professional', collectionId: users.id, maxSelect: 1 }),
      )
    }

    children.listRule =
      "@request.auth.id != '' && (parent = @request.auth.id || assigned_professional = @request.auth.id)"
    children.viewRule =
      "@request.auth.id != '' && (parent = @request.auth.id || assigned_professional = @request.auth.id)"
    app.save(children)

    // 3. assessments
    const assessments = app.findCollectionByNameOrId('assessments')
    assessments.listRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    assessments.viewRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    app.save(assessments)

    // 4. analysis_records
    const analysis = app.findCollectionByNameOrId('analysis_records')
    analysis.listRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    analysis.viewRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    app.save(analysis)

    // 5. report_history
    const history = app.findCollectionByNameOrId('report_history')
    history.listRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    history.viewRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    app.save(history)

    // 6. clinical_plans
    const plans = app.findCollectionByNameOrId('clinical_plans')
    plans.listRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    plans.viewRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    plans.updateRule = "@request.auth.id != '' && child.assigned_professional = @request.auth.id"
    app.save(plans)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('Nascimento')
    users.removeIndex('idx_nascimento_invite_code')
    users.fields.removeByName('invite_code')
    app.save(users)

    const children = app.findCollectionByNameOrId('children')
    children.fields.removeByName('assigned_professional')
    children.listRule = ''
    children.viewRule = ''
    app.save(children)

    const assessments = app.findCollectionByNameOrId('assessments')
    assessments.listRule = "@request.auth.id != ''"
    assessments.viewRule = "@request.auth.id != ''"
    app.save(assessments)

    const analysis = app.findCollectionByNameOrId('analysis_records')
    analysis.listRule = ''
    analysis.viewRule = ''
    app.save(analysis)

    const history = app.findCollectionByNameOrId('report_history')
    history.listRule = "@request.auth.id != '' && child.parent = @request.auth.id"
    history.viewRule = "@request.auth.id != '' && child.parent = @request.auth.id"
    app.save(history)

    const plans = app.findCollectionByNameOrId('clinical_plans')
    plans.listRule = ''
    plans.viewRule = ''
    plans.updateRule = ''
    app.save(plans)
  },
)
