export interface Service {
  id: string
  name: string
  durationMinutes: number
  priceInCents: number
  isActive: boolean
}

export interface Professional {
  id: string
  userId: string
  bio?: string
  avatarUrl?: string
  user: { name: string; email: string }
}

export type SlotStatus = 'AVAILABLE' | 'BLOCKED'
export type BlockReason = 'APPOINTMENT' | 'MANUAL_BLOCK' | 'OUTSIDE_HOURS' | 'LUNCH'

export interface TimeSlot {
  startsAt: string
  endsAt: string
  status: SlotStatus
  blockReason?: BlockReason
}

export interface AvailabilityResponse {
  slots: TimeSlot[]
  totalDurationMinutes: number
  notWorking: boolean
}

export interface Appointment {
  id: string
  professionalId: string
  clientName: string
  clientPhone: string
  startsAt: string
  endsAt: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'
  services: Array<{ serviceId: string; priceSnapshot: number; durationSnapshot: number }>
}
