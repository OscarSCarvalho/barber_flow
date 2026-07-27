import { Injectable, Inject } from '@nestjs/common'
import { IWaitlistRepository } from '@domain/repositories/IWaitlistRepository'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { WaitlistEntry } from '@domain/entities/WaitlistEntry'
import { ProfessionalNotFoundError } from '@domain/errors'

export interface JoinWaitlistInput {
  tenantId: string
  professionalId: string
  clientName: string
  clientPhone: string
  serviceIds: string[]
  preferredDate?: Date
}

@Injectable()
export class JoinWaitlistUseCase {
  constructor(
    @Inject('IProfessionalRepository')
    private readonly professionalRepository: IProfessionalRepository,
    @Inject('IWaitlistRepository')
    private readonly waitlistRepository: IWaitlistRepository,
  ) {}

  async execute(input: JoinWaitlistInput): Promise<WaitlistEntry> {
    const professional = await this.professionalRepository.findById(input.professionalId)
    if (!professional) throw new ProfessionalNotFoundError(input.professionalId)

    return this.waitlistRepository.create(input)
  }
}
