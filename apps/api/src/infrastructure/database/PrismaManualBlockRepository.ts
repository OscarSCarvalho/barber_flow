import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IManualBlockRepository } from '@domain/repositories/IManualBlockRepository'
import { ManualBlock, CreateManualBlockInput } from '@domain/entities/ManualBlock'

@Injectable()
export class PrismaManualBlockRepository implements IManualBlockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<ManualBlock | null> {
    const row = await this.prisma.manualBlock.findUnique({ where: { id } })
    return row ? this.map(row) : null
  }

  async findByProfessionalAndRange(
    professionalId: string,
    from: Date,
    to: Date,
  ): Promise<ManualBlock[]> {
    const rows = await this.prisma.manualBlock.findMany({
      where: {
        professionalId,
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      orderBy: { startsAt: 'asc' },
    })
    return rows.map(this.map)
  }

  async create(input: CreateManualBlockInput): Promise<ManualBlock> {
    const row = await this.prisma.manualBlock.create({ data: input })
    return this.map(row)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.manualBlock.delete({ where: { id } })
  }

  private map(row: {
    id: string; professionalId: string; startsAt: Date; endsAt: Date
    reason: string | null; createdAt: Date
  }): ManualBlock {
    return {
      id: row.id,
      professionalId: row.professionalId,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      reason: row.reason ?? undefined,
      createdAt: row.createdAt,
    }
  }
}
