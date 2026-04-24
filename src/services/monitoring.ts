import pb from '@/lib/pocketbase/client'

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

export interface OAuthStartResponse {
  success: boolean
  provider: string
  authorization_url: string
  scopes: string[]
  connection_id: string
}

export const syncSocialData = async (childId: string) => {
  return pb.send(`/backend/v1/children/${childId}/sync`, { method: 'POST' })
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

export const startOAuthConnection = async (connectionId: string) => {
  return pb.send(`/backend/v1/social-connections/${connectionId}/oauth/start`, {
    method: 'POST',
  }) as Promise<OAuthStartResponse>
}

export const completeOAuthConnection = async (
  connectionId: string,
  payload: {
    access_token?: string
    refresh_token?: string
    credential_reference?: string
    granted_scopes?: string[]
    external_account_id?: string
    profile_url?: string
    expires_at?: string
  },
) => {
  return pb.send(`/backend/v1/social-connections/${connectionId}/oauth/complete`, {
    method: 'POST',
    body: payload,
  })
}

export const connectSocialManually = async (
  connectionId: string,
  payload: {
    credential_reference: string
    access_token?: string
    refresh_token?: string
    granted_scopes?: string[]
    external_account_id?: string
    profile_url?: string
    expires_at?: string
    auth_method?: 'manual' | 'import'
  },
) => {
  return pb.send(`/backend/v1/social-connections/${connectionId}/connect/manual`, {
    method: 'POST',
    body: payload,
  })
}

export const disconnectSocialConnection = async (connectionId: string) => {
  return pb.send(`/backend/v1/social-connections/${connectionId}/disconnect`, {
    method: 'POST',
  })
}
