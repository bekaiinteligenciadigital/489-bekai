import pb from '@/lib/pocketbase/client'

export const getReportData = async (childId: string) => {
  const child = await pb
    .collection('children')
    .getOne(childId, { expand: 'parent' })
    .catch(() => null)
  const analyses = await pb
    .collection('analysis_records')
    .getFullList({ filter: `child="${childId}"`, sort: '-created' })
    .catch(() => [])
  const assessments = await pb
    .collection('assessments')
    .getFullList({ filter: `child="${childId}"`, sort: '-created' })
    .catch(() => [])
  const riskProfiles = await pb
    .collection('risk_profiles')
    .getFullList({ filter: `assessment.child="${childId}"`, sort: '-created' })
    .catch(() => [])
  const safetyFlags = await pb
    .collection('safety_flags')
    .getFullList({ filter: `risk_profile.assessment.child="${childId}"`, sort: '-created' })
    .catch(() => [])
  const digitalEvents = await pb
    .collection('digital_events')
    .getFullList({ filter: `child="${childId}"`, sort: '-timestamp' })
    .catch(() => [])
  const library = await pb
    .collection('scientific_library')
    .getFullList()
    .catch(() => [])
  const clinicalPlans = await pb
    .collection('clinical_plans')
    .getFullList({ filter: `child="${childId}"`, sort: '-created' })
    .catch(() => [])

  const bundles = await pb
    .collection('recommendation_bundles')
    .getFullList({ filter: `child="${childId}"`, sort: '-created' })
    .catch(() => [])
  let scripts: any[] = []
  let items: any[] = []
  if (bundles.length > 0) {
    scripts = await pb
      .collection('parental_scripts')
      .getFullList({ filter: `bundle="${bundles[0].id}"` })
      .catch(() => [])
    items = await pb
      .collection('recommendation_items')
      .getFullList({ filter: `bundle="${bundles[0].id}"` })
      .catch(() => [])
  }

  return {
    child,
    analyses,
    assessments,
    riskProfiles,
    safetyFlags,
    digitalEvents,
    library,
    clinicalPlans,
    scripts,
    items,
  }
}
