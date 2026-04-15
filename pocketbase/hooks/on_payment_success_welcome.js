onRecordAfterCreateSuccess((e) => {
  const record = e.record

  if (record.get('subscription_status') === 'active') {
    const planValue = record.get('active_plan')
    const planName = planValue === 'essencial_profissional' ? 'Profissional' : 'Essencial'
    const email = record.get('email')
    const name = record.get('name') || 'Usuário'

    const sgKey = $secrets.get('SENDGRID_API_KEY')

    if (sgKey && email) {
      try {
        $http.send({
          url: 'https://api.sendgrid.com/v3/mail/send',
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + sgKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: email }] }],
            from: { email: 'no-reply@bekai.com.br', name: 'BekAI' },
            subject: 'Bem-vindo ao BekAI - Pagamento Confirmado!',
            content: [
              {
                type: 'text/html',
                value: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://guardiao-digital-familiar-8c178.goskip.app/assets/logo-final-bekai-ac6d9.jpeg" alt="BekAI Logo" width="80" style="border-radius: 8px;" />
                  </div>
                  <h1 style="color: #0f172a;">Bem-vindo ao BekAI, ${name}!</h1>
                  <p>Seu pagamento foi confirmado com sucesso e sua conta já está ativada.</p>
                  <p>O seu plano selecionado foi: <strong>${planName}</strong>.</p>
                  <div style="margin: 30px 0;">
                    <a href="https://guardiao-digital-familiar-8c178.goskip.app/dashboard" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar Meu Dashboard</a>
                  </div>
                  <p>Se você tiver alguma dúvida, nossa equipe de suporte está à disposição.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                  <p style="font-size: 12px; color: #666;">BekAI - Guardião Digital Familiar</p>
                </div>
              `,
              },
            ],
          }),
          timeout: 10,
        })
      } catch (err) {
        console.log('Failed to send welcome email:', err)
      }
    }
  }

  e.next()
}, 'Nascimento')
