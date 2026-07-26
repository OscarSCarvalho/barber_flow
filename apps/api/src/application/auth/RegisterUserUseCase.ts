import * as bcrypt from 'bcryptjs'
import { IUserRepository } from '@domain/repositories/IUserRepository'
import { EmailAlreadyInUseError } from '@domain/errors'
import { User, UserRole } from '@domain/entities/User'

export interface RegisterUserInput {
  tenantId: string
  name: string
  email: string
  password: string
  role?: UserRole
}

export class RegisterUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.tenantId, input.email)
    if (existing) throw new EmailAlreadyInUseError(input.email)

    const passwordHash = await bcrypt.hash(input.password, 10)

    return this.userRepository.create({
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role ?? 'CLIENT',
    })
  }
}
