migrate(
  (app) => {
    const userCollection = app.findCollectionByNameOrId('Nascimento')

    const collection = new Collection({
      name: 'user_module_progress',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != '' && user = @request.auth.id",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          collectionId: userCollection.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'module_key', type: 'text', required: true },
        { name: 'progress_json', type: 'json' },
        { name: 'completed_items', type: 'number' },
        { name: 'total_items', type: 'number' },
        { name: 'last_viewed_key', type: 'text' },
        { name: 'completed', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_user_module_progress_user_module ON user_module_progress (user, module_key)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('user_module_progress')
    app.delete(collection)
  },
)
