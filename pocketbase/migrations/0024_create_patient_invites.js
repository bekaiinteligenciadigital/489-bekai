migrate(
  (app) => {
    const collection = new Collection({
      name: 'patient_invites',
      type: 'base',
      listRule: "@request.auth.id != '' && professional = @request.auth.id",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && professional = @request.auth.id",
      updateRule: "@request.auth.id != '' && professional = @request.auth.id",
      deleteRule: "@request.auth.id != '' && professional = @request.auth.id",
      fields: [
        {
          name: 'professional',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('Nascimento').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'patient_name', type: 'text', required: true },
        { name: 'invite_code', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'used'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_patient_invites_code ON patient_invites (invite_code)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('patient_invites')
    app.delete(collection)
  },
)
