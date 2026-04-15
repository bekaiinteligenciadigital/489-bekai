import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Bot,
  Library,
  Settings,
  LogOut,
  ShieldAlert,
  Activity,
  BookOpen,
  BookOpenText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import useFamilyStore from '@/stores/useFamilyStore'
import logoUrl from '@/assets/logo-final-bekai-ac6d9.jpeg'

export const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/analise', label: 'Mapeamento de Influência', icon: FileText },
  { path: '/scanner', label: 'Mapeador de Influência Digital', icon: Activity },
  { path: '/plano', label: 'Agente Autônomo', icon: Bot },
  { path: '/biblioteca', label: 'Biblioteca', icon: Library },
  { path: '/framework-inteligencia', label: 'Framework de Inteligência', icon: BookOpen },
  { path: '/manual', label: 'Manual BekAI', icon: BookOpenText },
  { path: '/config', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, plan } = useFamilyStore()

  return (
    <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground h-full border-r border-primary/20 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-primary-foreground/10">
        <div className="bg-secondary p-1 rounded-lg text-primary shadow-sm">
          <img src={logoUrl} alt="BekAI" className="w-7 h-7 rounded object-cover" />
        </div>
        <span className="font-serif font-bold text-2xl tracking-widest leading-tight">BekAI</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm',
              (location.pathname.startsWith(item.path) && item.path !== '/dashboard') ||
                location.pathname === item.path
                ? 'bg-secondary text-secondary-foreground shadow-sm'
                : 'hover:bg-primary-foreground/10',
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-primary-foreground/10 bg-primary/50">
        <div className="flex items-center gap-3 px-2 py-2 mb-3">
          <img
            src="https://img.usecurling.com/ppl/thumbnail?gender=male&seed=parent"
            className="w-10 h-10 rounded-full border-2 border-primary-foreground/20 shrink-0 object-cover"
            alt="Profile"
          />
          <div className="flex flex-col overflow-hidden min-w-0">
            <span className="font-bold text-sm truncate">{user?.name || 'Usuário'}</span>
            <span className="text-[10px] text-primary-foreground/70 uppercase tracking-wider font-semibold truncate">
              {plan}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground gap-3 h-9"
          asChild
        >
          <Link to="/">
            <LogOut className="w-4 h-4" />
            Sair
          </Link>
        </Button>
      </div>
    </aside>
  )
}
