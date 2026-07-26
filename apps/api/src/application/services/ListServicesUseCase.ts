import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { Service } from '@domain/entities/Service'

export class ListServicesUseCase {
  constructor(private readonly serviceRepository: IServiceRepository) {}

  async execute(tenantId: string, onlyActive = true): Promise<Service[]> {
    return this.serviceRepository.findByTenant(tenantId, onlyActive)
  }
}
