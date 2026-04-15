onRecordValidate((e) => {
  // Library Guardrails: Ensure PNL is strictly Camada Complementar
  if (e.record.get('axis') === 'PNL') {
    e.record.set('clinical_status', 'Camada Complementar')
  }
  e.next()
}, 'scientific_library')
