import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BookOpen, Play, Info } from 'lucide-react'
import { useTour } from './TourContext'
import { SUBSCRIBER_TOUR_STEPS, PROFESSIONAL_TOUR_STEPS } from './TourData'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

// Tracks specific route visits to update the Journey Checklist dynamically
export function RouteTracker() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname.includes('/biblioteca')) {
      localStorage.setItem('kairos_visited_biblioteca', 'true')
      window.dispatchEvent(new Event('kairos_journey_update'))
    }
    if (location.pathname.includes('/parent/dashboard')) {
      localStorage.setItem('kairos_visited_parent_dashboard', 'true')
      window.dispatchEvent(new Event('kairos_journey_update'))
    }
  }, [location])

  return null
}

export function TourUI() {
  const { user } = useAuth()
  const isProf = user?.role === 'professional'
  const tourSteps = isProf ? PROFESSIONAL_TOUR_STEPS : SUBSCRIBER_TOUR_STEPS

  const { isActive, currentStep, startTour, stopTour, nextStep, prevStep } = useTour()
  const [sheetOpen, setSheetOpen] = useState(false)

  // DOM Highlighting Logic
  useEffect(() => {
    if (!isActive) return

    const step = tourSteps[currentStep]
    let el: HTMLElement | null = null

    if (step?.target) {
      el = document.querySelector(step.target) as HTMLElement
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        // Apply classes safely to pop it above the backdrop
        el.classList.add(
          'z-[101]',
          'relative',
          'ring-4',
          'ring-primary',
          'ring-offset-2',
          'bg-card',
          'rounded-lg',
        )
      }
    }

    return () => {
      if (el) {
        el.classList.remove(
          'z-[101]',
          'relative',
          'ring-4',
          'ring-primary',
          'ring-offset-2',
          'bg-card',
          'rounded-lg',
        )
      }
    }
  }, [isActive, currentStep])

  const handleNext = () => {
    if (currentStep === tourSteps.length - 1) {
      stopTour()
    } else {
      nextStep()
    }
  }

  return (
    <>
      <RouteTracker />

      {/* Floating Action Button (Glossary / Help) */}
      <Button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-xl z-[90] bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center transition-transform hover:scale-105"
      >
        <BookOpen className="w-6 h-6" />
      </Button>

      {/* Glossary Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[90vw] sm:w-[450px] overflow-y-auto border-l-0 shadow-2xl">
          <SheetHeader className="mb-6 mt-4">
            <SheetTitle className="text-2xl font-serif text-primary">Glossário Kairós</SheetTitle>
            <SheetDescription>
              Entenda os termos técnicos e conceitos utilizados na metodologia de literacia digital.
            </SheetDescription>
            <Button
              onClick={() => {
                setSheetOpen(false)
                startTour()
              }}
              className="w-full mt-4 gap-2"
            >
              <Play className="w-4 h-4" /> Iniciar Tour Guiado
            </Button>
          </SheetHeader>

          <div className="space-y-6 pb-8">
            {tourSteps.slice(1).map((step, i) => (
              <div key={i} className="space-y-1.5 border-b pb-4 last:border-0">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-foreground">
                  <Info className="w-4 h-4 text-primary shrink-0" />
                  {step.title}
                  {step.target && (
                    <Badge variant="outline" className="text-[10px] bg-primary/5 border-primary/20">
                      Card Interativo
                    </Badge>
                  )}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed ml-6">{step.content}</p>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Active Tour Overlay */}
      {isActive && tourSteps[currentStep] && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] pointer-events-auto" />

          {/* Tour Dialog Card - positioned safely bottom-right to not cover highlighted elements */}
          <div className="fixed z-[102] bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-24 w-[90%] max-w-sm animate-in slide-in-from-bottom-8 duration-300">
            <Card className="shadow-2xl border-primary/50">
              <CardHeader className="pb-3 bg-primary/5 border-b border-primary/10">
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Info className="w-5 h-5" />
                  {tourSteps[currentStep].title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm leading-relaxed text-foreground">
                  {tourSteps[currentStep].content}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-muted/20 border-t pt-3 pb-3">
                <Button variant="ghost" size="sm" onClick={stopTour} className="text-xs">
                  Pular Tour
                </Button>
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground mr-2">
                    {currentStep + 1} / {tourSteps.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentStep === 0}
                    onClick={prevStep}
                  >
                    Voltar
                  </Button>
                  <Button size="sm" onClick={handleNext}>
                    {currentStep === tourSteps.length - 1 ? 'Finalizar' : 'Próximo'}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
