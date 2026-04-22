import pb from '@/lib/pocketbase/client'

export const syncSocialData = async (childId: string) => {
  return pb.send(`/backend/v1/children/${childId}/sync`, { method: 'POST' })
}

export interface SocialConnection {
  id: string
  child: string
  platform: string
  handle: string
  profile_url?: string
  connection_status: 'draft' | 'pending_auth' | 'connected' | 'sync_limited' | 'error' | 'revoked'
  auth_method?: 'manual' | 'oauth' | 'invite' | 'import'
  external_account_id?: string
  credential_reference?: string
  consent_scope_json?: unknown
  last_sync_at?: string
  last_sync_status?: 'idle' | 'running' | 'success' | 'partial' | 'error'
  last_error?: string
}

export interface SyncJob {
  id: string
  child: string
  trigger_source: 'manual' | 'scheduled' | 'consent' | 'system'
  status: 'queued' | 'running' | 'completed' | 'partial' | 'failed'
  started_at?: string
  finished_at?: string
  connections_total?: number
  connections_active?: number
  events_created?: number
  summary_json?: unknown
  error_message?: string
}

export const createSocialConnections = async (
  childId: string,
  platforms: Array<{ platform: string; handle: string }>,
) => {
  const unique = platforms.filter(
    (item, index, array) =>
      array.findIndex(
        (candidate) =>
          candidate.platform === item.platform &&
          candidate.handle.trim().toLowerCase() === item.handle.trim().toLowerCase(),
      ) === index,
  )

  return Promise.all(
    unique.map((item) =>
      pb.collection('social_connections').create({
        child: childId,
        platform: item.platform,
        handle: item.handle,
        connection_status: 'pending_auth',
        auth_method: 'manual',
        last_sync_status: 'idle',
      }),
    ),
  )
}

export const getChildSocialConnections = async (childId: string): Promise<SocialConnection[]> => {
  return pb.collection('social_connections').getFullList({
    filter: `child = "${childId}"`,
    sort: 'platform',
  }) as Promise<SocialConnection[]>
}

export const getChildSyncJobs = async (childId: string): Promise<SyncJob[]> => {
  return pb.collection('sync_jobs').getFullList({
    filter: `child = "${childId}"`,
    sort: '-created',
  }) as Promise<SyncJob[]>
}
