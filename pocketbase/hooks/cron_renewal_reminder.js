cronAdd('renewal_reminder', '0 10 * * *', () => {
  try {
    const users = $app.findRecordsByFilter(
      'Nascimento',
      "(subscription_status = 'past_due' || (subscription_status = 'active' && updated < @now('-25days'))) && active_plan = 'essencial_profissional' && (last_renewal_notice = '' || last_renewal_notice < @now('-7days'))",
    )

    users.forEach((user) => {
      try {
        const notifCollection = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCollection)
        notif.set('user', user.id)
        notif.set('title', 'Aviso de Vencimento de Assinatura')
        notif.set(
          'message',
          'Sua assinatura BekAI Essencial Profissional está próxima do vencimento. Renove agora para manter o acompanhamento clínico do seu filho.',
        )
        notif.set('priority', 'warning')
        notif.set('link', '/pagamento')
        notif.set('is_read', false)
        $app.save(notif)

        const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + 'Z'
        user.set('last_renewal_notice', now)
        $app.saveNoValidate(user)
      } catch (e) {
        console.log('Error notifying user', user.id, e)
      }
    })
  } catch (e) {
    console.log('Error running renewal cron', e)
  }
})
