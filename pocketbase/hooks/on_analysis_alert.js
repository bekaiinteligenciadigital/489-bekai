onRecordAfterCreateSuccess((e) => {
  const record = e.record
  const riskLevel = String(record.get('risk_level') || '')
  const normalizedRisk = riskLevel.toLowerCase()

  if (normalizedRisk === 'critical' || normalizedRisk === 'high') {
    const childId = record.get('child')
    try {
      const child = $app.findRecordById('children', childId)
      const parentUser = $app.findRecordById('Nascimento', child.get('parent'))

      try {
        const notifCollection = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCollection)
        notif.set('user', parentUser.id)
        notif.set('title', 'Alerta BekAI de risco elevado')
        notif.set(
          'message',
          `Risco ${riskLevel} detectado para ${child.get('name')}. Revise imediatamente o painel clínico e as intervenções sugeridas.`,
        )
        notif.set('link', '/dashboard/reports')
        notif.set('is_read', false)
        notif.set('priority', normalizedRisk === 'critical' ? 'urgent' : 'warning')
        $app.save(notif)
      } catch (notifErr) {
        console.log('on_analysis_alert: failed to create internal notification', notifErr)
      }

      const messageText = `🚨 ALERTA BEKAI: Risco nível ${riskLevel} detectado no Suporte à Decisão Clínica de ${child.get('name')}. Acesse imediatamente seu painel para intervir e ver os detalhes.\n\nLink: https://guardiao-digital-familiar-8c178.goskip.app/dashboard/reports`

      // WhatsApp Notification
      if (parentUser.get('whatsapp_enabled') && parentUser.get('phone')) {
        const sid = $secrets.get('TWILIO_ACCOUNT_SID')
        const token = $secrets.get('TWILIO_AUTH_TOKEN')
        const fromNum = $secrets.get('TWILIO_WHATSAPP_NUMBER')
        if (sid && token && fromNum) {
          let toNum = parentUser.get('phone').replace(/\D/g, '')
          if (!toNum.startsWith('+')) toNum = '+' + toNum
          const response = $http.send({
            url: `https://${sid}:${token}@api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body:
              'To=' +
              encodeURIComponent('whatsapp:' + toNum) +
              '&From=' +
              encodeURIComponent('whatsapp:' + fromNum) +
              '&Body=' +
              encodeURIComponent(messageText),
          })
          if (response.statusCode < 200 || response.statusCode >= 300) {
            console.log(
              'on_analysis_alert: twilio whatsapp failed',
              response.statusCode,
              response.raw,
            )
          } else {
            console.log('on_analysis_alert: whatsapp sent to', toNum)
          }
        } else {
          console.log('on_analysis_alert: twilio secrets missing')
        }
      } else {
        console.log(
          'on_analysis_alert: whatsapp disabled or phone missing for parent',
          parentUser.id,
        )
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
              text: messageText,
            }),
          })
        }
      }
    } catch (err) {
      console.log('Error sending analysis alerts', err)
    }
  }

  e.next()
}, 'analysis_records')
