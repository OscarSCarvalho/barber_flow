import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { Professional, CreateProfessionalInput } from '@domain/entities/Professional'

@Injectable()
export class PrismaProfessionalRepository implements IProfessionalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Professional | null> {
    const row = await this.prisma.professional.findUnique({ where: { id } })
    return row ? this.map(row) : null
  }

  async findByUserId(userId: string): Promise<Professional | null> {
    const row = await this.prisma.professional.findUnique({
      where: { userId },
      include: { user: { select: { name: true, email: true } } },
    })
    return row ? this.map(row) : null
  }

  async findByTenant(tenantId: string): Promise<Professional[]> {
    const rows = await this.prisma.professional.findMany({
      where: { tenantId, isActive: true },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { name: 'asc' } },
    })
    return rows.map(this.map)
  }

  async create(input: CreateProfessionalInput): Promise<Professional> {
    const row = await this.prisma.professional.create({ data: input })
    return this.map(row)
  }

  async update(
    id: string,
    data: Partial<Pick<Professional, 'bio' | 'avatarUrl' | 'isActive'>>,
  ): Promise<Professional> {
    const row = await this.prisma.professional.update({ where: { id }, data })
    return this.map(row)
  }

  private map(row: {
    id: string; tenantId: string; userId: string
    bio: string | null; avatarUrl: string | null; isActive: boolean
    user?: { name: string; email: string }
  }): Professional & { user?: { name: string; email: string } } {
    return {
      id: row.id,
      tenantId: row.tenantId,
      userId: row.userId,
      bio: row.bio ?? undefined,
      avatarUrl: row.avatarUrl ?? undefined,
      isActive: row.isActive,
      user: row.user,
    }
  }
}
