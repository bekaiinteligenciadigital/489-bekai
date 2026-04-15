migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')

    if (!col.fields.getByName('whatsapp_enabled')) {
      col.fields.add(new BoolField({ name: 'whatsapp_enabled' }))
    }
    if (!col.fields.getByName('telegram_enabled')) {
      col.fields.add(new BoolField({ name: 'telegram_enabled' }))
    }
    if (!col.fields.getByName('telegram_id')) {
      col.fields.add(new TextField({ name: 'telegram_id' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')
    col.fields.removeByName('whatsapp_enabled')
    col.fields.removeByName('telegram_enabled')
    col.fields.removeByName('telegram_id')
    app.save(col)
  },
)
