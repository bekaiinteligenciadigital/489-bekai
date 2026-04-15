migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('children')

    if (!col.fields.getByName('consent_accepted')) {
      col.fields.add(new BoolField({ name: 'consent_accepted' }))
    }
    if (!col.fields.getByName('consent_timestamp')) {
      col.fields.add(new DateField({ name: 'consent_timestamp' }))
    }
    if (!col.fields.getByName('consent_signature_name')) {
      col.fields.add(new TextField({ name: 'consent_signature_name' }))
    }
    if (!col.fields.getByName('last_report_generated')) {
      col.fields.add(new DateField({ name: 'last_report_generated' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('children')

    col.fields.removeByName('consent_accepted')
    col.fields.removeByName('consent_timestamp')
    col.fields.removeByName('consent_signature_name')
    col.fields.removeByName('last_report_generated')

    app.save(col)
  },
)
