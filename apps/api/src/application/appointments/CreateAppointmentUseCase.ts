import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { Appointment } from '@domain/entities/Appointment'
import {
  AppointmentConflictError,
  PastDateError,
  ServiceNotFoundError,
  ServiceInactiveError,
} from '@domain/errors'
import { addMinutes } from 'date-fns'

export interface RedisLockService {
  acquire(key: string, ttlMs: number): Promise<boolean>
  release(key: string): Promise<void>
}

export interface CreateAppointmentInput2 {
  tenantId: string
  professionalId: string
  clientId?: string
  clientName: string
  clientPhone: string
  serviceIds: string[]
  startsAt: Date
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly serviceRepository: IServiceRepository,
    private readonly lockService: RedisLockService,
  ) {}

  async execute(input: CreateAppointmentInput2): Promise<Appointment> {
    if (input.startsAt <= new Date()) throw new PastDateError()

    const services = await this.serviceRepository.findManyByIds(input.serviceIds)
    for (const sid of input.serviceIds) {
      const svc = services.find((s) => s.id === sid)
      if (!svc) throw new ServiceNotFoundError(sid)
      if (!svc.isActive) throw new ServiceInactiveError(sid)
    }

    const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0)
    const endsAt = addMinutes(input.startsAt, totalDuration)

    const lockKey = `lock:prof:${input.professionalId}:slot:${input.startsAt.getTime()}`
    const acquired = await this.lockService.acquire(lockKey, 10_000)
    if (!acquired) throw new AppointmentConflictError()

    try {
      const conflicts = await this.appointmentRepository.findConflicts({
        professionalId: input.professionalId,
        startsAt: input.startsAt,
        endsAt,
      })

      if (conflicts.length > 0) throw new AppointmentConflictError()

      return await this.appointmentRepository.create({
        tenantId: input.tenantId,
        professionalId: input.professionalId,
        clientId: input.clientId,
        clientName: input.clientName,
        clientPhone: input.clientPhone,
        startsAt: input.startsAt,
        endsAt,
        services: services.map((s) => ({
          serviceId: s.id,
          priceSnapshot: s.priceInCents,
          durationSnapshot: s.durationMinutes,
        })),
      })
    } finally {
      await this.lockService.release(lockKey)
    }
  }
}
