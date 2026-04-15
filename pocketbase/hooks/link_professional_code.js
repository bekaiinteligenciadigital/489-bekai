routerAdd(
  'POST',
  '/backend/v1/professional/link',
  (e) => {
    const user = e.auth
    if (!user) {
      throw new UnauthorizedError('Autenticação necessária.')
    }

    const body = e.requestInfo().body
    const childId = body.childId
    const inviteCode = body.inviteCode

    if (!childId || !inviteCode) {
      throw new BadRequestError('childId e inviteCode são obrigatórios.')
    }

    const child = $app.findRecordById('children', childId)
    if (child.get('parent') !== user.id) {
      throw new ForbiddenError('Você não tem permissão para alterar este perfil.')
    }

    let professional
    try {
      professional = $app.findFirstRecordByFilter(
        'Nascimento',
        `invite_code = "${inviteCode}" && role = 'professional'`,
      )
    } catch (err) {
      throw new BadRequestError('Código de profissional inválido ou não encontrado.')
    }

    const currentPatients = $app.findRecordsByFilter(
      'children',
      `assigned_professional = "${professional.id}"`,
      '',
      10,
      0,
    )
    if (currentPatients.length >= 10) {
      throw new BadRequestError('Este profissional já atingiu o limite de pacientes (10/10).')
    }

    if (child.get('assigned_professional') === professional.id) {
      return e.json(200, { success: true, message: 'Já vinculado.' })
    }

    child.set('assigned_professional', professional.id)
    $app.save(child)

    try {
      const notifCol = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(notifCol)
      notif.set('user', professional.id)
      notif.set('title', 'Novo Paciente Vinculado')
      notif.set('message', `O paciente ${child.get('name')} foi vinculado ao seu perfil.`)
      notif.set('priority', 'info')
      notif.set('link', `/reports/clinical/${child.id}`)
      $app.save(notif)
    } catch (err) {
      console.log('Erro ao criar notificacao de vinculo:', err)
    }

    return e.json(200, { success: true })
  },
  $apis.requireAuth(),
)
