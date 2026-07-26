import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { Service } from '@domain/entities/Service'
import { ServiceNotFoundError } from '@domain/errors'

export class DeactivateServiceUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(id: string): Promise<Service> {
    const service = await this.serviceRepository.findById(id)
    if (!service) throw new ServiceNotFoundError(id)

    return this.serviceRepository.update(id, { isActive: false })
  }
}
