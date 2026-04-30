function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.indexOf('55') !== 0) digits = '55' + digits
  return '+' + digits
}

function hasSecret(name) {
  try {
    if ($secrets.has(name)) return true
  } catch (_) {}

  try {
    return !!$secrets.get(name)
  } catch (_) {
    return false
  }
}

function getTwilioSecretsStatus() {
  return {
    hasSid: hasSecret('TWILIO_ACCOUNT_SID'),
    hasToken: hasSecret('TWILIO_AUTH_TOKEN'),
    hasFromNumber: hasSecret('TWILIO_WHATSAPP_NUMBER'),
  }
}

function sendWhatsAppMessage(toPhone, messageText) {
  const secretsStatus = getTwilioSecretsStatus()

  if (!secretsStatus.hasSid || !secretsStatus.hasToken || !secretsStatus.hasFromNumber) {
    throw new BadRequestError('Credenciais Twilio ausentes no servidor.')
  }

  const sid = $secrets.get('TWILIO_ACCOUNT_SID')
  const token = $secrets.get('TWILIO_AUTH_TOKEN')
  const fromNum = $secrets.get('TWILIO_WHATSAPP_NUMBER')

  const response = $http.send({
    url: 'https://' + sid + ':' + token + '@api.twilio.com/2010-04-01/Accounts/' + sid + '/Messages.json',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:
      'To=' +
      encodeURIComponent('whatsapp:' + toPhone) +
      '&From=' +
      encodeURIComponent('whatsapp:' + fromNum) +
      '&Body=' +
      encodeURIComponent(messageText),
    timeout: 30,
  })

  return {
    ok: response.statusCode >= 200 && response.statusCode < 300,
    statusCode: response.statusCode,
    raw: response.raw || '',
    json: response.json || null,
  }
}

routerAdd(
  'GET',
  '/backend/v1/notifications/whatsapp/diagnostics',
  (e) => {
    const authRecord = e.auth
    if (!authRecord) throw new ForbiddenError('Autenticacao obrigatoria.')

    const phone = String(authRecord.get('phone') || '')
    const whatsappEnabled = !!authRecord.get('whatsapp_enabled')
    const normalizedPhone = normalizePhone(phone)
    const secretsStatus = getTwilioSecretsStatus()

    return e.json(200, {
      success: true,
      whatsappEnabled,
      phone,
      normalizedPhone,
      twilio: secretsStatus,
      ready:
        whatsappEnabled &&
        !!normalizedPhone &&
        secretsStatus.hasSid &&
        secretsStatus.hasToken &&
        secretsStatus.hasFromNumber,
    })
  },
  $apis.requireAuth(),
)

routerAdd(
  'POST',
  '/backend/v1/notifications/whatsapp/test',
  (e) => {
    const authRecord = e.auth
    if (!authRecord) throw new ForbiddenError('Autenticacao obrigatoria.')

    const phone = String(authRecord.get('phone') || '')
    const normalizedPhone = normalizePhone(phone)
    const whatsappEnabled = !!authRecord.get('whatsapp_enabled')
    const secretsStatus = getTwilioSecretsStatus()

    if (!whatsappEnabled) {
      throw new BadRequestError('Ative o WhatsApp nas configuracoes antes de testar.')
    }

    if (!normalizedPhone) {
      throw new BadRequestError('Cadastre um numero valido com codigo do pais (ex: +55).')
    }

    const messageText =
      'Teste BekAI: se voce recebeu esta mensagem, o canal de notificacao por WhatsApp esta funcionando corretamente.'

    const delivery = sendWhatsAppMessage(normalizedPhone, messageText)

    return e.json(delivery.ok ? 200 : 502, {
      success: delivery.ok,
      phone,
      normalizedPhone,
      whatsappEnabled,
      twilio: secretsStatus,
      providerStatus: delivery.statusCode,
      providerResponse: delivery.raw,
      hint: delivery.ok
        ? 'Mensagem enviada. Se estiver usando Twilio Sandbox, confirme se este numero entrou no sandbox.'
        : 'Verifique no Twilio se o numero entrou no sandbox e se a janela de envio esta valida.',
    })
  },
  $apis.requireAuth(),
)
