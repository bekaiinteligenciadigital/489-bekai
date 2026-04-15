migrate(
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')
    childrenCol.addIndex('idx_children_access_code', false, 'access_code', '')
    app.save(childrenCol)
  },
  (app) => {
    const childrenCol = app.findCollectionByNameOrId('children')
    childrenCol.removeIndex('idx_children_access_code')
    app.save(childrenCol)
  },
)
