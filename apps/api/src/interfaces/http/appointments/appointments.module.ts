import { Module } from '@nestjs/common'
import { AppointmentsController } from './appointments.controller'
import { AvailabilityModule } from '../availability/availability.module'
import { PrismaAppointmentRepository } from '@infrastructure/database/PrismaAppointmentRepository'
import { PrismaServiceRepository } from '@infrastructure/database/PrismaServiceRepository'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import { RedisLockService } from '@infrastructure/cache/redis-lock.service'
import { CreateAppointmentUseCase } from '@application/appointments/CreateAppointmentUseCase'
import { CancelAppointmentUseCase } from '@application/appointments/CancelAppointmentUseCase'
import { ListAppointmentsUseCase } from '@application/appointments/ListAppointmentsUseCase'

@Module({
  imports: [AvailabilityModule],
  controllers: [AppointmentsController],
  providers: [
    PrismaAppointmentRepository,
    PrismaServiceRepository,
    PrismaProfessionalRepository,
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
  ],
})
export class AppointmentsModule {}
