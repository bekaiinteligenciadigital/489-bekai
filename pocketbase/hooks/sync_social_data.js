routerAdd(
  'POST',
  '/backend/v1/children/{id}/sync',
  (e) => {
    const id = e.request.pathValue('id')
    const child = $app.findRecordById('children', id)

    const hasInstaKey = $secrets.has('INSTAGRAM_API_KEY')
    const hasTiktokKey = $secrets.has('TIKTOK_API_KEY')

    if (!hasInstaKey && !hasTiktokKey) {
      child.set('monitoring_status', 'pending_credentials')
      console.log('Sync simulated: Pending Credentials for child ' + id)
    } else {
      child.set('monitoring_status', 'active')
    }

    child.set('last_sync_at', new Date().toISOString())
    $app.save(child)

    // Generate mock events to test stratification
    const platformsRaw = child.get('platforms')
    let platforms = []
    try {
      platforms = typeof platformsRaw === 'string' ? JSON.parse(platformsRaw) : platformsRaw
    } catch (err) {}

    if (!Array.isArray(platforms) || platforms.length === 0) {
      platforms = ['Instagram', 'TikTok']
    }
    const platform = platforms[Math.floor(Math.random() * platforms.length)]

    const eventsCol = $app.findCollectionByNameOrId('digital_events')

    // Create mock digital event with risk scores
    const evt = new Record(eventsCol)
    evt.set('child', child.id)
    evt.set('platform', platform)
    evt.set('event_type', 'content_consumption')
    evt.set(
      'content_summary',
      'Simulated interaction com conteúdo de formato curto (' + platform + ').',
    )
    evt.set('timestamp', new Date().toISOString())

    // Simulated stratification themes matching content_risk_scores
    evt.set('risk_scores', {
      anxiety: Math.floor(Math.random() * 60) + 20,
      violence: Math.floor(Math.random() * 40),
      sexualization: Math.floor(Math.random() * 30),
      nihilism: Math.floor(Math.random() * 70) + 10,
      self_harm: Math.floor(Math.random() * 15),
    })

    $app.save(evt)

    return e.json(200, {
      success: true,
      status: child.get('monitoring_status'),
      last_sync_at: child.get('last_sync_at'),
    })
  },
  $apis.requireAuth(),
)
