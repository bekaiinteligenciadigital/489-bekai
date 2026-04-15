onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const childId = record.get('child')

  try {
    const child = $app.findRecordById('children', childId)
    const parentId = child.get('parent')

    const notifCollection = $app.findCollectionByNameOrId('notifications')
    const notif = new Record(notifCollection)

    notif.set('user', parentId)
    notif.set('title', 'Novo Relatório Disponível')
    notif.set(
      'message',
      `O relatório "${record.get('title')}" foi gerado e salvo na sua biblioteca.`,
    )
    notif.set('link', '/dashboard/reports')
    notif.set('is_read', false)
    notif.set('priority', 'info')

    $app.save(notif)

    const parentUser = $app.findRecordById('Nascimento', parentId)
    const emailApiKey = $secrets.get('EMAIL_API_KEY')

    const messageText = `Olá ${parentUser.get('name') || ''}, um novo relatório "${record.get('title')}" para ${child.get('name')} foi gerado e está disponível na sua biblioteca.\n\nAcesse: https://guardiao-digital-familiar-8c178.goskip.app/dashboard/reports`

    // WhatsApp Notification
    if (parentUser.get('whatsapp_enabled') && parentUser.get('phone')) {
      const sid = $secrets.get('TWILIO_ACCOUNT_SID')
      const token = $secrets.get('TWILIO_AUTH_TOKEN')
      const fromNum = $secrets.get('TWILIO_WHATSAPP_NUMBER')
      if (sid && token && fromNum) {
        let toNum = parentUser.get('phone').replace(/\D/g, '')
        if (!toNum.startsWith('+')) toNum = '+' + toNum
        $http.send({
          url: `https://${sid}:${token}@api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:
            'To=' +
            encodeURIComponent('whatsapp:' + toNum) +
            '&From=' +
            encodeURIComponent('whatsapp:' + fromNum) +
            '&Body=' +
            encodeURIComponent('BekAI: ' + messageText),
        })
      }
    }

    // Telegram Notification
    if (parentUser.get('telegram_enabled') && parentUser.get('telegram_id')) {
      const botToken = $secrets.get('TELEGRAM_BOT_TOKEN')
      if (botToken) {
        $http.send({
          url: `https://api.telegram.org/bot${botToken}/sendMessage`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: parentUser.get('telegram_id'),
            text: 'BekAI: ' + messageText,
          }),
        })
      }
    }

    if (emailApiKey && parentUser.get('email')) {
      $http.send({
        url: 'https://api.resend.com/emails',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + emailApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'BekAI <onboarding@resend.dev>',
          to: parentUser.get('email'),
          subject: 'BekAI: Novo Relatório Disponível',
          html: `<div style="text-align: center; margin-bottom: 20px;"><img src="https://guardiao-digital-familiar-8c178.goskip.app/assets/logo-final-bekai-ac6d9.jpeg" alt="BekAI Logo" width="80" style="border-radius: 8px;" /></div><p>Olá ${parentUser.get('name') || ''},</p><p>Um novo relatório <strong>"${record.get('title')}"</strong> para ${child.get('name')} foi gerado e está disponível na sua biblioteca (Suporte à Decisão Clínica).</p><p><a href="https://guardiao-digital-familiar-8c178.goskip.app/dashboard/reports">Acessar Biblioteca de Relatórios</a></p>`,
        }),
      })
    }
  } catch (err) {
    console.log('Error generating notification/email: ', err)
  }

  e.next()
}, 'report_history')
