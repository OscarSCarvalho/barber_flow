import { CreateAppointmentUseCase, RedisLockService } from './CreateAppointmentUseCase'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { AppointmentConflictError, PastDateError } from '@domain/errors'
import { Appointment } from '@domain/entities/Appointment'

const mockService = {
  id: 's1', tenantId: 't1', name: 'Corte', durationMinutes: 60,
  priceInCents: 4500, isActive: true, createdAt: new Date(), updatedAt: new Date(),
}

const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000)

function makeRepos(conflictsCount = 0) {
  const appointmentRepo: IAppointmentRepository = {
    findById: jest.fn(),
    findConflicts: jest.fn().mockResolvedValue(
      Array.from({ length: conflictsCount }, (_, i) => ({ id: `conf-${i}` } as Appointment)),
    ),
    listByProfessionalAndDay: jest.fn(),
    findByProfessionalAndRange: jest.fn(),
    list: jest.fn(),
    create: jest.fn().mockResolvedValue({
      id: 'new-appt', tenantId: 't1', professionalId: 'p1',
      clientName: 'João', clientPhone: '11999', startsAt: futureDate,
      endsAt: new Date(futureDate.getTime() + 3_600_000),
      status: 'CONFIRMED', services: [], createdAt: new Date(), updatedAt: new Date(),
    }),
    updateStatus: jest.fn(),
  }

  const serviceRepo: IServiceRepository = {
    findById: jest.fn(),
    findByTenant: jest.fn(),
    findManyByIds: jest.fn().mockResolvedValue([mockService]),
    create: jest.fn(),
    update: jest.fn(),
  }

  return { appointmentRepo, serviceRepo }
}

function makeLock(acquireResult = true): RedisLockService {
  return {
    acquire: jest.fn().mockResolvedValue(acquireResult),
    release: jest.fn().mockResolvedValue(undefined),
  }
}

describe('CreateAppointmentUseCase', () => {
  const baseInput = {
    tenantId: 't1',
    professionalId: 'p1',
    clientName: 'João',
    clientPhone: '11999998888',
    serviceIds: ['s1'],
    startsAt: futureDate,
  }

  it('cria agendamento com sucesso quando slot está livre', async () => {
    const { appointmentRepo, serviceRepo } = makeRepos(0)
    const lock = makeLock(true)
    const useCase = new CreateAppointmentUseCase(appointmentRepo, serviceRepo, lock)

    const result = await useCase.execute(baseInput)

    expect(result.status).toBe('CONFIRMED')
    expect(appointmentRepo.create).toHaveBeenCalledTimes(1)
    expect(lock.release).toHaveBeenCalledTimes(1)
  })

  it('lança PastDateError quando startsAt está no passado', async () => {
    const { appointmentRepo, serviceRepo } = makeRepos()
    const lock = makeLock()
    const useCase = new CreateAppointmentUseCase(appointmentRepo, serviceRepo, lock)

    await expect(
      useCase.execute({ ...baseInput, startsAt: new Date(Date.now() - 1000) }),
    ).rejects.toThrow(PastDateError)

    expect(lock.acquire).not.toHaveBeenCalled()
  })

  it('lança AppointmentConflictError quando Redis lock não é adquirido', async () => {
    const { appointmentRepo, serviceRepo } = makeRepos(0)
    const lock = makeLock(false)
    const useCase = new CreateAppointmentUseCase(appointmentRepo, serviceRepo, lock)

    await expect(useCase.execute(baseInput)).rejects.toThrow(AppointmentConflictError)
    expect(appointmentRepo.findConflicts).not.toHaveBeenCalled()
  })

  it('lança AppointmentConflictError quando há conflito no banco', async () => {
    const { appointmentRepo, serviceRepo } = makeRepos(1)
    const lock = makeLock(true)
    const useCase = new CreateAppointmentUseCase(appointmentRepo, serviceRepo, lock)

    await expect(useCase.execute(baseInput)).rejects.toThrow(AppointmentConflictError)
    expect(appointmentRepo.create).not.toHaveBeenCalled()
  })

  it('sempre libera o lock — mesmo quando há conflito no banco', async () => {
    const { appointmentRepo, serviceRepo } = makeRepos(1)
    const lock = makeLock(true)
    const useCase = new CreateAppointmentUseCase(appointmentRepo, serviceRepo, lock)

    await useCase.execute(baseInput).catch(() => {})

    expect(lock.release).toHaveBeenCalledTimes(1)
  })

  it('simula dois requests simultâneos — apenas um cria o agendamento', async () => {
    let lockHeld = false

    const lock: RedisLockService = {
      acquire: jest.fn().mockImplementation(async () => {
        if (lockHeld) return false
        lockHeld = true
        return true
      }),
      release: jest.fn().mockImplementation(async () => { lockHeld = false }),
    }

    const { appointmentRepo, serviceRepo } = makeRepos(0)
    const useCase = new CreateAppointmentUseCase(appointmentRepo, serviceRepo, lock)

    const [r1, r2] = await Promise.allSettled([
      useCase.execute(baseInput),
      useCase.execute(baseInput),
    ])

    const fulfilled = [r1, r2].filter((r) => r.status === 'fulfilled')
    const rejected = [r1, r2].filter((r) => r.status === 'rejected')

    expect(fulfilled).toHaveLength(1)
    expect(rejected).toHaveLength(1)
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(AppointmentConflictError)
  })
})
