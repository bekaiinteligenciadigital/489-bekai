migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')
    const field = col.fields.getByName('active_plan')
    if (field) {
      field.values = ['essencial_familia', 'essencial_profissional', 'clinical_expert']
      app.save(col)
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')
    const field = col.fields.getByName('active_plan')
    if (field) {
      field.values = ['essencial_familia', 'essencial_profissional']
      app.save(col)
    }
  },
)
