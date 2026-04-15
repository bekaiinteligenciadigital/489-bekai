routerAdd(
  'POST',
  '/backend/v1/professional/link-patient',
  (e) => {
    const user = e.auth
    if (!user || user.get('role') !== 'professional') {
      throw new ForbiddenError('Apenas profissionais podem vincular pacientes.')
    }

    const body = e.requestInfo().body
    const accessCode = body.accessCode

    if (!accessCode) {
      throw new BadRequestError('Código de acesso é obrigatório.')
    }

    const currentPatients = $app.findRecordsByFilter(
      'children',
      `assigned_professional = "${user.id}"`,
      '',
      10,
      0,
    )
    if (currentPatients.length >= 10) {
      throw new BadRequestError('Limite de 10 pacientes atingido.')
    }

    try {
      const child = $app.findFirstRecordByFilter('children', `access_code = "${accessCode}"`)

      if (child.get('assigned_professional') === user.id) {
        return e.json(200, { success: true, message: 'Paciente já vinculado.' })
      }

      child.set('assigned_professional', user.id)
      child.set('access_code', '')
      $app.save(child)

      try {
        const notifCol = $app.findCollectionByNameOrId('notifications')
        const notif = new Record(notifCol)
        notif.set('user', user.id)
        notif.set('title', 'Novo Paciente Vinculado')
        notif.set('message', `O paciente ${child.get('name')} foi vinculado ao seu perfil.`)
        notif.set('priority', 'info')
        notif.set('link', `/reports/clinical/${child.id}`)
        $app.save(notif)
      } catch (err) {
        console.log('Erro ao criar notificacao de vinculo:', err)
      }

      return e.json(200, { success: true, childId: child.id })
    } catch (err) {
      throw new BadRequestError('Código de acesso inválido ou expirado.')
    }
  },
  $apis.requireAuth(),
)
