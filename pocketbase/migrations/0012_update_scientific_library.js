migrate(
  (app) => {
    // Add fields to scientific_library
    const libraryCol = app.findCollectionByNameOrId('scientific_library')

    if (!libraryCol.fields.getByName('impact_factor')) {
      libraryCol.fields.add(new NumberField({ name: 'impact_factor' }))
    }
    if (!libraryCol.fields.getByName('journal_name')) {
      libraryCol.fields.add(new TextField({ name: 'journal_name' }))
    }
    app.save(libraryCol)

    // Add fields to Nascimento (Users)
    const usersCol = app.findCollectionByNameOrId('Nascimento')
    if (!usersCol.fields.getByName('notifiable_interests')) {
      usersCol.fields.add(new JSONField({ name: 'notifiable_interests' }))
    }
    app.save(usersCol)

    // Seed Data for demonstration of filtering
    const seedData = [
      {
        title: 'Digital Media Use and Adolescent Mental Health: A Comprehensive Meta-analysis',
        axis: 'Psiquiatria',
        clinical_status: 'Diretriz Clínica Principal',
        evidence_level: 'Meta-análise',
        summary:
          'High digital exposure correlates directly with an elevated Nível de Risco Expositivo, affecting emotional regulation.',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/',
        impact_factor: 15.4,
        journal_name: 'The Lancet Psychiatry',
      },
      {
        title: 'Cognitive Load and Screen Time in Early Development',
        axis: 'Neurociência',
        clinical_status: 'Base Clínica',
        evidence_level: 'RCT',
        summary:
          'Significant impact on the Quociente Digital (DQ) observed in children with over 4 hours of unstructured screen time.',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/',
        impact_factor: 12.1,
        journal_name: 'Nature Neuroscience',
      },
      {
        title: 'Behavioral Interventions for Problematic Internet Use',
        axis: 'Psicologia',
        clinical_status: 'Diretriz Clínica Principal',
        evidence_level: 'Coorte',
        summary:
          'Structured routine and Mapeamento de Influência show long-term protective effects against behavioral Distorção.',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/',
        impact_factor: 8.5,
        journal_name: 'Journal of Child Psychology',
      },
      {
        title: 'Psychoanalytic Perspectives on Virtual Avatars and Identity',
        axis: 'Psicanálise',
        clinical_status: 'Camada Complementar',
        evidence_level: 'Relato',
        summary:
          'Case studies suggest that deep immersion in virtual realities challenges early ego formation.',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/',
        impact_factor: 4.2,
        journal_name: 'International Journal of Psychoanalysis',
      },
      {
        title: 'Neurolinguistic Reframing for Digital Addiction',
        axis: 'PNL',
        clinical_status: 'Camada Complementar',
        evidence_level: 'Opinião',
        summary:
          'Reframing techniques could help in establishing healthier boundaries with mobile devices.',
        content_link: 'https://pubmed.ncbi.nlm.nih.gov/',
        impact_factor: 2.1,
        journal_name: 'Journal of Applied Psychology',
      },
    ]

    for (const data of seedData) {
      try {
        app.findFirstRecordByData('scientific_library', 'title', data.title)
      } catch (_) {
        const record = new Record(libraryCol)
        for (const [key, value] of Object.entries(data)) {
          record.set(key, value)
        }
        app.save(record)
      }
    }
  },
  (app) => {
    const libraryCol = app.findCollectionByNameOrId('scientific_library')
    libraryCol.fields.removeByName('impact_factor')
    libraryCol.fields.removeByName('journal_name')
    app.save(libraryCol)

    const usersCol = app.findCollectionByNameOrId('Nascimento')
    usersCol.fields.removeByName('notifiable_interests')
    app.save(usersCol)
  },
)
