import { Appointment, CreateAppointmentInput, AppointmentStatus } from '../entities/Appointment'

export interface FindConflictsInput {
  professionalId: string
  startsAt: Date
  endsAt: Date
  excludeId?: string
}

export interface ListAppointmentsFilter {
  tenantId: string
  professionalId?: string
  clientId?: string
  dateFrom?: Date
  dateTo?: Date
  status?: AppointmentStatus
}

export interface FinancialSummary {
  totalRevenue: number
  appointmentCount: number
  ticketMedio: number
  byService: Array<{ serviceName: string; count: number; revenue: number }>
  cancellations: {
    cancelledCount: number
    noShowCount: number
    totalScheduled: number
    cancellationRate: number
  }
}

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>
  findConflicts(input: FindConflictsInput): Promise<Appointment[]>
  listByProfessionalAndDay(professionalId: string, date: Date): Promise<Appointment[]>
  findByProfessionalAndRange(professionalId: string, from: Date, to: Date): Promise<Appointment[]>
  list(filter: ListAppointmentsFilter): Promise<Appointment[]>
  create(input: CreateAppointmentInput): Promise<Appointment>
  updateStatus(id: string, status: AppointmentStatus, reason?: string): Promise<Appointment>
  updateNotes(id: string, barberNotes: string): Promise<Appointment>
  findPendingReminders(hoursAhead: number): Promise<Appointment[]>
  markReminderSent(appointmentId: string, reminderType: string): Promise<void>
  getFinancialSummary(tenantId: string, from: Date, to: Date, professionalId?: string): Promise<FinancialSummary>
}
