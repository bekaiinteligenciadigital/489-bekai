migrate(
  (app) => {
    // Fetch Nascimento auth collection
    const authCol = app.findCollectionByNameOrId('Nascimento')

    const children = new Collection({
      name: 'children',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'birth_date', type: 'date' },
        {
          name: 'parent',
          type: 'relation',
          required: true,
          collectionId: authCol.id,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(children)

    const digitalEvents = new Collection({
      name: 'digital_events',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          name: 'child',
          type: 'relation',
          required: true,
          collectionId: children.id,
          maxSelect: 1,
        },
        {
          name: 'platform',
          type: 'select',
          values: ['WhatsApp', 'Instagram', 'TikTok', 'YouTube', 'Discord', 'Roblox', 'Outro'],
        },
        { name: 'event_type', type: 'text' },
        { name: 'content_summary', type: 'text' },
        { name: 'timestamp', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(digitalEvents)

    const analysisRecords = new Collection({
      name: 'analysis_records',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          name: 'child',
          type: 'relation',
          required: true,
          collectionId: children.id,
          maxSelect: 1,
        },
        { name: 'dq_score', type: 'number' },
        { name: 'behavior_patterns', type: 'json' },
        { name: 'risk_level', type: 'select', values: ['Low', 'Medium', 'High', 'Critical'] },
        { name: 'insights_summary', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(analysisRecords)

    const clinicalPlans = new Collection({
      name: 'clinical_plans',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        {
          name: 'child',
          type: 'relation',
          required: true,
          collectionId: children.id,
          maxSelect: 1,
        },
        {
          name: 'status',
          type: 'select',
          values: ['pending_approval', 'approved', 'rejected', 'executing', 'completed'],
        },
        { name: 'suggested_actions', type: 'json' },
        { name: 'specialist_notes', type: 'text' },
        { name: 'validator', type: 'relation', collectionId: authCol.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(clinicalPlans)

    const scientificLibrary = new Collection({
      name: 'scientific_library',
      type: 'base',
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: '',
      fields: [
        { name: 'title', type: 'text', required: true },
        {
          name: 'axis',
          type: 'select',
          values: ['Psiquiatria', 'Psicologia', 'Neurociência', 'Psicanálise', 'PNL'],
        },
        {
          name: 'clinical_status',
          type: 'select',
          values: ['Base Clínica', 'Camada Complementar', 'Diretriz Clínica Principal'],
        },
        {
          name: 'evidence_level',
          type: 'select',
          values: ['Meta-análise', 'RCT', 'Coorte', 'Relato', 'Opinião'],
        },
        { name: 'content_link', type: 'url' },
        { name: 'summary', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(scientificLibrary)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('scientific_library'))
    app.delete(app.findCollectionByNameOrId('clinical_plans'))
    app.delete(app.findCollectionByNameOrId('analysis_records'))
    app.delete(app.findCollectionByNameOrId('digital_events'))
    app.delete(app.findCollectionByNameOrId('children'))
  },
)
