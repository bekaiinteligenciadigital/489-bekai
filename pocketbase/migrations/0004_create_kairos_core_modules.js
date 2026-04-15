migrate(
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')

    // 1. questionnaires
    const questionnaires = new Collection({
      name: 'questionnaires',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'code', type: 'text', required: true },
        { name: 'version', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'status', type: 'select', values: ['draft', 'active', 'archived'] },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_questionnaires_code ON questionnaires (code)'],
    })
    app.save(questionnaires)

    // 2. questionnaire_sections
    const questionnaire_sections = new Collection({
      name: 'questionnaire_sections',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'questionnaire',
          type: 'relation',
          collectionId: questionnaires.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'title', type: 'text', required: true },
        { name: 'position', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(questionnaire_sections)

    // 3. questionnaire_items
    const questionnaire_items = new Collection({
      name: 'questionnaire_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'section',
          type: 'relation',
          collectionId: questionnaire_sections.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'question_code', type: 'text' },
        { name: 'prompt_text', type: 'text', required: true },
        {
          name: 'answer_type',
          type: 'select',
          values: ['single_choice', 'multiple_choice', 'text', 'scale'],
        },
        { name: 'required', type: 'bool' },
        { name: 'options_json', type: 'json' },
        { name: 'scoring_metadata_json', type: 'json' },
        { name: 'position', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(questionnaire_items)

    // 4. assessments
    const assessments = new Collection({
      name: 'assessments',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'child',
          type: 'relation',
          collectionId: childrenCol.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'questionnaire',
          type: 'relation',
          collectionId: questionnaires.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'status', type: 'select', values: ['in_progress', 'submitted', 'analyzed'] },
        { name: 'started_at', type: 'date' },
        { name: 'submitted_at', type: 'date' },
        { name: 'analyzed_at', type: 'date' },
        { name: 'final_risk_score', type: 'number' },
        { name: 'safety_level', type: 'select', values: ['low', 'medium', 'high', 'critical'] },
        { name: 'summary_json', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(assessments)

    // 5. assessment_answers
    const assessment_answers = new Collection({
      name: 'assessment_answers',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'assessment',
          type: 'relation',
          collectionId: assessments.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'questionnaire_item',
          type: 'relation',
          collectionId: questionnaire_items.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'answer_value_json', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(assessment_answers)

    // 6. risk_profiles
    const risk_profiles = new Collection({
      name: 'risk_profiles',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'assessment',
          type: 'relation',
          collectionId: assessments.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'exposure_score', type: 'number' },
        { name: 'distortion_score', type: 'number' },
        { name: 'instability_score', type: 'number' },
        { name: 'protective_score', type: 'number' },
        { name: 'clinical_score', type: 'number' },
        { name: 'rationale_json', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(risk_profiles)

    // 7. safety_flags
    const safety_flags = new Collection({
      name: 'safety_flags',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'risk_profile',
          type: 'relation',
          collectionId: risk_profiles.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'level', type: 'text' },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(safety_flags)

    // 8. creators
    const creators = new Collection({
      name: 'creators',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'platform',
          type: 'select',
          values: ['WhatsApp', 'Instagram', 'TikTok', 'YouTube', 'Discord', 'Roblox', 'Outro'],
        },
        { name: 'handle', type: 'text' },
        { name: 'display_name', type: 'text' },
        { name: 'profile_url', type: 'url' },
        { name: 'status', type: 'select', values: ['pending', 'analyzed', 'blocked'] },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(creators)

    // 9. content_items
    const content_items = new Collection({
      name: 'content_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'creator',
          type: 'relation',
          collectionId: creators.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'url', type: 'url' },
        { name: 'title', type: 'text' },
        { name: 'raw_text', type: 'text' },
        { name: 'transcript', type: 'text' },
        { name: 'status', type: 'select', values: ['queued', 'processing', 'completed', 'error'] },
        { name: 'analyzed_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(content_items)

    // 10. content_risk_scores
    const content_risk_scores = new Collection({
      name: 'content_risk_scores',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'content_item',
          type: 'relation',
          collectionId: content_items.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'anxiety_score', type: 'number' },
        { name: 'nihilism_score', type: 'number' },
        { name: 'sexualization_score', type: 'number' },
        { name: 'violence_score', type: 'number' },
        { name: 'self_harm_score', type: 'number' },
        { name: 'model_version', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(content_risk_scores)

    // 11. recommendation_bundles
    const recommendation_bundles = new Collection({
      name: 'recommendation_bundles',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'child',
          type: 'relation',
          collectionId: childrenCol.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'assessment',
          type: 'relation',
          collectionId: assessments.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'status', type: 'select', values: ['draft', 'active'] },
        { name: 'priority', type: 'select', values: ['low', 'medium', 'high'] },
        { name: 'rationale_summary', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(recommendation_bundles)

    // 12. recommendation_items
    const recommendation_items = new Collection({
      name: 'recommendation_items',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'bundle',
          type: 'relation',
          collectionId: recommendation_bundles.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'item_type',
          type: 'select',
          values: ['creator_alternative', 'habit', 'script', 'referral'],
        },
        { name: 'title', type: 'text' },
        { name: 'description', type: 'text' },
        {
          name: 'evidence_strength',
          type: 'select',
          values: ['meta-analysis', 'RCT', 'cohort', 'opinion'],
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(recommendation_items)

    // 13. parental_scripts
    const parental_scripts = new Collection({
      name: 'parental_scripts',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'bundle',
          type: 'relation',
          collectionId: recommendation_bundles.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'title', type: 'text' },
        { name: 'script_text', type: 'text' },
        { name: 'context', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(parental_scripts)

    // 14. action_plans
    const action_plans = new Collection({
      name: 'action_plans',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'child',
          type: 'relation',
          collectionId: childrenCol.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'assessment',
          type: 'relation',
          collectionId: assessments.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        {
          name: 'bundle',
          type: 'relation',
          collectionId: recommendation_bundles.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'status', type: 'select', values: ['pending', 'active', 'completed'] },
        { name: 'summary', type: 'text' },
        { name: 'version', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(action_plans)

    // 15. action_plan_steps
    const action_plan_steps = new Collection({
      name: 'action_plan_steps',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'action_plan',
          type: 'relation',
          collectionId: action_plans.id,
          maxSelect: 1,
          required: true,
          cascadeDelete: true,
        },
        { name: 'phase', type: 'text' },
        { name: 'title', type: 'text', required: true },
        { name: 'description', type: 'text' },
        { name: 'checklist_json', type: 'json' },
        { name: 'order_index', type: 'number' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(action_plan_steps)
  },
  (app) => {
    const collections = [
      'action_plan_steps',
      'action_plans',
      'parental_scripts',
      'recommendation_items',
      'recommendation_bundles',
      'content_risk_scores',
      'content_items',
      'creators',
      'safety_flags',
      'risk_profiles',
      'assessment_answers',
      'assessments',
      'questionnaire_items',
      'questionnaire_sections',
      'questionnaires',
    ]
    collections.forEach((name) => {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (e) {}
    })
  },
)
