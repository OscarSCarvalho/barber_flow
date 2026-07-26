import * as bcrypt from 'bcryptjs'
import { IUserRepository } from '@domain/repositories/IUserRepository'
import { InvalidCredentialsError } from '@domain/errors'
import { User } from '@domain/entities/User'

export interface LoginInput {
  tenantId: string
  email: string
  password: string
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<User> {
    const user = await this.userRepository.findByEmail(input.tenantId, input.email)
    if (!user) throw new InvalidCredentialsError()

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)
    if (!passwordMatches) throw new InvalidCredentialsError()

    return user
  }
}
