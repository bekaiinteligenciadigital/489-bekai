import pb from '@/lib/pocketbase/client'

export interface LeadData {
  name: string
  email: string
  interest_type?: string
  message?: string
}

export const createLead = (data: LeadData) => {
  return pb.collection('leads').create(data)
}
