onRecordCreate((e) => {
  const record = e.record
  const profInfo = record.get('professional_info')

  if (profInfo && profInfo.inviteCode) {
    const inviteCode = profInfo.inviteCode
    try {
      const professional = $app.findFirstRecordByData('Nascimento', 'invite_code', inviteCode)
      if (professional.getString('role') === 'professional') {
        // Check limit
        const linkedChildren = $app.findRecordsByFilter(
          'children',
          'assigned_professional = {:profId}',
          '',
          11,
          0,
          { profId: professional.id },
        )
        if (linkedChildren.length < 10) {
          record.set('assigned_professional', professional.id)
        } else {
          console.log(`Professional ${professional.id} reached 10 patients limit. Link ignored.`)
        }
      }
    } catch (err) {
      console.log(`Invite code ${inviteCode} not found.`)
    }
  }

  e.next()
}, 'children')

onRecordUpdate((e) => {
  const record = e.record
  const profInfo = record.get('professional_info')

  if (profInfo && profInfo.inviteCode && !record.get('assigned_professional')) {
    const inviteCode = profInfo.inviteCode
    try {
      const professional = $app.findFirstRecordByData('Nascimento', 'invite_code', inviteCode)
      if (professional.getString('role') === 'professional') {
        const linkedChildren = $app.findRecordsByFilter(
          'children',
          'assigned_professional = {:profId}',
          '',
          11,
          0,
          { profId: professional.id },
        )
        if (linkedChildren.length < 10) {
          record.set('assigned_professional', professional.id)
        }
      }
    } catch (err) {
      // Ignored
    }
  }

  e.next()
}, 'children')
