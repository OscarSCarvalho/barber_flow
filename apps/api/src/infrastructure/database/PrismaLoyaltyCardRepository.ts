import { Injectable } from '@nestjs/common'
import type { LoyaltyCard as PrismaLoyaltyCard } from '@prisma/client'
import { PrismaService } from './prisma.service'
import { ILoyaltyCardRepository } from '@domain/repositories/ILoyaltyCardRepository'
import { LoyaltyCard } from '@domain/entities/LoyaltyCard'

@Injectable()
export class PrismaLoyaltyCardRepository implements ILoyaltyCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTenant(tenantId: string): Promise<LoyaltyCard[]> {
    const rows = await this.prisma.loyaltyCard.findMany({
      where: { tenantId },
      orderBy: { completedCuts: 'desc' },
    })
    return rows.map(this.map)
  }

  async findByPhone(tenantId: string, clientPhone: string): Promise<LoyaltyCard | null> {
    const row = await this.prisma.loyaltyCard.findUnique({
      where: { tenantId_clientPhone: { tenantId, clientPhone } },
    })
    return row ? this.map(row) : null
  }

  async upsert(tenantId: string, clientPhone: string): Promise<LoyaltyCard> {
    const row = await this.prisma.loyaltyCard.upsert({
      where: { tenantId_clientPhone: { tenantId, clientPhone } },
      create: { tenantId, clientPhone },
      update: {},
    })
    return this.map(row)
  }

  async incrementCompleted(tenantId: string, clientPhone: string): Promise<LoyaltyCard> {
    const row = await this.prisma.loyaltyCard.upsert({
      where: { tenantId_clientPhone: { tenantId, clientPhone } },
      create: { tenantId, clientPhone, completedCuts: 1 },
      update: { completedCuts: { increment: 1 } },
    })
    return this.map(row)
  }

  async redeem(tenantId: string, clientPhone: string): Promise<LoyaltyCard> {
    const row = await this.prisma.loyaltyCard.update({
      where: { tenantId_clientPhone: { tenantId, clientPhone } },
      data: { redeemedCuts: { increment: 1 } },
    })
    return this.map(row)
  }

  private map(row: PrismaLoyaltyCard): LoyaltyCard {
    return {
      id: row.id,
      tenantId: row.tenantId,
      clientPhone: row.clientPhone,
      completedCuts: row.completedCuts,
      redeemedCuts: row.redeemedCuts,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
