cronAdd('weekly_import', '0 0 * * 0', () => {
  try {
    const res = $http.send({
      url: 'https://api.crossref.org/works?query=psychiatry+psychology+neuroscience+pediatrics&select=title,URL,abstract&rows=10',
      method: 'GET',
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      console.log('cron_scientific_import: Failed to fetch from external API')
      return
    }

    const items = res.json?.message?.items || []
    const libCollection = $app.findCollectionByNameOrId('scientific_library')

    items.forEach((item) => {
      const url = item.URL || ''
      const title = item.title && item.title.length > 0 ? item.title[0] : ''
      let summary = item.abstract ? item.abstract.replace(/(<([^>]+)>)/gi, '') : ''

      if (!url || !title) return
      if (!url.startsWith('http')) return

      // Deduplication by checking existing link
      try {
        $app.findFirstRecordByData('scientific_library', 'content_link', url)
        return // Exists, skip
      } catch (_) {
        // Not found, proceed
      }

      // Keyword mapping for Axis Categorization
      let axis = 'Psiquiatria'
      const text = (title + ' ' + summary).toLowerCase()
      if (text.includes('psychology') || text.includes('psicologia')) axis = 'Psicologia'
      else if (text.includes('neuro') || text.includes('brain')) axis = 'Neurociência'
      else if (text.includes('psychoanalysis') || text.includes('psicanálise')) axis = 'Psicanálise'
      else if (text.includes('nlp') || text.includes('pnl') || text.includes('linguistic'))
        axis = 'PNL'

      const record = new Record(libCollection)
      record.set('title', title.substring(0, 250))
      record.set('content_link', url)
      record.set('summary', summary.substring(0, 500))
      record.set('axis', axis)
      record.set('clinical_status', 'Base Clínica')
      record.set('evidence_level', 'Relato')

      try {
        $app.save(record)
      } catch (e) {
        console.log('cron_scientific_import: Error saving record', e)
      }
    })
  } catch (err) {
    console.log('cron_scientific_import: Critical error', err)
  }
})
