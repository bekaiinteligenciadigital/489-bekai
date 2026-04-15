import { Bell, PhoneCall, ChevronLeft, Stethoscope, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { navItems } from './Sidebar'
import { NotificationBell } from './NotificationBell'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useEffect, useState } from 'react'
import { useRealtime } from '@/hooks/use-realtime'

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentRoute = navItems.find((item) => item.path === location.pathname)

  const { user } = useAuth()
  const [patientCount, setPatientCount] = useState(0)

  const fetchCount = async () => {
    if (user?.role === 'professional') {
      try {
        const records = await pb.collection('children').getFullList({
          filter: `assigned_professional = "${user.id}"`,
          fields: 'id',
        })
        setPatientCount(records.length)
      } catch (err) {
        console.error(err)
      }
    }
  }

  useEffect(() => {
    fetchCount()
  }, [user])

  useRealtime(
    'children',
    () => {
      fetchCount()
    },
    user?.role === 'professional',
  )

  // Custom title mappings for nested or unlisted routes
  let title = currentRoute?.label
  if (!title) {
    if (location.pathname === '/resultado') title = 'Resultado da Análise'
    else if (location.pathname === '/dashboard') title = 'BekAI'
    else if (location.pathname === '/dashboard/reports') title = 'Biblioteca de Relatórios'
    else title = 'BekAI'
  }

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b bg-background z-10 sticky top-0 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-1 text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
          title="Voltar"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <img src={logoUrl} alt="BekAI Logo" className="w-7 h-7 object-contain rounded-sm" />
        <h1 className="text-xl font-serif font-bold text-primary truncate pr-4">{title}</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        {user?.role === 'professional' && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-full text-xs font-bold shadow-sm"
            title="Limite de 10 pacientes"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{patientCount}/10 Pacientes</span>
          </div>
        )}
        <NotificationBell />
        <Button
          size="sm"
          className="hidden sm:flex gap-2 bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
          asChild
        >
          <Link to="/clinical-demo">
            <Stethoscope className="w-4 h-4" />
            BekAI Clinical
          </Link>
        </Button>
      </div>
    </header>
  )
}
