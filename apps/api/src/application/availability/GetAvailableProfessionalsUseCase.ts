import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { CheckAvailabilityUseCase } from './CheckAvailabilityUseCase'
import { Professional } from '@domain/entities/Professional'

export interface GetAvailableProfessionalsInput {
  tenantId: string
  serviceIds: string[]
  date: Date
  slotStartsAt: Date
}

export interface ProfessionalWithSlotStatus extends Professional {
  user?: { name: string; email: string }
  hasSlotAvailable: boolean
}

export class GetAvailableProfessionalsUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly checkAvailability: CheckAvailabilityUseCase,
  ) {}

  async execute(input: GetAvailableProfessionalsInput): Promise<ProfessionalWithSlotStatus[]> {
    const professionals = await this.professionalRepository.findByTenant(input.tenantId)

    const results = await Promise.all(
      professionals.map(async (pro) => {
        try {
          const { slots } = await this.checkAvailability.execute({
            professionalId: pro.id,
            serviceIds: input.serviceIds,
            date: input.date,
          })

          const targetTime = input.slotStartsAt.getTime()
          const hasSlot = slots.some(
            (s) => s.status === 'AVAILABLE' && s.startsAt.getTime() === targetTime,
          )

          return { ...pro, hasSlotAvailable: hasSlot }
        } catch {
          return { ...pro, hasSlotAvailable: false }
        }
      }),
    )

    return results
  }
}
