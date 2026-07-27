import { Injectable } from '@nestjs/common'
import type { Prisma } from '@prisma/client'
import { PrismaService } from './prisma.service'
import { IAppointmentRepository, FindConflictsInput, ListAppointmentsFilter, FinancialSummary } from '@domain/repositories/IAppointmentRepository'
import { Appointment, CreateAppointmentInput, AppointmentStatus } from '@domain/entities/Appointment'

type AppointmentRow = Prisma.AppointmentGetPayload<{ include: { services: true } }>
type AppointmentServiceRow = AppointmentRow['services'][number]

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

  async updateNotes(id: string, barberNotes: string): Promise<Appointment> {
    const row = await this.prisma.appointment.update({
      where: { id },
      data: { barberNotes },
      include: { services: true },
    })
    return this.map(row)
  }

  async findPendingReminders(hoursAhead: number): Promise<Appointment[]> {
    const now = new Date()
    const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)
    const rows = await this.prisma.appointment.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PENDING'] },
        startsAt: { gte: now, lte: cutoff },
        reminders: { none: { reminderType: `${hoursAhead}h` } },
      },
      include: { services: true },
    })
    return rows.map(this.map)
  }

  async markReminderSent(appointmentId: string, reminderType: string): Promise<void> {
    await this.prisma.reminderLog.create({
      data: { appointmentId, reminderType },
    })
  }

  async getFinancialSummary(
    tenantId: string,
    from: Date,
    to: Date,
    professionalId?: string,
  ): Promise<FinancialSummary> {
    const where = { tenantId, professionalId, startsAt: { gte: from, lte: to } }

    const [completed, cancelled, noShow] = await Promise.all([
      this.prisma.appointment.findMany({
        where: { ...where, status: 'COMPLETED' },
        include: { services: { include: { service: true } } },
      }),
      this.prisma.appointment.count({ where: { ...where, status: 'CANCELLED' } }),
      this.prisma.appointment.count({ where: { ...where, status: 'NO_SHOW' } }),
    ])

    const byServiceMap = new Map<string, { serviceName: string; count: number; revenue: number }>()
    let totalRevenue = 0

    for (const appt of completed) {
      for (const as of appt.services) {
        totalRevenue += as.priceSnapshot
        const existing = byServiceMap.get(as.serviceId)
        if (existing) {
          existing.count++
          existing.revenue += as.priceSnapshot
        } else {
          byServiceMap.set(as.serviceId, {
            serviceName: as.service.name,
            count: 1,
            revenue: as.priceSnapshot,
          })
        }
      }
    }

    const appointmentCount = completed.length
    const totalScheduled = appointmentCount + cancelled + noShow
    const cancellationRate = totalScheduled > 0
      ? Math.round(((cancelled + noShow) / totalScheduled) * 100)
      : 0

    return {
      totalRevenue,
      appointmentCount,
      ticketMedio: appointmentCount > 0 ? Math.round(totalRevenue / appointmentCount) : 0,
      byService: Array.from(byServiceMap.values()),
      cancellations: { cancelledCount: cancelled, noShowCount: noShow, totalScheduled, cancellationRate },
    }
  }

  private map(row: AppointmentRow): Appointment {
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
      barberNotes: row.barberNotes ?? undefined,
      depositPaidCents: row.depositPaidCents ?? undefined,
      services: row.services.map((s: AppointmentServiceRow) => ({
        serviceId: s.serviceId,
        priceSnapshot: s.priceSnapshot,
        durationSnapshot: s.durationSnapshot,
      })),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }
}
