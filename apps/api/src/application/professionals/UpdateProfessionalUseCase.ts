import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { Professional } from '@domain/entities/Professional'
import { ProfessionalNotFoundError } from '@domain/errors'

export interface UpdateProfessionalInput {
  id: string
  bio?: string
  avatarUrl?: string
  isActive?: boolean
}

export class UpdateProfessionalUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(input: UpdateProfessionalInput): Promise<Professional> {
    const professional = await this.professionalRepository.findById(input.id)
    if (!professional) throw new ProfessionalNotFoundError(input.id)

    return this.professionalRepository.update(input.id, {
      bio: input.bio,
      avatarUrl: input.avatarUrl,
      isActive: input.isActive,
    })
  }
}
