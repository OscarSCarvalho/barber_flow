export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'

export interface AppointmentService {
  serviceId: string
  priceSnapshot: number
  durationSnapshot: number
}

export interface Appointment {
  id: string
  tenantId: string
  professionalId: string
  clientId?: string
  clientName: string
  clientPhone: string
  startsAt: Date
  endsAt: Date
  status: AppointmentStatus
  cancelReason?: string
  services: AppointmentService[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateAppointmentInput {
  tenantId: string
  professionalId: string
  clientId?: string
  clientName: string
  clientPhone: string
  startsAt: Date
  endsAt: Date
  services: AppointmentService[]
}
