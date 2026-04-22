migrate(
  (app) => {
    const children = app.findCollectionByNameOrId('children')
    const users = app.findCollectionByNameOrId('Nascimento')

    const socialConnections = new Collection({
      name: 'social_connections',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)",
      createRule: "@request.auth.id != '' && child.parent = @request.auth.id",
      updateRule: "@request.auth.id != '' && child.parent = @request.auth.id",
      deleteRule: "@request.auth.id != '' && child.parent = @request.auth.id",
      fields: [
        {
          name: 'child',
          type: 'relation',
          required: true,
          collectionId: children.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'platform',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['WhatsApp', 'Instagram', 'TikTok', 'YouTube', 'Discord', 'Roblox', 'Outro'],
        },
        { name: 'handle', type: 'text', required: true },
        { name: 'profile_url', type: 'url' },
        {
          name: 'connection_status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['draft', 'pending_auth', 'connected', 'sync_limited', 'error', 'revoked'],
        },
        {
          name: 'auth_method',
          type: 'select',
          maxSelect: 1,
          values: ['manual', 'oauth', 'invite', 'import'],
        },
        { name: 'external_account_id', type: 'text' },
        { name: 'credential_reference', type: 'text' },
        { name: 'consent_scope_json', type: 'json' },
        { name: 'last_sync_at', type: 'date' },
        {
          name: 'last_sync_status',
          type: 'select',
          maxSelect: 1,
          values: ['idle', 'running', 'success', 'partial', 'error'],
        },
        { name: 'last_error', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(socialConnections)

    const syncJobs = new Collection({
      name: 'sync_jobs',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)",
      viewRule:
        "@request.auth.id != '' && (child.parent = @request.auth.id || child.assigned_professional = @request.auth.id)",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'child',
          type: 'relation',
          required: true,
          collectionId: children.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'requested_by',
          type: 'relation',
          collectionId: users.id,
          maxSelect: 1,
        },
        {
          name: 'trigger_source',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['manual', 'scheduled', 'consent', 'system'],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['queued', 'running', 'completed', 'partial', 'failed'],
        },
        { name: 'started_at', type: 'date' },
        { name: 'finished_at', type: 'date' },
        { name: 'connections_total', type: 'number' },
        { name: 'connections_active', type: 'number' },
        { name: 'events_created', type: 'number' },
        { name: 'summary_json', type: 'json' },
        { name: 'error_message', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(syncJobs)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('sync_jobs'))
    app.delete(app.findCollectionByNameOrId('social_connections'))
  },
)
