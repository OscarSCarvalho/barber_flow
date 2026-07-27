import { CheckAvailabilityUseCase } from './CheckAvailabilityUseCase'
import { IWorkScheduleRepository } from '@domain/repositories/IWorkScheduleRepository'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { IManualBlockRepository } from '@domain/repositories/IManualBlockRepository'
import { IServiceRepository } from '@domain/repositories/IServiceRepository'

const makeDate = (h: number, m = 0) => {
  const d = new Date('2026-08-01T00:00:00.000Z')
  d.setHours(h, m, 0, 0)
  return d
}

const mockService = { id: 's1', tenantId: 't1', name: 'Corte', durationMinutes: 60, priceInCents: 4000, isActive: true, createdAt: new Date(), updatedAt: new Date() }

function makeRepos(overrides: Partial<{
  schedule: Awaited<ReturnType<IWorkScheduleRepository['findByProfessionalAndDay']>>,
  appointments: Awaited<ReturnType<IAppointmentRepository['listByProfessionalAndDay']>>,
  blocks: Awaited<ReturnType<IManualBlockRepository['findByProfessionalAndRange']>>,
}> = {}) {
  const workScheduleRepo: IWorkScheduleRepository = {
    findByProfessional: jest.fn(),
    findByProfessionalAndDay: jest.fn().mockResolvedValue(overrides.schedule ?? {
      id: 'ws1',
      professionalId: 'p1',
      dayOfWeek: 'SATURDAY',
      startTime: '09:00',
      endTime: '19:00',
      breakStart: '12:00',
      breakEnd: '13:00',
    }),
    upsert: jest.fn(),
  }

  const appointmentRepo: IAppointmentRepository = {
    findById: jest.fn(),
    findConflicts: jest.fn(),
    listByProfessionalAndDay: jest.fn().mockResolvedValue(overrides.appointments ?? []),
    findByProfessionalAndRange: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    updateNotes: jest.fn(),
    findPendingReminders: jest.fn(),
    markReminderSent: jest.fn(),
    getFinancialSummary: jest.fn(),
  }

  const manualBlockRepo: IManualBlockRepository = {
    findById: jest.fn(),
    findByProfessionalAndRange: jest.fn().mockResolvedValue(overrides.blocks ?? []),
    create: jest.fn(),
    delete: jest.fn(),
  }

  const serviceRepo: IServiceRepository = {
    findById: jest.fn(),
    findByTenant: jest.fn(),
    findManyByIds: jest.fn().mockResolvedValue([mockService]),
    create: jest.fn(),
    update: jest.fn(),
  }

  return { workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo }
}

describe('CheckAvailabilityUseCase', () => {
  const date = new Date('2026-08-01')

  it('retorna slots disponíveis para dia sem agendamentos', async () => {
    const { workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo } = makeRepos()
    const useCase = new CheckAvailabilityUseCase(workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo)

    const result = await useCase.execute({ professionalId: 'p1', serviceIds: ['s1'], date })

    expect(result.notWorking).toBe(false)
    const available = result.slots.filter((s) => s.status === 'AVAILABLE')
    expect(available.length).toBeGreaterThan(0)
  })

  it('retorna notWorking=true quando profissional não tem jornada no dia', async () => {
    const { workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo } = makeRepos({ schedule: null })
    ;(workScheduleRepo.findByProfessionalAndDay as jest.Mock).mockResolvedValue(null)
    const useCase = new CheckAvailabilityUseCase(workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo)

    const result = await useCase.execute({ professionalId: 'p1', serviceIds: ['s1'], date })

    expect(result.notWorking).toBe(true)
    expect(result.slots).toHaveLength(0)
  })

  it('bloqueia slot que conflita com agendamento confirmado', async () => {
    const { workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo } = makeRepos({
      appointments: [{
        id: 'a1', tenantId: 't1', professionalId: 'p1', clientName: 'João', clientPhone: '11999',
        startsAt: makeDate(10), endsAt: makeDate(11),
        status: 'CONFIRMED', services: [], createdAt: new Date(), updatedAt: new Date(),
      }],
    })
    const useCase = new CheckAvailabilityUseCase(workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo)

    const result = await useCase.execute({ professionalId: 'p1', serviceIds: ['s1'], date })

    const blockedAt10 = result.slots.find(
      (s) => s.startsAt.getHours() === 10 && s.status === 'BLOCKED' && s.blockReason === 'APPOINTMENT',
    )
    expect(blockedAt10).toBeDefined()
  })

  it('bloqueia slot que ultrapassa horário de almoço', async () => {
    const { workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo } = makeRepos()
    const useCase = new CheckAvailabilityUseCase(workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo)

    const result = await useCase.execute({ professionalId: 'p1', serviceIds: ['s1'], date })

    const lunchBlockAt1130 = result.slots.find(
      (s) => s.startsAt.getHours() === 11 && s.startsAt.getMinutes() === 30 && s.blockReason === 'LUNCH',
    )
    expect(lunchBlockAt1130).toBeDefined()
  })

  it('bloqueia slot que ultrapassa fim do expediente', async () => {
    const { workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo } = makeRepos()
    const useCase = new CheckAvailabilityUseCase(workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo)

    const result = await useCase.execute({ professionalId: 'p1', serviceIds: ['s1'], date })

    const lateSlots = result.slots.filter(
      (s) => s.startsAt.getHours() >= 18 && s.startsAt.getMinutes() >= 30 && s.blockReason === 'OUTSIDE_HOURS',
    )
    expect(lateSlots.length).toBeGreaterThan(0)
  })

  it('bloqueia slot que conflita com bloqueio manual', async () => {
    const { workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo } = makeRepos({
      blocks: [{
        id: 'mb1', professionalId: 'p1', reason: 'Treinamento',
        startsAt: makeDate(15), endsAt: makeDate(16), createdAt: new Date(),
      }],
    })
    const useCase = new CheckAvailabilityUseCase(workScheduleRepo, appointmentRepo, manualBlockRepo, serviceRepo)

    const result = await useCase.execute({ professionalId: 'p1', serviceIds: ['s1'], date })

    const manualBlockedAt15 = result.slots.find(
      (s) => s.startsAt.getHours() === 15 && s.blockReason === 'MANUAL_BLOCK',
    )
    expect(manualBlockedAt15).toBeDefined()
  })
})
