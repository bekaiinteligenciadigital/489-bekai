import { useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'

export function PendingInviteLinker() {
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const linkPending = async () => {
      const code = sessionStorage.getItem('pendingInviteCode')
      if (!code || !user || user.role === 'professional') return

      try {
        const children = await pb.collection('children').getFullList({
          filter: `parent = "${user.id}" && assigned_professional = ""`,
        })

        let linkedCount = 0
        for (const child of children) {
          await pb.send('/backend/v1/professional/link', {
            method: 'POST',
            body: JSON.stringify({ childId: child.id, inviteCode: code }),
            headers: { 'Content-Type': 'application/json' },
          })
          linkedCount++
        }

        if (linkedCount > 0) {
          sessionStorage.removeItem('pendingInviteCode')
          toast({
            title: 'Vinculação Concluída',
            description: `Seus perfis foram vinculados ao profissional com sucesso.`,
          })
        }
      } catch (err) {
        console.error('Erro ao vincular profissional:', err)
      }
    }

    linkPending()
  }, [user, toast])

  return null
}
