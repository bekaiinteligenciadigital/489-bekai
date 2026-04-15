migrate(
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')

    const collection = new Collection({
      name: 'report_history',
      type: 'base',
      listRule: "@request.auth.id != '' && child.parent = @request.auth.id",
      viewRule: "@request.auth.id != '' && child.parent = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && child.parent = @request.auth.id",
      deleteRule: "@request.auth.id != '' && child.parent = @request.auth.id",
      fields: [
        {
          name: 'child',
          type: 'relation',
          required: true,
          collectionId: childrenCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true },
        {
          name: 'report_file',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['application/pdf'],
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['monthly_summary', 'risk_alert', 'clinical_deep_dive'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('report_history')
    app.delete(collection)
  },
)
