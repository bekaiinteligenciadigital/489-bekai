import pb from '@/lib/pocketbase/client'

export type HarmfulTopic = {
  id: string
  name: string
  slug: string
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  keywords_json?: string[]
  counter_keywords_json?: string[]
  platform_scope_json?: string[]
  enabled: boolean
}

export type CounterIntervention = {
  id: string
  child: string
  source_event?: string
  harmful_topic: string
  trigger_text?: string
  status: 'suggested' | 'reviewed' | 'delivered' | 'dismissed'
  delivery_channel?: 'dashboard' | 'whatsapp' | 'discord' | 'manual_review'
  recommendation_json?: {
    harmfulTopic?: string
    severity?: string
    urgency?: string
    triggerText?: string
    platform?: string
    counterNarrative?: string
    recommendedActions?: string[]
    contentSuggestions?: Array<{
      platform: string
      title: string
      description?: string
      url?: string
      thumbnail?: string
    }>
  }
  created: string
}

export const getHarmfulTopics = async (): Promise<HarmfulTopic[]> => {
  return pb.collection('harmful_topics').getFullList({
    sort: 'name',
  }) as Promise<HarmfulTopic[]>
}

export const saveHarmfulTopic = async (
  payload: Partial<HarmfulTopic> & {
    name: string
    slug: string
    severity: HarmfulTopic['severity']
  },
  id?: string,
) => {
  const normalizedPayload = {
    name: payload.name,
    slug: payload.slug,
    description: payload.description || '',
    severity: payload.severity,
    keywords_json: Array.isArray(payload.keywords_json) ? payload.keywords_json : [],
    counter_keywords_json: Array.isArray(payload.counter_keywords_json)
      ? payload.counter_keywords_json
      : [],
    platform_scope_json: Array.isArray(payload.platform_scope_json)
      ? payload.platform_scope_json
      : [],
    enabled: payload.enabled ?? true,
  }

  return id
    ? pb.collection('harmful_topics').update(id, normalizedPayload)
    : pb.collection('harmful_topics').create(normalizedPayload)
}

export const getChildCounterInterventions = async (
  childId: string,
): Promise<CounterIntervention[]> => {
  return pb.collection('counter_interventions').getFullList({
    filter: `child = "${childId}"`,
    sort: '-created',
    expand: 'harmful_topic,source_event',
  }) as Promise<CounterIntervention[]>
}

export const runChildCounterbalance = async (childId: string) => {
  return pb.send(`/backend/v1/children/${childId}/counterbalance/run`, {
    method: 'POST',
  }) as Promise<{
    success: boolean
    childId: string
    interventionsCreated: number
    interventions: Array<{
      id: string | null
      topic: string
      sourceEventId: string
      recommendation: CounterIntervention['recommendation_json']
    }>
  }>
}

export const previewCounterbalance = async (payload: {
  triggerText: string
  platform: string
  topicSlug?: string
}) => {
  return pb.send('/backend/v1/counterbalance/preview', {
    method: 'POST',
    body: payload,
  }) as Promise<{
    success: boolean
    matched: boolean
    recommendation?: CounterIntervention['recommendation_json']
    message?: string
  }>
}
