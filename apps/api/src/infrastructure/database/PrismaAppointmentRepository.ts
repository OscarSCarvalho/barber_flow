import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { IAppointmentRepository, FindConflictsInput, ListAppointmentsFilter } from '@domain/repositories/IAppointmentRepository'
import { Appointment, CreateAppointmentInput, AppointmentStatus } from '@domain/entities/Appointment'

@Injectable()
export class PrismaAppointmentRepository implements IAppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Appointment | null> {
    const row = await this.prisma.appointment.findUnique({
      where: { id },
      include: { services: true },
    })
    return row ? this.map(row) : null
  }

  async findConflicts({ professionalId, startsAt, endsAt, excludeId }: FindConflictsInput): Promise<Appointment[]> {
    const rows = await this.prisma.appointment.findMany({
      where: {
        professionalId,
        id: excludeId ? { not: excludeId } : undefined,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
      include: { services: true },
    })
    return rows.map(this.map)
  }

  async listByProfessionalAndDay(professionalId: string, date: Date): Promise<Appointment[]> {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const rows = await this.prisma.appointment.findMany({
      where: {
        professionalId,
        startsAt: { gte: start, lte: end },
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
      include: { services: true },
      orderBy: { startsAt: 'asc' },
    })
    return rows.map(this.map)
  }

  async findByProfessionalAndRange(professionalId: string, from: Date, to: Date): Promise<Appointment[]> {
    const rows = await this.prisma.appointment.findMany({
      where: {
        professionalId,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
        startsAt: { lt: to },
        endsAt: { gt: from },
      },
      include: { services: true },
      orderBy: { startsAt: 'asc' },
    })
    return rows.map(this.map)
  }

  async list(filter: ListAppointmentsFilter): Promise<Appointment[]> {
    const rows = await this.prisma.appointment.findMany({
      where: {
        tenantId: filter.tenantId,
        professionalId: filter.professionalId,
        clientId: filter.clientId,
        status: filter.status,
        startsAt: {
          gte: filter.dateFrom,
          lte: filter.dateTo,
        },
      },
      include: { services: true },
      orderBy: { startsAt: 'asc' },
    })
    return rows.map(this.map)
  }

  async create(input: CreateAppointmentInput): Promise<Appointment> {
    const row = await this.prisma.appointment.create({
      data: {
        tenantId: input.tenantId,
        professionalId: input.professionalId,
        clientId: input.clientId,
        clientName: input.clientName,
        clientPhone: input.clientPhone,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        status: 'CONFIRMED',
        services: {
          create: input.services.map((s) => ({
            serviceId: s.serviceId,
            priceSnapshot: s.priceSnapshot,
            durationSnapshot: s.durationSnapshot,
          })),
        },
      },
      include: { services: true },
    })
    return this.map(row)
  }

  async updateStatus(id: string, status: AppointmentStatus, reason?: string): Promise<Appointment> {
    const row = await this.prisma.appointment.update({
      where: { id },
      data: { status, cancelReason: reason },
      include: { services: true },
    })
    return this.map(row)
  }

  private map(row: any): Appointment {
    return {
      id: row.id,
      tenantId: row.tenantId,
      professionalId: row.professionalId,
      clientId: row.clientId ?? undefined,
      clientName: row.clientName,
      clientPhone: row.clientPhone,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      status: row.status,
      cancelReason: row.cancelReason ?? undefined,
      services: row.services.map((s: any) => ({
        serviceId: s.serviceId,
        priceSnapshot: s.priceSnapshot,
        durationSnapshot: s.durationSnapshot,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
