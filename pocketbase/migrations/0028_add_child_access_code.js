migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('children')
    if (!col.fields.getByName('access_code')) {
      col.fields.add(new TextField({ name: 'access_code' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('children')
    if (col.fields.getByName('access_code')) {
      col.fields.removeByName('access_code')
      app.save(col)
    }
  },
)
