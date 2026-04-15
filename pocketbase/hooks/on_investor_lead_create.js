onRecordAfterCreateSuccess((e) => {
  const interestType = e.record.get('interest_type')

  if (interestType === 'investor') {
    const name = e.record.get('name')
    const email = e.record.get('email')
    const message = e.record.get('message')

    console.log(`[INVESTOR ALERT] New Investor Lead received from ${name} (${email})`)

    // Simulate webhook dispatch
    try {
      const payload = {
        text: `🚀 *New Investor Lead*\n*Name:* ${name}\n*Email:* ${email}\n*Message:* ${message}`,
      }

      const webhookUrl = $secrets.get('SLACK_WEBHOOK_URL') || 'https://httpbin.org/post'

      $http.send({
        url: webhookUrl,
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        timeout: 10,
      })
      console.log(`Webhook sent successfully for investor lead: ${email}`)
    } catch (err) {
      console.log(`Error sending webhook for investor lead:`, err)
    }
  }

  e.next()
}, 'leads')
