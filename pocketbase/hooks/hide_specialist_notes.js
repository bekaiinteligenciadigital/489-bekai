onRecordEnrich((e) => {
  if (e.auth && e.auth.getString('role') !== 'professional') {
    e.record.set('specialist_notes', '')
  }
  e.next()
}, 'clinical_plans')
