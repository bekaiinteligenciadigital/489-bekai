migrate(
  (app) => {
    const children = app.findCollectionByNameOrId('children')
    children.listRule =
      "@request.auth.id != '' && (parent = @request.auth.id || assigned_professional = @request.auth.id)"
    children.viewRule =
      "@request.auth.id != '' && (parent = @request.auth.id || assigned_professional = @request.auth.id)"
    children.updateRule = "@request.auth.id != '' && parent = @request.auth.id"
    app.save(children)

    const plans = app.findCollectionByNameOrId('clinical_plans')
    plans.listRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    plans.viewRule =
      "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)"
    plans.createRule = "@request.auth.id != '' && child.assigned_professional = @request.auth.id"
    plans.updateRule = "@request.auth.id != '' && child.assigned_professional = @request.auth.id"
    app.save(plans)
  },
  (app) => {
    const children = app.findCollectionByNameOrId('children')
    children.updateRule = ''
    app.save(children)
  },
)
