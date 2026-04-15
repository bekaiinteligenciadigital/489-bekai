migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('Nascimento')

    if (!users.fields.getByName('council_id')) {
      users.fields.add(new TextField({ name: 'council_id' }))
    }
    if (!users.fields.getByName('specialty')) {
      users.fields.add(new TextField({ name: 'specialty' }))
    }
    if (!users.fields.getByName('clinic_name')) {
      users.fields.add(new TextField({ name: 'clinic_name' }))
    }
    if (!users.fields.getByName('phone')) {
      users.fields.add(new TextField({ name: 'phone' }))
    }

    const roleField = users.fields.getByName('role')
    if (!roleField) {
      users.fields.add(
        new SelectField({ name: 'role', maxSelect: 1, values: ['subscriber', 'professional'] }),
      )
    }

    app.save(users)

    const children = app.findCollectionByNameOrId('children')
    if (!children.fields.getByName('professional_info')) {
      children.fields.add(new JSONField({ name: 'professional_info' }))
    }
    app.save(children)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('Nascimento')
    users.fields.removeByName('council_id')
    users.fields.removeByName('specialty')
    users.fields.removeByName('clinic_name')
    users.fields.removeByName('phone')
    app.save(users)

    const children = app.findCollectionByNameOrId('children')
    children.fields.removeByName('professional_info')
    app.save(children)
  },
)
