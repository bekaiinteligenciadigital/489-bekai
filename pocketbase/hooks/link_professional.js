routerAdd(
  'POST',
  '/backend/v1/link-professional',
  (e) => {
    const body = e.requestInfo().body
    const childId = body.child_id
    const inviteCode = body.invite_code

    if (!childId || !inviteCode) {
      throw new BadRequestError('child_id and invite_code are required')
    }

    const child = $app.findRecordById('children', childId)

    let professionalId = null
    let inviteRecord = null

    try {
      inviteRecord = $app.findFirstRecordByData('patient_invites', 'invite_code', inviteCode)
      if (inviteRecord.get('status') === 'used') {
        throw new BadRequestError('Este código de convite já foi utilizado.')
      }
      professionalId = inviteRecord.get('professional')
    } catch (err) {
      // Fallback to legacy static invite code on Nascimento
      try {
        const prof = $app.findFirstRecordByData('Nascimento', 'invite_code', inviteCode)
        professionalId = prof.id
      } catch (err2) {
        throw new BadRequestError('Código de convite inválido.')
      }
    }

    child.set('assigned_professional', professionalId)
    $app.save(child)

    if (inviteRecord) {
      inviteRecord.set('status', 'used')
      $app.save(inviteRecord)
    }

    // Automated Specialist Notification
    try {
      const notifCollection = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifCollection)
      notif.set('user', professionalId)
      notif.set('title', 'Novo Paciente Vinculado')
      const dateStr = new Date().toLocaleDateString('pt-BR')
      notif.set(
        'message',
        `O paciente ${child.get('name')} foi cadastrado e vinculado ao seu painel em ${dateStr}.`,
      )
      notif.set('link', `/reports/clinical/${child.id}`)
      notif.set('priority', 'info')
      notif.set('is_read', false)
      $app.save(notif)
    } catch (err) {
      console.log('Error creating notification', err)
    }

    // Simulate external trigger as requested (Email/WhatsApp)
    console.log(
      `[BekAI System] Triggered Branded Email/WhatsApp notification for Professional ID: ${professionalId} - Patient: ${child.get('name')} linked. Include BekAI Logo and Direct Link: /reports/clinical/${child.id}`,
    )

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
