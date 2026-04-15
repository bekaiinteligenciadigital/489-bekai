migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')

    if (!col.fields.getByName('attendance_type')) {
      col.fields.add(
        new SelectField({
          name: 'attendance_type',
          maxSelect: 3,
          values: ['Consultório', 'Clínica', 'Hospital'],
        }),
      )
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')
    if (col.fields.getByName('attendance_type')) {
      col.fields.removeByName('attendance_type')
    }
    app.save(col)
  },
)
