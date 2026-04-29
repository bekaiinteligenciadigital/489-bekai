migrate(
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')
    const eventsCol = app.findCollectionByNameOrId('digital_events')

    const harmfulTopics = new Collection({
      name: 'harmful_topics',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.authRefreshable = true",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'severity', type: 'select', required: true, values: ['low', 'medium', 'high', 'critical'], maxSelect: 1 },
        { name: 'keywords_json', type: 'json' },
        { name: 'counter_keywords_json', type: 'json' },
        { name: 'platform_scope_json', type: 'json' },
        { name: 'enabled', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_harmful_topics_slug ON harmful_topics (slug)'],
    })
    app.save(harmfulTopics)

    const interventions = new Collection({
      name: 'counter_interventions',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule:
        "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)",
      deleteRule: "@request.auth.authRefreshable = true",
      fields: [
        {
          name: 'child',
          type: 'relation',
          required: true,
          collectionId: childrenCol.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'source_event',
          type: 'relation',
          collectionId: eventsCol.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'harmful_topic',
          type: 'relation',
          required: true,
          collectionId: harmfulTopics.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'trigger_text', type: 'text' },
        { name: 'status', type: 'select', required: true, values: ['suggested', 'reviewed', 'delivered', 'dismissed'], maxSelect: 1 },
        { name: 'delivery_channel', type: 'select', values: ['dashboard', 'whatsapp', 'discord', 'manual_review'], maxSelect: 1 },
        { name: 'recommendation_json', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(interventions)

    const harmfulTopicCollection = app.findCollectionByNameOrId('harmful_topics')
    const seedIfMissing = (data) => {
      try {
        app.findFirstRecordByData('harmful_topics', 'slug', data.slug)
      } catch (err) {
        const record = new Record(harmfulTopicCollection)
        Object.keys(data).forEach((key) => record.set(key, data[key]))
        app.save(record)
      }
    }

    seedIfMissing({
      name: 'Violencia',
      slug: 'violencia',
      description: 'Sinais de busca, consumo ou recorrencia de conteudos violentos ou agressivos.',
      severity: 'high',
      keywords_json: ['violencia', 'agressao', 'arma', 'matar', 'briga', 'sangue', 'guerra'],
      counter_keywords_json: ['cultura de paz para jovens', 'resolucao de conflitos', 'empatia', 'cooperacao', 'esportes com disciplina', 'educacao emocional'],
      platform_scope_json: ['youtube', 'tiktok', 'instagram', 'discord'],
      enabled: true,
    })

    seedIfMissing({
      name: 'Autolesao e desespero',
      slug: 'autolesao',
      description: 'Sinais de sofrimento intenso, autolesao ou desesperanca.',
      severity: 'critical',
      keywords_json: ['autolesao', 'cortar', 'suicidio', 'desesperanca', 'nao aguento mais'],
      counter_keywords_json: ['apoio emocional jovem', 'esperanca', 'cuidado emocional', 'ajuda segura', 'saude mental adolescente'],
      platform_scope_json: ['youtube', 'instagram', 'discord'],
      enabled: true,
    })

    seedIfMissing({
      name: 'Sexualizacao precoce',
      slug: 'sexualizacao',
      description: 'Conteudos sexualizados inadequados para idade ou maturidade do jovem.',
      severity: 'high',
      keywords_json: ['conteudo adulto', 'sexo explicito', 'pornografia', 'nudes', 'fetiche'],
      counter_keywords_json: ['autocuidado adolescente', 'relacoes saudaveis', 'educacao afetiva', 'esporte e autoestima'],
      platform_scope_json: ['youtube', 'tiktok', 'instagram'],
      enabled: true,
    })
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('counter_interventions'))
    app.delete(app.findCollectionByNameOrId('harmful_topics'))
  },
)
