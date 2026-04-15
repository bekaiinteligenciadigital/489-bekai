migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('Nascimento')

    users.fields.add(
      new SelectField({
        name: 'subscription_status',
        values: ['trialing', 'active', 'past_due', 'canceled', 'unpaid'],
        maxSelect: 1,
      }),
    )

    users.fields.add(
      new SelectField({
        name: 'active_plan',
        values: ['essencial_familia', 'essencial_profissional'],
        maxSelect: 1,
      }),
    )

    users.fields.add(new TextField({ name: 'external_customer_id' }))
    users.fields.add(new TextField({ name: 'external_subscription_id' }))
    users.fields.add(new TextField({ name: 'payment_method_type' }))

    users.addIndex('idx_nascimento_sub_status', false, 'subscription_status', '')

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('Nascimento')
    users.fields.removeByName('subscription_status')
    users.fields.removeByName('active_plan')
    users.fields.removeByName('external_customer_id')
    users.fields.removeByName('external_subscription_id')
    users.fields.removeByName('payment_method_type')
    users.removeIndex('idx_nascimento_sub_status')
    app.save(users)
  },
)
