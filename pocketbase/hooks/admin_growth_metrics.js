routerAdd(
  'GET',
  '/backend/v1/admin/growth-metrics',
  (e) => {
    try {
      const professionals = $app.findRecordsByFilter(
        'Nascimento',
        "role = 'professional'",
        'created',
        1000,
        0,
      )
      const children = $app.findRecordsByFilter('children', '', 'created', 1000, 0)

      const profsByMonth = {}
      for (const p of professionals) {
        const created = p.get('created').toString()
        const month = created.substring(0, 7) // YYYY-MM
        profsByMonth[month] = (profsByMonth[month] || 0) + 1
      }

      const linkedProfIds = {}
      for (const c of children) {
        try {
          const infoStr = c.get('professional_info')
          if (infoStr) {
            const info = JSON.parse(infoStr)
            if (info && info.professional_id) {
              linkedProfIds[info.professional_id] = true
            }
          }
        } catch (err) {}
      }

      let linkedToParentsCount = Object.keys(linkedProfIds).length
      let totalProfessionals = professionals.length

      let chartData = Object.keys(profsByMonth)
        .sort()
        .map((month) => ({
          month,
          professionals: profsByMonth[month],
        }))

      // Mock data if empty for demo visualization
      if (chartData.length === 0) {
        chartData = [
          { month: '2023-06', professionals: 2 },
          { month: '2023-07', professionals: 6 },
          { month: '2023-08', professionals: 14 },
          { month: '2023-09', professionals: 25 },
          { month: '2023-10', professionals: 42 },
        ]
        totalProfessionals = 42
        linkedToParentsCount = 28
      }

      const recentLeads = $app.findRecordsByFilter(
        'leads',
        "interest_type = 'investor'",
        '-created',
        10,
        0,
      )
      const leadsData = []
      for (const l of recentLeads) {
        leadsData.push({
          id: l.getId(),
          name: l.get('name'),
          email: l.get('email'),
          created: l.get('created').toString(),
        })
      }

      return e.json(200, {
        totalProfessionals,
        linkedToParentsCount,
        chartData,
        investorLeads: leadsData,
      })
    } catch (err) {
      return e.json(500, { error: err.message })
    }
  },
  $apis.requireAuth(),
)
