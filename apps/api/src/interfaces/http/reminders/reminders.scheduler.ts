import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { SendAppointmentRemindersUseCase } from '@application/reminders/SendAppointmentRemindersUseCase'

@Injectable()
export class RemindersScheduler {
  private readonly logger = new Logger(RemindersScheduler.name)

  constructor(private readonly sendReminders: SendAppointmentRemindersUseCase) {}

  @Cron('0 * * * *')
  async handleHourlyReminders() {
    this.logger.debug('Checking 24h reminders...')
    await this.sendReminders.execute(24)
  }

  @Cron('30 * * * *')
  async handle2hReminders() {
    this.logger.debug('Checking 2h reminders...')
    await this.sendReminders.execute(2)
  }
}
