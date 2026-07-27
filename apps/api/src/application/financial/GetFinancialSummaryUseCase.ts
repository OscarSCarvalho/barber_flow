import { Injectable, Inject } from '@nestjs/common'
import { IAppointmentRepository, FinancialSummary } from '@domain/repositories/IAppointmentRepository'

export interface GetFinancialSummaryInput {
  tenantId: string
  from: Date
  to: Date
  professionalId?: string
}

@Injectable()
export class GetFinancialSummaryUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
  ) {}

  async execute(input: GetFinancialSummaryInput): Promise<FinancialSummary> {
    return this.appointmentRepository.getFinancialSummary(
      input.tenantId,
      input.from,
      input.to,
      input.professionalId,
    )
  }
}
