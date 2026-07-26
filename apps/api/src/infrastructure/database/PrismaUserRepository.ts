import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IUserRepository } from '@domain/repositories/IUserRepository'
import { User, CreateUserInput } from '@domain/entities/User'

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } })
    return row ? this.map(row) : null
  }

  async findByEmail(tenantId: string, email: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email } },
    })
    return row ? this.map(row) : null
  }

  async create(input: CreateUserInput): Promise<User> {
    const row = await this.prisma.user.create({ data: input })
    return this.map(row)
  }

  private map(row: {
    id: string; tenantId: string; name: string; email: string
    passwordHash: string; phone: string | null; role: string
    createdAt: Date; updatedAt: Date
  }): User {
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      phone: row.phone ?? undefined,
      role: row.role as User['role'],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
