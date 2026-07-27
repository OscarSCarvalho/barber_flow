import { Injectable, Inject, Logger } from '@nestjs/common'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'

@Injectable()
export class SendAppointmentRemindersUseCase {
  private readonly logger = new Logger(SendAppointmentRemindersUseCase.name)

  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(hoursAhead: number): Promise<void> {
    const appointments = await this.appointmentRepository.findPendingReminders(hoursAhead)
    this.logger.log(`Sending ${hoursAhead}h reminders for ${appointments.length} appointments`)

    for (const appt of appointments) {
      try {
        // In production: send SMS/WhatsApp via integration service
        this.logger.log(
          `[REMINDER ${hoursAhead}h] ${appt.clientName} (${appt.clientPhone}) — ${appt.startsAt.toISOString()}`,
        )
        await this.appointmentRepository.markReminderSent(appt.id, `${hoursAhead}h`)
      } catch (err) {
        this.logger.error(`Failed to send reminder for appointment ${appt.id}`, err)
      }
    }
  }
}
