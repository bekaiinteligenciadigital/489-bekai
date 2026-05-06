import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'
import { EducationalAIChat } from './EducationalAIChat'

export default function Layout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-36 md:pb-8">
          <div className="max-w-6xl mx-auto h-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileNav />
      <EducationalAIChat />
    </div>
  )
}
