import React, { createContext, useContext, useState, useEffect } from 'react'
import type { AnalysisResult, ResultoInsights, ActionPlanResult } from '@/services/ai'
import pb from '@/lib/pocketbase/client'

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
  whatsapp_enabled?: boolean
  telegram_enabled?: boolean
  telegram_id?: string
}

export type PendingAnalysis = {
  childId: string
  platforms: string[]
  behaviors: string[]
  audioTranscript?: string
}

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
  setUser: (u: UserProfile | null) => void
  setPlan: (p: string, price?: number) => void
  setEssentialChildrenCount: (count: number) => void
  addChild: (c: Omit<ChildProfile, 'id' | 'createdAt'>) => void
  removeChild: (id: string) => void
  updateChild: (id: string, updates: Partial<ChildProfile>) => void
  setPendingAnalysis: (p: PendingAnalysis | null) => void
  setAIResults: (results: Partial<AIAgentResults>) => void
  clearChildren: () => void
}

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  essencial_familia: 'Essencial Família',
  essencial_profissional: 'Essencial Profissional',
  clinical_expert: 'BekAI Clinical Expert',
}

const PLAN_PRICES: Record<string, number> = {
  essencial_familia: 35.0,
  essencial_profissional: 50.0,
  clinical_expert: 150.0,
}

function calcAge(birthDate: string): number {
  if (!birthDate) return 0
  const birth = new Date(birthDate)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

function mapRecordToChild(r: any): ChildProfile {
  const platforms = Array.isArray(r.platforms)
    ? r.platforms
        .map((p: any) => (typeof p === 'string' ? p : p?.platform))
        .filter(Boolean)
    : []

  const profInfo = r.professional_info
  const healthProfessional: HealthProfessional | null = profInfo?.linked_prof_name
    ? {
        name: profInfo.linked_prof_name,
        clinic: profInfo.clinic || '',
        phone: profInfo.phone || '',
        email: profInfo.linked_prof_email || '',
      }
    : null

  return {
    id: r.id,
    name: r.name,
    age: calcAge(r.birth_date),
    platforms,
    createdAt: r.created
      ? new Date(r.created).toLocaleDateString('pt-BR')
      : 'Recentemente',
    hasProfessional: !!healthProfessional,
    healthProfessional,
  }
}

const FamilyContext = createContext<FamilyState | null>(null)

export const FamilyProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<UserProfile | null>(null)
  const [plan, setPlanState] = useState('')
  const [planPrice, setPlanPrice] = useState(0)
  const [essentialChildrenCount, setEssentialChildrenCount] = useState(1)
  const [childrenProfiles, setChildrenProfiles] = useState<ChildProfile[]>([])
  const [pendingAnalysis, setPendingAnalysis] = useState<PendingAnalysis | null>(null)
  const [aiResults, setAIResultsState] = useState<AIAgentResults>({
    analysisResult: null,
    resultInsights: null,
    actionPlanResult: null,
    analyzedChildId: null,
  })

  const loadFromPB = async (record: any) => {
    if (!record) {
      setUserState(null)
      setPlanState('')
      setPlanPrice(0)
      setChildrenProfiles([])
      return
    }

    setUserState({
      name: record.name || '',
      email: record.email || '',
      phone: record.phone || '',
      whatsapp_enabled: record.whatsapp_enabled || false,
      telegram_enabled: record.telegram_enabled || false,
      telegram_id: record.telegram_id || '',
    })

    const planId = record.active_plan || 'essencial_familia'
    setPlanState(PLAN_DISPLAY_NAMES[planId] || planId)
    setPlanPrice(PLAN_PRICES[planId] || 0)

    try {
      const kids = await pb.collection('children').getFullList({
        filter: `parent = "${record.id}"`,
        sort: 'name',
      })
      setChildrenProfiles(kids.map(mapRecordToChild))
      setEssentialChildrenCount(kids.length || 1)
    } catch (e) {
      console.error('Failed to load children from PocketBase', e)
    }
  }

  useEffect(() => {
    // Initial load
    loadFromPB(pb.authStore.record)

    // Keep in sync with auth changes (login / logout)
    const unsub = pb.authStore.onChange((_token, record) => {
      loadFromPB(record)
    })

    return () => unsub()
  }, [])

  const setAIResults = (results: Partial<AIAgentResults>) => {
    setAIResultsState((prev) => ({ ...prev, ...results }))
  }

  const clearChildren = () => setChildrenProfiles([])

  const setUser = (u: UserProfile | null) => setUserState(u)

  const setPlan = (p: string, price?: number) => {
    setPlanState(p)
    if (price !== undefined) setPlanPrice(price)
  }

  const addChild = (child: Omit<ChildProfile, 'id' | 'createdAt'>) => {
    const newChild: ChildProfile = {
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
    setChildrenProfiles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    )
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
