import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IReviewRepository } from '@domain/repositories/IReviewRepository'
import { Review, CreateReviewInput } from '@domain/entities/Review'

@Injectable()
export class PrismaReviewRepository implements IReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByAppointmentId(appointmentId: string): Promise<Review | null> {
    const row = await this.prisma.review.findUnique({ where: { appointmentId } })
    return row ? this.map(row) : null
  }

  async findByProfessional(professionalId: string, tenantId: string): Promise<Review[]> {
    const rows = await this.prisma.review.findMany({
      where: { professionalId, tenantId },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(this.map)
  }

  async create(input: CreateReviewInput): Promise<Review> {
    const row = await this.prisma.review.create({ data: input })
    return this.map(row)
  }

  private map(row: any): Review {
    return {
      id: row.id,
      tenantId: row.tenantId,
      appointmentId: row.appointmentId,
      professionalId: row.professionalId,
      clientName: row.clientName,
      rating: row.rating,
      comment: row.comment ?? undefined,
      createdAt: row.createdAt,
    }
  }
}
