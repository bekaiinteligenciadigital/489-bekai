migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('Nascimento')

    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['subscriber', 'professional'],
          maxSelect: 1,
        }),
      )
    }
    app.save(users)

    try {
      const profRecord = new Record(users)
      profRecord.setEmail('professional@kairos.com')
      profRecord.setPassword('securepassword123')
      profRecord.setVerified(true)
      profRecord.set('role', 'professional')
      profRecord.set('name', 'Dr. Especialista')
      app.save(profRecord)
    } catch (e) {
      console.log('Error seeding professional:', e.message)
    }

    try {
      const subRecord = new Record(users)
      subRecord.setEmail('subscriber@kairos.com')
      subRecord.setPassword('securepassword123')
      subRecord.setVerified(true)
      subRecord.set('role', 'subscriber')
      subRecord.set('name', 'Pai/Mãe Assinante')
      app.save(subRecord)
    } catch (e) {
      console.log('Error seeding subscriber:', e.message)
    }
  },
  (app) => {
    const users = app.findCollectionByNameOrId('Nascimento')
    users.fields.removeByName('role')
    app.save(users)

    try {
      const prof = app.findAuthRecordByEmail('Nascimento', 'professional@kairos.com')
      app.delete(prof)
    } catch (_) {}
    try {
      const sub = app.findAuthRecordByEmail('Nascimento', 'subscriber@kairos.com')
      app.delete(sub)
    } catch (_) {}
  },
)
