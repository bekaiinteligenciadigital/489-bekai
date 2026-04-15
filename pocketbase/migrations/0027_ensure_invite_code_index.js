migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')
    col.addIndex('idx_nascimento_invite_code', true, 'invite_code', "invite_code != ''")
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('Nascimento')
    col.removeIndex('idx_nascimento_invite_code')
    app.save(col)
  },
)
