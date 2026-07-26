import { User, CreateUserInput } from '../entities/User'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(tenantId: string, email: string): Promise<User | null>
  create(input: CreateUserInput): Promise<User>
}
