import React, { createContext, useContext, useState } from 'react'
import type { AnalysisResult, ResultoInsights, ActionPlanResult } from '@/services/ai'

export type HealthProfessional = {
  name: string
  clinic: string
  phone: string
  email: string
}

export type ChildProfile = {
  id: string
  name: string
  age: number
  platforms: string[]
  createdAt: string
  hasProfessional?: boolean
  healthProfessional?: HealthProfessional | null
}

export type UserProfile = {
  name: string
  email: string
  phone: string
}

export type PendingAnalysis = {
  childId: string
  platforms: string[]
  behaviors: string[]
  audioTranscript?: string
}

// Resultados dos Agentes de IA
export type AIAgentResults = {
  analysisResult: AnalysisResult | null
  resultInsights: ResultoInsights | null
  actionPlanResult: ActionPlanResult | null
  analyzedChildId: string | null
}

interface FamilyState {
  user: UserProfile | null
  plan: string
  planPrice: number
  essentialChildrenCount: number
  childrenProfiles: ChildProfile[]
  pendingAnalysis: PendingAnalysis | null
  aiResults: AIAgentResults
  setUser: (u: UserProfile) => void
  setPlan: (p: string, price?: number) => void
  setEssentialChildrenCount: (count: number) => void
  addChild: (c: Omit<ChildProfile, 'id' | 'createdAt'>) => void
  removeChild: (id: string) => void
  updateChild: (id: string, updates: Partial<ChildProfile>) => void
  setPendingAnalysis: (p: PendingAnalysis | null) => void
  setAIResults: (results: Partial<AIAgentResults>) => void
  clearChildren: () => void
}

const FamilyContext = createContext<FamilyState | null>(null)

export const FamilyProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>({
    name: 'Carlos Silva',
    email: 'carlos.silva@exemplo.com',
    phone: '(11) 99999-9999',
  })
  const [plan, setPlanState] = useState('Plano Diamond')
  const [planPrice, setPlanPrice] = useState(89.9)
  const [essentialChildrenCount, setEssentialChildrenCount] = useState(1)
  const [childrenProfiles, setChildrenProfiles] = useState<ChildProfile[]>([
    {
      id: '1',
      name: 'João Pedro',
      age: 14,
      platforms: ['TikTok', 'YouTube'],
      createdAt: '2 meses atrás',
      hasProfessional: true,
      healthProfessional: {
        name: 'Dra. Ana Souza',
        clinic: 'Clínica Mente Sã',
        phone: '(11) 98888-7777',
        email: 'ana.souza@mentesa.com.br',
      },
    },
  ])
  const [pendingAnalysis, setPendingAnalysis] = useState<PendingAnalysis | null>(null)
  const [aiResults, setAIResultsState] = useState<AIAgentResults>({
    analysisResult: null,
    resultInsights: null,
    actionPlanResult: null,
    analyzedChildId: null,
  })

  const setAIResults = (results: Partial<AIAgentResults>) => {
    setAIResultsState((prev) => ({ ...prev, ...results }))
  }

  const clearChildren = () => {
    setChildrenProfiles([])
  }

  const setPlan = (p: string, price?: number) => {
    setPlanState(p)
    if (price !== undefined) {
      setPlanPrice(price)
    }
  }

  const addChild = (child: Omit<ChildProfile, 'id' | 'createdAt'>) => {
    const newChild = {
      ...child,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: 'Agora mesmo',
    }
    setChildrenProfiles((prev) => [...prev, newChild])
  }

  const removeChild = (id: string) => {
    setChildrenProfiles((prev) => prev.filter((c) => c.id !== id))
  }

  const updateChild = (id: string, updates: Partial<ChildProfile>) => {
    setChildrenProfiles((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  return (
    <FamilyContext.Provider
      value={{
        user,
        plan,
        planPrice,
        essentialChildrenCount,
        childrenProfiles,
        pendingAnalysis,
        aiResults,
        setUser,
        setPlan,
        setEssentialChildrenCount,
        addChild,
        removeChild,
        updateChild,
        setPendingAnalysis,
        setAIResults,
        clearChildren,
      }}
    >
      {children}
    </FamilyContext.Provider>
  )
}

export default function useFamilyStore() {
  const context = useContext(FamilyContext)
  if (!context) throw new Error('useFamilyStore must be used within FamilyProvider')
  return context
}
