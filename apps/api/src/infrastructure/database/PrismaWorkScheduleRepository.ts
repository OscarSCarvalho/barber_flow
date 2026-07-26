import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IWorkScheduleRepository } from '@domain/repositories/IWorkScheduleRepository'
import { WorkSchedule, DayOfWeek, UpsertWorkScheduleInput } from '@domain/entities/WorkSchedule'

@Injectable()
export class PrismaWorkScheduleRepository implements IWorkScheduleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProfessional(professionalId: string): Promise<WorkSchedule[]> {
    const rows = await this.prisma.workSchedule.findMany({
      where: { professionalId },
      orderBy: { dayOfWeek: 'asc' },
    })
    return rows.map(this.map)
  }

  async findByProfessionalAndDay(
    professionalId: string,
    dayOfWeek: DayOfWeek,
  ): Promise<WorkSchedule | null> {
    const row = await this.prisma.workSchedule.findUnique({
      where: { professionalId_dayOfWeek: { professionalId, dayOfWeek } },
    })
    return row ? this.map(row) : null
  }

  async upsert(input: UpsertWorkScheduleInput): Promise<WorkSchedule> {
    const row = await this.prisma.workSchedule.upsert({
      where: {
        professionalId_dayOfWeek: {
          professionalId: input.professionalId,
          dayOfWeek: input.dayOfWeek,
        },
      },
      create: input,
      update: {
        startTime: input.startTime,
        endTime: input.endTime,
        breakStart: input.breakStart ?? null,
        breakEnd: input.breakEnd ?? null,
      },
    })
    return this.map(row)
  }

  private map(row: {
    id: string; professionalId: string; dayOfWeek: string
    startTime: string; endTime: string
    breakStart: string | null; breakEnd: string | null
  }): WorkSchedule {
    return {
      id: row.id,
      professionalId: row.professionalId,
      dayOfWeek: row.dayOfWeek as DayOfWeek,
      startTime: row.startTime,
      endTime: row.endTime,
      breakStart: row.breakStart ?? undefined,
      breakEnd: row.breakEnd ?? undefined,
    }
  }
}
