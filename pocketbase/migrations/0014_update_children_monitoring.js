migrate(
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')
    if (!childrenCol.fields.getByName('monitoring_status')) {
      childrenCol.fields.add(
        new SelectField({
          name: 'monitoring_status',
          values: ['inactive', 'pending_credentials', 'active', 'sync_error'],
          maxSelect: 1,
        }),
      )
    }
    if (!childrenCol.fields.getByName('last_sync_at')) {
      childrenCol.fields.add(
        new DateField({
          name: 'last_sync_at',
        }),
      )
    }
    app.save(childrenCol)

    const eventsCol = app.findCollectionByNameOrId('digital_events')
    if (!eventsCol.fields.getByName('risk_scores')) {
      eventsCol.fields.add(
        new JSONField({
          name: 'risk_scores',
        }),
      )
    }
    app.save(eventsCol)
  },
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')
    childrenCol.fields.removeByName('monitoring_status')
    childrenCol.fields.removeByName('last_sync_at')
    app.save(childrenCol)

    const eventsCol = app.findCollectionByNameOrId('digital_events')
    eventsCol.fields.removeByName('risk_scores')
    app.save(eventsCol)
  },
)
