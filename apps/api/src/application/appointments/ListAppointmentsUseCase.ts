import { IAppointmentRepository, ListAppointmentsFilter } from '@domain/repositories/IAppointmentRepository'
import { Appointment } from '@domain/entities/Appointment'

export class ListAppointmentsUseCase {
  constructor(private readonly appointmentRepository: IAppointmentRepository) {}

  async execute(filter: ListAppointmentsFilter): Promise<Appointment[]> {
    return this.appointmentRepository.list(filter)
  }
}
