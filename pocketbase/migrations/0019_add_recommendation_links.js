migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('recommendation_items')

    if (!col.fields.getByName('url')) {
      col.fields.add(new URLField({ name: 'url' }))
    }

    if (!col.fields.getByName('resource_type')) {
      col.fields.add(
        new SelectField({
          name: 'resource_type',
          values: ['video', 'article', 'channel', 'site', 'book'],
          maxSelect: 1,
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('recommendation_items')
    col.fields.removeByName('url')
    col.fields.removeByName('resource_type')
    app.save(col)
  },
)
