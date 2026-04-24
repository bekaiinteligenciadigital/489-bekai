migrate(
  (app) => {
    const connections = app.findCollectionByNameOrId('social_connections')

    const credentials = new Collection({
      name: 'social_credentials',
      type: 'base',
      listRule: null,
      viewRule: null,
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'connection',
          type: 'relation',
          required: true,
          collectionId: connections.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'provider',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['whatsapp', 'instagram', 'tiktok', 'youtube', 'discord', 'roblox', 'other'],
        },
        {
          name: 'token_status',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['pending', 'active', 'expired', 'revoked', 'error'],
        },
        { name: 'access_token', type: 'text' },
        { name: 'refresh_token', type: 'text' },
        { name: 'token_type', type: 'text' },
        { name: 'scopes_json', type: 'json' },
        { name: 'external_account_id', type: 'text' },
        { name: 'profile_url', type: 'url' },
        { name: 'secret_fingerprint', type: 'text' },
        { name: 'issued_at', type: 'date' },
        { name: 'token_expires_at', type: 'date' },
        { name: 'last_refreshed_at', type: 'date' },
        { name: 'last_error', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })

    app.save(credentials)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('social_credentials'))
  },
)
