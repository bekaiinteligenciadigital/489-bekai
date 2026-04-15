migrate(
  (app) => {
    const questionnairesCol = app.findCollectionByNameOrId('questionnaires')
    const qRecord = new Record(questionnairesCol)
    qRecord.set('code', 'kairos_digital_v1')
    qRecord.set('version', '1.0')
    qRecord.set('title', 'Kairós Digital Assessment')
    qRecord.set('description', 'Avaliação base para mapeamento do comportamento digital.')
    qRecord.set('status', 'active')
    app.save(qRecord)

    const sectionsCol = app.findCollectionByNameOrId('questionnaire_sections')

    const sec1 = new Record(sectionsCol)
    sec1.set('questionnaire', qRecord.id)
    sec1.set('title', 'Social Media Use')
    sec1.set('position', 1)
    app.save(sec1)

    const sec2 = new Record(sectionsCol)
    sec2.set('questionnaire', qRecord.id)
    sec2.set('title', 'Behavioral Changes')
    sec2.set('position', 2)
    app.save(sec2)

    const sec3 = new Record(sectionsCol)
    sec3.set('questionnaire', qRecord.id)
    sec3.set('title', 'Emotional Regulation')
    sec3.set('position', 3)
    app.save(sec3)

    const itemsCol = app.findCollectionByNameOrId('questionnaire_items')

    const item1 = new Record(itemsCol)
    item1.set('section', sec1.id)
    item1.set('question_code', 'sm_q1')
    item1.set('prompt_text', 'How many hours per day is spent on TikTok?')
    item1.set('answer_type', 'scale')
    item1.set('required', true)
    item1.set('options_json', { min: 0, max: 10, step: 1 })
    item1.set('scoring_metadata_json', { risk_weight: 2.5, dimension: 'exposure' })
    item1.set('position', 1)
    app.save(item1)

    const item2 = new Record(itemsCol)
    item2.set('section', sec2.id)
    item2.set('question_code', 'bc_q1')
    item2.set(
      'prompt_text',
      'O jovem apresenta irritabilidade ao ter o tempo de tela interrompido?',
    )
    item2.set('answer_type', 'single_choice')
    item2.set('required', true)
    item2.set('options_json', { options: ['Sempre', 'Frequentemente', 'Raramente', 'Nunca'] })
    item2.set('scoring_metadata_json', { risk_weight: 3.0, dimension: 'instability' })
    item2.set('position', 1)
    app.save(item2)
  },
  (app) => {
    try {
      const qCol = app.findCollectionByNameOrId('questionnaires')
      const records = app.findRecordsByFilter(
        'questionnaires',
        "code = 'kairos_digital_v1'",
        '',
        1,
        0,
      )
      if (records.length > 0) {
        app.delete(records[0])
      }
    } catch (e) {}
  },
)
