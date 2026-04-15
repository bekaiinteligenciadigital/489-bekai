import pb from '@/lib/pocketbase/client'

export const getLibraryItems = async () => {
  return pb.collection('scientific_library').getFullList({
    sort: '-created',
  })
}

export const getCreators = async () => {
  return pb.collection('creators').getFullList({
    sort: '-created',
  })
}

export const getPendingPlans = async () => {
  return pb.collection('action_plans').getFullList({
    filter: 'status = "pending"',
    sort: '-created',
  })
}

export const updatePlanStatus = async (id: string, status: string) => {
  return pb.collection('action_plans').update(id, { status })
}
