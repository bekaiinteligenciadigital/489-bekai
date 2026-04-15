import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react'

interface TourContextType {
  isActive: boolean
  currentStep: number
  startTour: () => void
  stopTour: () => void
  nextStep: () => void
  prevStep: () => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    // Start tour on very first access
    const hasSeenTour = localStorage.getItem('kairos_tour_completed')
    if (!hasSeenTour) {
      setIsActive(true)
      localStorage.setItem('kairos_tour_completed', 'true')
    }
  }, [])

  const startTour = useCallback(() => {
    setCurrentStep(0)
    setIsActive(true)
  }, [])

  const stopTour = useCallback(() => {
    setIsActive(false)
  }, [])

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
  }, [])

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }, [])

  return (
    <TourContext.Provider
      value={{ isActive, currentStep, startTour, stopTour, nextStep, prevStep }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) throw new Error('useTour must be used within TourProvider')
  return context
}
