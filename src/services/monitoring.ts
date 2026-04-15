import pb from '@/lib/pocketbase/client'

export const syncSocialData = async (childId: string) => {
  return pb.send(`/backend/v1/children/${childId}/sync`, { method: 'POST' })
}
