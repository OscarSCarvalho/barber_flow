import { Module } from '@nestjs/common'
import { FinancialController } from './financial.controller'
import { PrismaAppointmentRepository } from '@infrastructure/database/PrismaAppointmentRepository'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import { GetFinancialSummaryUseCase } from '@application/financial/GetFinancialSummaryUseCase'

@Module({
  controllers: [FinancialController],
  providers: [
    PrismaAppointmentRepository,
    PrismaProfessionalRepository,
    {
      provide: GetFinancialSummaryUseCase,
      useFactory: (appt: PrismaAppointmentRepository) => new GetFinancialSummaryUseCase(appt),
      inject: [PrismaAppointmentRepository],
    },
  ],
})
export class FinancialModule {}
