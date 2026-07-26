import { IUserRepository } from '@domain/repositories/IUserRepository'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { Professional } from '@domain/entities/Professional'
import { EmailAlreadyInUseError } from '@domain/errors'
import * as bcrypt from 'bcryptjs'

export interface CreateProfessionalInput {
  tenantId: string
  name: string
  email: string
  password: string
  bio?: string
  avatarUrl?: string
}

export class CreateProfessionalUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly professionalRepository: IProfessionalRepository,
  ) {}

  async execute(input: CreateProfessionalInput): Promise<Professional> {
    const existing = await this.userRepository.findByEmail(input.tenantId, input.email)
    if (existing) throw new EmailAlreadyInUseError(input.email)

    const passwordHash = await bcrypt.hash(input.password, 10)
    const user = await this.userRepository.create({
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'BARBER',
    })

    return this.professionalRepository.create({
      tenantId: input.tenantId,
      userId: user.id,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    })
  }
}
