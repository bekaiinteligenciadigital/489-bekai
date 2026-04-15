onRecordAfterCreateSuccess((e) => {
  const record = e.record
  if (record.get('interest_type') === 'professional') {
    console.log('New Professional Lead created:', record.get('email'))

    const webhookUrl = $secrets.get('WEBHOOK_URL')
    if (webhookUrl) {
      try {
        $http.send({
          url: webhookUrl,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'professional_lead',
            name: record.get('name'),
            email: record.get('email'),
            message: record.get('message'),
          }),
          timeout: 10,
        })
      } catch (err) {
        console.log('Error sending webhook for professional lead:', err)
      }
    }
  }
  e.next()
}, 'leads')
