import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FileText, Bot, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export const mobileNavItems = [
  { path: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { path: '/analise', label: 'Analise', icon: FileText },
  { path: '/agente-autonomo', label: 'Agente', icon: Bot },
  { path: '/config', label: 'Config', icon: Settings },
]

export default function MobileNav() {
  const location = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-background border-t z-50 px-2 pt-2 pb-6 flex justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      {mobileNavItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path === '/analise' && location.pathname === '/resultado')
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl min-w-[4rem] transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary',
            )}
          >
            <div
              className={cn('p-1.5 rounded-full transition-colors', isActive && 'bg-primary/10')}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium text-center leading-tight line-clamp-1">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
