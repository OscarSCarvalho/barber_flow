import { Service, CreateServiceInput } from '../entities/Service'

export interface IServiceRepository {
  findById(id: string): Promise<Service | null>
  findByTenant(tenantId: string, onlyActive?: boolean): Promise<Service[]>
  findManyByIds(ids: string[]): Promise<Service[]>
  create(input: CreateServiceInput): Promise<Service>
  update(id: string, data: Partial<Pick<Service, 'name' | 'durationMinutes' | 'priceInCents' | 'isActive'>>): Promise<Service>
}
