import pb from '@/lib/pocketbase/client'

export const getNotifications = () => {
  return pb.collection('notifications').getFullList({ sort: '-created' })
}

export const markAsRead = (id: string) => {
  return pb.collection('notifications').update(id, { is_read: true })
}

export const markAllAsRead = async () => {
  const unread = await pb.collection('notifications').getFullList({ filter: 'is_read = false' })
  await Promise.all(
    unread.map((n) => pb.collection('notifications').update(n.id, { is_read: true })),
  )
}
