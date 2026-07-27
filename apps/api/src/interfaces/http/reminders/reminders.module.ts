import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { RemindersScheduler } from './reminders.scheduler'
import { PrismaAppointmentRepository } from '@infrastructure/database/PrismaAppointmentRepository'
import { SendAppointmentRemindersUseCase } from '@application/reminders/SendAppointmentRemindersUseCase'

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    PrismaAppointmentRepository,
    {
      provide: SendAppointmentRemindersUseCase,
      useFactory: (appt: PrismaAppointmentRepository) => new SendAppointmentRemindersUseCase(appt),
      inject: [PrismaAppointmentRepository],
    },
    RemindersScheduler,
  ],
})
export class RemindersModule {}
