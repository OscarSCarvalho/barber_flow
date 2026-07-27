import { Injectable } from '@nestjs/common'
import type { WaitlistEntry as PrismaWaitlistEntry } from '@prisma/client'
import { PrismaService } from './prisma.service'
import { IWaitlistRepository } from '@domain/repositories/IWaitlistRepository'
import { WaitlistEntry, CreateWaitlistEntryInput, WaitlistStatus } from '@domain/entities/WaitlistEntry'

@Injectable()
export class PrismaWaitlistRepository implements IWaitlistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateWaitlistEntryInput): Promise<WaitlistEntry> {
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)
    const row = await this.prisma.waitlistEntry.create({
      data: { ...input, expiresAt },
    })
    return this.map(row)
  }

  async findByProfessional(professionalId: string, tenantId: string): Promise<WaitlistEntry[]> {
    const rows = await this.prisma.waitlistEntry.findMany({
      where: { professionalId, tenantId, status: 'WAITING' },
      orderBy: { createdAt: 'asc' },
    })
    return rows.map(this.map)
  }

  async updateStatus(id: string, status: WaitlistStatus, notifiedAt?: Date): Promise<WaitlistEntry> {
    const row = await this.prisma.waitlistEntry.update({
      where: { id },
      data: { status, notifiedAt },
    })
    return this.map(row)
  }

  async expireOldEntries(): Promise<number> {
    const result = await this.prisma.waitlistEntry.updateMany({
      where: { status: 'WAITING', expiresAt: { lt: new Date() } },
      data: { status: 'EXPIRED' },
    })
    return result.count
  }

  private map(row: PrismaWaitlistEntry): WaitlistEntry {
    return {
      id: row.id,
      tenantId: row.tenantId,
      professionalId: row.professionalId,
      clientName: row.clientName,
      clientPhone: row.clientPhone,
      serviceIds: row.serviceIds,
      preferredDate: row.preferredDate ?? undefined,
      status: row.status,
      notifiedAt: row.notifiedAt ?? undefined,
      expiresAt: row.expiresAt ?? undefined,
      createdAt: row.createdAt,
    }
  }
}
