import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { Appointment } from '@domain/entities/Appointment'
import { DomainError } from '@domain/errors'

export class AppointmentNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Agendamento não encontrado: ${id}`, 'APPOINTMENT_NOT_FOUND')
  }
}

export class AppointmentAlreadyCancelledError extends DomainError {
  constructor() {
    super('Agendamento já está cancelado', 'ALREADY_CANCELLED')
  }
}

export interface CancelAppointmentInput {
  id: string
  reason?: string
}

export class CancelAppointmentUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(input: CancelAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(input.id)
    if (!appointment) throw new AppointmentNotFoundError(input.id)
    if (appointment.status === 'CANCELLED') throw new AppointmentAlreadyCancelledError()

    return this.appointmentRepository.updateStatus(input.id, 'CANCELLED', input.reason)
  }
}
