import pb from '@/lib/pocketbase/client'

export interface Child {
  id: string
  name: string
  birth_date: string
  parent: string
  platforms?: Array<{ platform: string; handle: string }>
  consent_accepted?: boolean
  consent_timestamp?: string
  consent_signature_name?: string
  monitoring_status?: string
  last_sync_at?: string
  access_code?: string
  assigned_professional?: string
}

export const acceptConsent = async (childId: string, signatureName: string) => {
  return pb.collection('children').update(childId, {
    consent_accepted: true,
    consent_timestamp: new Date().toISOString(),
    consent_signature_name: signatureName,
    monitoring_status: 'active',
  })
}

export const updateLastReport = async (childId: string) => {
  return pb.collection('children').update(childId, {
    last_report_generated: new Date().toISOString(),
  })
}

export interface DigitalEvent {
  id: string
  child: string
  platform: string
  event_type: string
  content_summary: string
  timestamp: string
}

export interface AnalysisRecord {
  id: string
  child: string
  dq_score: number
  risk_level: string
  insights_summary: string
  behavior_patterns: any
  created: string
}

export interface ScientificRef {
  id: string
  title: string
  axis: string
  clinical_status: string
  summary: string
}

export const getMyChildren = async (): Promise<Child[]> => {
  if (!pb.authStore.model?.id) return []
  return pb.collection('children').getFullList({
    filter: `parent = "${pb.authStore.model.id}"`,
    sort: 'name',
    expand: 'assigned_professional',
  })
}

export const getChildDigitalEvents = async (childId: string): Promise<DigitalEvent[]> => {
  return pb.collection('digital_events').getFullList({
    filter: `child = "${childId}"`,
    sort: '-timestamp',
  })
}

export const getChildAnalysis = async (childId: string): Promise<AnalysisRecord[]> => {
  return pb.collection('analysis_records').getFullList({
    filter: `child = "${childId}"`,
    sort: '-created',
  })
}

export const getScientificLibrary = async (): Promise<ScientificRef[]> => {
  return pb.collection('scientific_library').getFullList({
    sort: '-created',
  })
}

export const inviteProfessional = async (
  childId: string,
  data: { name: string; email: string; specialty: string; council_id: string },
) => {
  const tempPassword = `Krs@${Math.random().toString(36).slice(-4)}${Math.floor(Math.random() * 100)}`
  let profId = ''

  try {
    const prof = await pb.collection('Nascimento').create({
      email: data.email,
      password: tempPassword,
      passwordConfirm: tempPassword,
      name: data.name,
      role: 'professional',
      specialty: data.specialty,
      council_id: data.council_id,
      emailVisibility: true,
    })
    profId = prof.id
  } catch (e: any) {
    console.error('Failed to create professional user. They might already exist.', e)
    // If fails, we can still link the email in the JSON
  }

  const child = await pb.collection('children').getOne(childId)
  const currentInfo = child.professional_info || {}

  await pb.collection('children').update(childId, {
    professional_info: {
      ...currentInfo,
      linked_prof_id: profId,
      linked_prof_email: data.email,
      linked_prof_name: data.name,
      status: 'provisional',
      temp_password: tempPassword,
    },
  })

  return { tempPassword, profId, email: data.email }
}
