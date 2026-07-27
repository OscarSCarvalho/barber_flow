import { Module } from '@nestjs/common'
import { AppointmentsController } from './appointments.controller'
import { AvailabilityModule } from '../availability/availability.module'
import { PrismaAppointmentRepository } from '@infrastructure/database/PrismaAppointmentRepository'
import { PrismaServiceRepository } from '@infrastructure/database/PrismaServiceRepository'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import { PrismaLoyaltyCardRepository } from '@infrastructure/database/PrismaLoyaltyCardRepository'
import { RedisLockService } from '@infrastructure/cache/redis-lock.service'
import { CreateAppointmentUseCase } from '@application/appointments/CreateAppointmentUseCase'
import { CancelAppointmentUseCase } from '@application/appointments/CancelAppointmentUseCase'
import { ListAppointmentsUseCase } from '@application/appointments/ListAppointmentsUseCase'
import { AddAppointmentNoteUseCase } from '@application/appointments/AddAppointmentNoteUseCase'
import { CompleteAppointmentUseCase } from '@application/appointments/CompleteAppointmentUseCase'

@Module({
  imports: [AvailabilityModule],
  controllers: [AppointmentsController],
  providers: [
    PrismaAppointmentRepository,
    PrismaServiceRepository,
    PrismaProfessionalRepository,
    PrismaLoyaltyCardRepository,
    {
      provide: CreateAppointmentUseCase,
      useFactory: (
        appt: PrismaAppointmentRepository,
        svc: PrismaServiceRepository,
        lock: RedisLockService,
      ) => new CreateAppointmentUseCase(appt, svc, lock),
      inject: [PrismaAppointmentRepository, PrismaServiceRepository, RedisLockService],
    },
    {
      provide: CancelAppointmentUseCase,
      useFactory: (appt: PrismaAppointmentRepository) => new CancelAppointmentUseCase(appt),
      inject: [PrismaAppointmentRepository],
    },
    {
      provide: ListAppointmentsUseCase,
      useFactory: (appt: PrismaAppointmentRepository) => new ListAppointmentsUseCase(appt),
      inject: [PrismaAppointmentRepository],
    },
    {
      provide: AddAppointmentNoteUseCase,
      useFactory: (appt: PrismaAppointmentRepository) => new AddAppointmentNoteUseCase(appt),
      inject: [PrismaAppointmentRepository],
    },
    {
      provide: CompleteAppointmentUseCase,
      useFactory: (appt: PrismaAppointmentRepository, loyalty: PrismaLoyaltyCardRepository) =>
        new CompleteAppointmentUseCase(appt, loyalty),
      inject: [PrismaAppointmentRepository, PrismaLoyaltyCardRepository],
    },
  ],
})
export class AppointmentsModule {}
