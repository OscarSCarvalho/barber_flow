import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { Service, CreateServiceInput } from '@domain/entities/Service'

@Injectable()
export class PrismaServiceRepository implements IServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Service | null> {
    const row = await this.prisma.service.findUnique({ where: { id } })
    return row ? this.map(row) : null
  }

  async findByTenant(tenantId: string, onlyActive = true): Promise<Service[]> {
    const rows = await this.prisma.service.findMany({
      where: { tenantId, ...(onlyActive ? { isActive: true } : {}) },
      orderBy: { name: 'asc' },
    })
    return rows.map(this.map)
  }

  async findManyByIds(ids: string[]): Promise<Service[]> {
    const rows = await this.prisma.service.findMany({ where: { id: { in: ids } } })
    return rows.map(this.map)
  }

  async create(input: CreateServiceInput): Promise<Service> {
    const row = await this.prisma.service.create({ data: input })
    return this.map(row)
  }

  async update(
    id: string,
    data: Partial<Pick<Service, 'name' | 'durationMinutes' | 'priceInCents' | 'isActive'>>,
  ): Promise<Service> {
    const row = await this.prisma.service.update({ where: { id }, data })
    return this.map(row)
  }

  private map(row: {
    id: string; tenantId: string; name: string; durationMinutes: number
    priceInCents: number; isActive: boolean; createdAt: Date; updatedAt: Date
  }): Service {
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      durationMinutes: row.durationMinutes,
      priceInCents: row.priceInCents,
      isActive: row.isActive,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
