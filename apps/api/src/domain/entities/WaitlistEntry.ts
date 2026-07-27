export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'CONFIRMED' | 'EXPIRED'

export interface WaitlistEntry {
  id: string
  tenantId: string
  professionalId: string
  clientName: string
  clientPhone: string
  serviceIds: string[]
  preferredDate?: Date
  status: WaitlistStatus
  notifiedAt?: Date
  expiresAt?: Date
  createdAt: Date
}

export interface CreateWaitlistEntryInput {
  tenantId: string
  professionalId: string
  clientName: string
  clientPhone: string
  serviceIds: string[]
  preferredDate?: Date
}
