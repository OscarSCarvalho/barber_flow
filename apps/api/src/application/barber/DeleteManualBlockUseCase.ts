import { Injectable, Inject } from '@nestjs/common'
import { IManualBlockRepository } from '@domain/repositories/IManualBlockRepository'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { ProfessionalNotFoundError, ManualBlockNotFoundError, PastDateError } from '@domain/errors'

export interface DeleteManualBlockInput {
  userId: string
  blockId: string
}

@Injectable()
export class DeleteManualBlockUseCase {
  constructor(
    @Inject('IProfessionalRepository')
    private readonly professionalRepository: IProfessionalRepository,
    @Inject('IManualBlockRepository')
    private readonly manualBlockRepository: IManualBlockRepository,
  ) {}

  async execute(input: DeleteManualBlockInput): Promise<void> {
    const professional = await this.professionalRepository.findByUserId(input.userId)
    if (!professional) throw new ProfessionalNotFoundError(input.userId)

    const block = await this.manualBlockRepository.findById(input.blockId)
    if (!block || block.professionalId !== professional.id) throw new ManualBlockNotFoundError()

    if (block.startsAt <= new Date()) throw new PastDateError()

    await this.manualBlockRepository.delete(input.blockId)
  }
}
