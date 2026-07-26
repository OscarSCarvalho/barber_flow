import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { Service } from '@domain/entities/Service'
import { ServiceNotFoundError, DomainError } from '@domain/errors'

export interface UpdateServiceInput {
  id: string
  name?: string
  durationMinutes?: number
  priceInCents?: number
}

export class UpdateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: UpdateServiceInput): Promise<Service> {
    const service = await this.serviceRepository.findById(input.id)
    if (!service) throw new ServiceNotFoundError(input.id)

    if (input.durationMinutes !== undefined && input.durationMinutes <= 0) {
      throw new DomainError('Duração deve ser maior que zero', 'INVALID_DURATION')
    }
    if (input.priceInCents !== undefined && input.priceInCents < 0) {
      throw new DomainError('Preço não pode ser negativo', 'INVALID_PRICE')
    }

    return this.serviceRepository.update(input.id, {
      name: input.name,
      durationMinutes: input.durationMinutes,
      priceInCents: input.priceInCents,
    })
  }
}
