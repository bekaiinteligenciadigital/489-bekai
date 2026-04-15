import { ReactNode } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Brain, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MentorCardProps {
  title?: string
  children: ReactNode
  className?: string
}

export function MentorCard({ title = 'Mentoria Emocional', children, className }: MentorCardProps) {
  return (
    <Card
      className={cn(
        'border-indigo-200 shadow-md bg-gradient-to-br from-indigo-50/80 to-background overflow-hidden relative',
        className,
      )}
    >
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Brain className="w-32 h-32 text-indigo-900" />
      </div>

      <CardHeader className="pb-4 border-b border-indigo-100/50 bg-indigo-50/50">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src="https://img.usecurling.com/ppl/medium?gender=male&seed=12"
              alt="Avatar do Mentor"
              className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow-sm">
              <Brain className="w-3 h-3" />
            </div>
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-indigo-950 flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs font-medium text-indigo-700/80">
              Motor Analítico de Inteligência Multifocal
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 relative z-10">{children}</CardContent>

      <CardFooter className="bg-indigo-50/30 border-t border-indigo-100/50 p-4">
        <Alert className="bg-indigo-100/50 border-indigo-200/50 text-indigo-900 py-2.5">
          <Info className="w-4 h-4 text-indigo-600" />
          <AlertDescription className="text-[11px] leading-relaxed ml-2 font-medium">
            <strong>Aviso Ético:</strong> Este avatar oferece reflexões educativas e psicológicas e
            não substitui consulta médica ou diagnósticos clínicos.
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  )
}
