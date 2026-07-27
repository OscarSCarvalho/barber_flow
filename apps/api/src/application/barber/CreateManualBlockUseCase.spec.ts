import { CreateManualBlockUseCase } from './CreateManualBlockUseCase'
import { IManualBlockRepository } from '@domain/repositories/IManualBlockRepository'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { AppointmentConflictError, PastDateError, ProfessionalNotFoundError } from '@domain/errors'
import { Professional } from '@domain/entities/Professional'
import { ManualBlock } from '@domain/entities/ManualBlock'

const futurePlus1h = new Date(Date.now() + 60 * 60 * 1000)
const futurePlus2h = new Date(Date.now() + 2 * 60 * 60 * 1000)

const mockProfessional: Professional = {
  id: 'prof-1',
  tenantId: 'tenant-1',
  userId: 'user-1',
  isActive: true,
}

const mockBlock: ManualBlock = {
  id: 'block-1',
  professionalId: 'prof-1',
  startsAt: futurePlus1h,
  endsAt: futurePlus2h,
  reason: 'Almoço',
  createdAt: new Date(),
}

function makeProfRepo(found = true): IProfessionalRepository {
  return {
    findById: jest.fn(),
    findByUserId: jest.fn().mockResolvedValue(found ? mockProfessional : null),
    findByTenant: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
}

function makeApptRepo(conflictsCount = 0): IAppointmentRepository {
  return {
    findById: jest.fn(),
    findConflicts: jest.fn().mockResolvedValue(
      Array.from({ length: conflictsCount }, (_, i) => ({ id: `c${i}` })),
    ),
    listByProfessionalAndDay: jest.fn(),
    findByProfessionalAndRange: jest.fn(),
    list: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
    updateNotes: jest.fn(),
    findPendingReminders: jest.fn(),
    markReminderSent: jest.fn(),
    getFinancialSummary: jest.fn(),
  }
}

function makeBlockRepo(): IManualBlockRepository {
  return {
    findById: jest.fn(),
    findByProfessionalAndRange: jest.fn(),
    create: jest.fn().mockResolvedValue(mockBlock),
    delete: jest.fn(),
  }
}

describe('CreateManualBlockUseCase', () => {
  const baseInput = {
    userId: 'user-1',
    startsAt: futurePlus1h,
    endsAt: futurePlus2h,
    reason: 'Almoço',
  }

  it('cria bloqueio manual com sucesso quando slot está livre', async () => {
    const useCase = new CreateManualBlockUseCase(makeProfRepo(), makeApptRepo(0), makeBlockRepo())
    const result = await useCase.execute(baseInput)
    expect(result.id).toBe('block-1')
    expect(result.reason).toBe('Almoço')
  })

  it('lança PastDateError quando startsAt está no passado', async () => {
    const useCase = new CreateManualBlockUseCase(makeProfRepo(), makeApptRepo(), makeBlockRepo())
    await expect(
      useCase.execute({ ...baseInput, startsAt: new Date(Date.now() - 1000) }),
    ).rejects.toThrow(PastDateError)
  })

  it('lança AppointmentConflictError quando endsAt <= startsAt', async () => {
    const useCase = new CreateManualBlockUseCase(makeProfRepo(), makeApptRepo(), makeBlockRepo())
    await expect(
      useCase.execute({ ...baseInput, endsAt: futurePlus1h }),
    ).rejects.toThrow(AppointmentConflictError)
  })

  it('lança ProfessionalNotFoundError quando usuário não tem profissional vinculado', async () => {
    const useCase = new CreateManualBlockUseCase(makeProfRepo(false), makeApptRepo(), makeBlockRepo())
    await expect(useCase.execute(baseInput)).rejects.toThrow(ProfessionalNotFoundError)
  })

  it('lança AppointmentConflictError quando há agendamento no mesmo horário', async () => {
    const useCase = new CreateManualBlockUseCase(makeProfRepo(), makeApptRepo(1), makeBlockRepo())
    await expect(useCase.execute(baseInput)).rejects.toThrow(AppointmentConflictError)
  })

  it('passa reason undefined quando não informado', async () => {
    const blockRepo = makeBlockRepo()
    const useCase = new CreateManualBlockUseCase(makeProfRepo(), makeApptRepo(0), blockRepo)
    await useCase.execute({ ...baseInput, reason: undefined })
    expect(blockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ reason: undefined }),
    )
  })
})
