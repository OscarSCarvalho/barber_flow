import { addMinutes, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns'
import { IWorkScheduleRepository } from '@domain/repositories/IWorkScheduleRepository'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { IManualBlockRepository } from '@domain/repositories/IManualBlockRepository'
import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { ServiceNotFoundError, ServiceInactiveError } from '@domain/errors'
import {
  TimeSlot,
  createAvailableSlot,
  createBlockedSlot,
} from '@domain/entities/TimeSlot'
import { DayOfWeek } from '@domain/entities/WorkSchedule'

const DAY_MAP: Record<number, DayOfWeek> = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
}

const SLOT_GRANULARITY_MINUTES = 30

export interface CheckAvailabilityInput {
  professionalId: string
  serviceIds: string[]
  date: Date
}

export interface CheckAvailabilityOutput {
  slots: TimeSlot[]
  totalDurationMinutes: number
  notWorking: boolean
}

export class CheckAvailabilityUseCase {
  constructor(
    private readonly workScheduleRepository: IWorkScheduleRepository,
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly manualBlockRepository: IManualBlockRepository,
    private readonly serviceRepository: IServiceRepository,
  ) {}

  async execute(input: CheckAvailabilityInput): Promise<CheckAvailabilityOutput> {
    const services = await this.serviceRepository.findManyByIds(input.serviceIds)

    for (const sid of input.serviceIds) {
      const svc = services.find((s) => s.id === sid)
      if (!svc) throw new ServiceNotFoundError(sid)
      if (!svc.isActive) throw new ServiceInactiveError(sid)
    }

    const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0)

    const dayOfWeek = DAY_MAP[input.date.getDay()]
    const schedule = await this.workScheduleRepository.findByProfessionalAndDay(
      input.professionalId,
      dayOfWeek,
    )

    if (!schedule) {
      return { slots: [], totalDurationMinutes: totalDuration, notWorking: true }
    }

    const dayStart = startOfDay(input.date)
    const workStart = this.parseTime(dayStart, schedule.startTime)
    const workEnd = this.parseTime(dayStart, schedule.endTime)
    const breakStart = schedule.breakStart ? this.parseTime(dayStart, schedule.breakStart) : null
    const breakEnd = schedule.breakEnd ? this.parseTime(dayStart, schedule.breakEnd) : null

    const [confirmedAppointments, manualBlocks] = await Promise.all([
      this.appointmentRepository.listByProfessionalAndDay(input.professionalId, input.date),
      this.manualBlockRepository.findByProfessionalAndRange(
        input.professionalId,
        startOfDay(input.date),
        endOfDay(input.date),
      ),
    ])

    const slots: TimeSlot[] = []
    let cursor = workStart

    while (isBefore(cursor, workEnd)) {
      const slotEnd = addMinutes(cursor, totalDuration)

      if (isAfter(slotEnd, workEnd)) {
        slots.push(createBlockedSlot(cursor, slotEnd, 'OUTSIDE_HOURS'))
        cursor = addMinutes(cursor, SLOT_GRANULARITY_MINUTES)
        continue
      }

      if (breakStart && breakEnd && this.overlaps(cursor, slotEnd, breakStart, breakEnd)) {
        slots.push(createBlockedSlot(cursor, slotEnd, 'LUNCH'))
        cursor = addMinutes(cursor, SLOT_GRANULARITY_MINUTES)
        continue
      }

      const appointmentConflict = confirmedAppointments.find(
        (a) =>
          a.status !== 'CANCELLED' &&
          a.status !== 'NO_SHOW' &&
          this.overlaps(cursor, slotEnd, a.startsAt, a.endsAt),
      )
      if (appointmentConflict) {
        slots.push(createBlockedSlot(cursor, slotEnd, 'APPOINTMENT'))
        cursor = addMinutes(cursor, SLOT_GRANULARITY_MINUTES)
        continue
      }

      const manualConflict = manualBlocks.find((b) =>
        this.overlaps(cursor, slotEnd, b.startsAt, b.endsAt),
      )
      if (manualConflict) {
        slots.push(createBlockedSlot(cursor, slotEnd, 'MANUAL_BLOCK'))
        cursor = addMinutes(cursor, SLOT_GRANULARITY_MINUTES)
        continue
      }

      slots.push(createAvailableSlot(cursor, slotEnd))
      cursor = addMinutes(cursor, SLOT_GRANULARITY_MINUTES)
    }

    return { slots, totalDurationMinutes: totalDuration, notWorking: false }
  }

  private parseTime(base: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const d = new Date(base)
    d.setHours(hours, minutes, 0, 0)
    return d
  }

  private overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
    return isBefore(aStart, bEnd) && isAfter(aEnd, bStart)
  }
}
