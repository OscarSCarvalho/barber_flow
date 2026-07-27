import { Injectable, Inject } from '@nestjs/common'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { Appointment } from '@domain/entities/Appointment'
import { AppointmentNotFoundError } from '@domain/errors'

export interface AddAppointmentNoteInput {
  appointmentId: string
  barberNotes: string
}

@Injectable()
export class AddAppointmentNoteUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(input: AddAppointmentNoteInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId)
    if (!appointment) throw new AppointmentNotFoundError(input.appointmentId)
    return this.appointmentRepository.updateNotes(input.appointmentId, input.barberNotes)
  }
}
