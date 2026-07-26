import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { Service } from '@domain/entities/Service'
import { DomainError } from '@domain/errors'

export interface CreateServiceInput {
  tenantId: string
  name: string
  durationMinutes: number
  priceInCents: number
}

export class ServiceNameAlreadyExistsError extends DomainError {
  constructor(name: string) {
    super(`Serviço já existe: ${name}`, 'SERVICE_NAME_ALREADY_EXISTS')
  }
}

export class CreateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(input: CreateServiceInput): Promise<Service> {
    if (input.durationMinutes <= 0) {
      throw new DomainError('Duração deve ser maior que zero', 'INVALID_DURATION')
    }
    if (input.priceInCents < 0) {
      throw new DomainError('Preço não pode ser negativo', 'INVALID_PRICE')
    }

    const existing = await this.serviceRepository.findByTenant(input.tenantId, false)
    const nameConflict = existing.find(
      (s) => s.name.toLowerCase() === input.name.toLowerCase(),
    )
    if (nameConflict) throw new ServiceNameAlreadyExistsError(input.name)

    return this.serviceRepository.create(input)
  }
}
