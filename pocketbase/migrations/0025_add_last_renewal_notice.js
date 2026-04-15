migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')
    if (!col.fields.getByName('last_renewal_notice')) {
      col.fields.add(new DateField({ name: 'last_renewal_notice' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')
    col.fields.removeByName('last_renewal_notice')
    app.save(col)
  },
)
