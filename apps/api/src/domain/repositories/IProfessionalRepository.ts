import { Professional, CreateProfessionalInput } from '../entities/Professional'

export interface IProfessionalRepository {
  findById(id: string): Promise<Professional | null>
  findByUserId(userId: string): Promise<Professional | null>
  findByTenant(tenantId: string): Promise<Professional[]>
  create(input: CreateProfessionalInput): Promise<Professional>
  update(id: string, data: Partial<Pick<Professional, 'bio' | 'avatarUrl' | 'isActive'>>): Promise<Professional>
}
