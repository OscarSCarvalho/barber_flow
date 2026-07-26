import { Injectable, Inject } from '@nestjs/common'
import { IManualBlockRepository } from '@domain/repositories/IManualBlockRepository'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { ProfessionalNotFoundError, AppointmentConflictError, PastDateError } from '@domain/errors'
import { ManualBlock } from '@domain/entities/ManualBlock'

export interface CreateManualBlockInput {
  userId: string
  startsAt: Date
  endsAt: Date
  reason?: string
}

@Injectable()
export class CreateManualBlockUseCase {
  constructor(
    @Inject('IProfessionalRepository')
    private readonly professionalRepository: IProfessionalRepository,
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IManualBlockRepository')
    private readonly manualBlockRepository: IManualBlockRepository,
  ) {}

  async execute(input: CreateManualBlockInput): Promise<ManualBlock> {
    if (input.startsAt <= new Date()) throw new PastDateError()
    if (input.endsAt <= input.startsAt) throw new AppointmentConflictError()

    const professional = await this.professionalRepository.findByUserId(input.userId)
    if (!professional) throw new ProfessionalNotFoundError(input.userId)

    const conflicts = await this.appointmentRepository.findConflicts({
      professionalId: professional.id,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
    })
    if (conflicts.length > 0) throw new AppointmentConflictError()

    return this.manualBlockRepository.create({
      professionalId: professional.id,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      reason: input.reason,
    })
  }
}
