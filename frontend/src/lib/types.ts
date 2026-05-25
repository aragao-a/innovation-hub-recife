export type UserRole = 'researcher' | 'institution' | 'business' | 'investor'

export type ResearchStatus = 'draft' | 'pending_approval' | 'approved' | 'hidden'

export type MaturityLevel = 'basic' | 'developing' | 'ready'

export type ContactStatus = 'pending' | 'accepted' | 'rejected'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  institution: string
  bio: string
  avatar?: string
  created: string
}

export interface Institution {
  id: string
  name: string
  type: string
  city: string
  admin: string
  created: string
}

export interface Research {
  id: string
  title: string
  area: string
  keywords: string
  technical_description: string
  simplified_description: string
  status: ResearchStatus
  maturity_level: MaturityLevel
  ods_tags: string
  researcher: string
  institution: string
  view_count: number
  contact_count: number
  created: string
  updated: string
  expand?: {
    researcher?: User
    institution?: Institution
  }
}

export interface ContactRequest {
  id: string
  research: string
  organization: string
  researcher: string
  status: ContactStatus
  created: string
  expand?: {
    research?: Research
    organization?: User
    researcher?: User
  }
}

export interface Message {
  id: string
  contact_request: string
  sender: string
  content: string
  read: boolean
  created: string
  expand?: {
    sender?: User
  }
}
