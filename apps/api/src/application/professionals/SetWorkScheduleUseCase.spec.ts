import { SetWorkScheduleUseCase } from './SetWorkScheduleUseCase'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { IWorkScheduleRepository } from '@domain/repositories/IWorkScheduleRepository'
import { ProfessionalNotFoundError, DomainError } from '@domain/errors'

const mockProfessional = { id: 'p1', tenantId: 't1', userId: 'u1', isActive: true }

const makeRepos = (proExists = true) => {
  const proRepo: IProfessionalRepository = {
    findById: jest.fn().mockResolvedValue(proExists ? mockProfessional : null),
    findByUserId: jest.fn(),
    findByTenant: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
  const scheduleRepo: IWorkScheduleRepository = {
    findByProfessional: jest.fn(),
    findByProfessionalAndDay: jest.fn(),
    upsert: jest.fn().mockImplementation((input) => Promise.resolve({ id: 'ws1', ...input })),
  }
  return { proRepo, scheduleRepo }
}

describe('SetWorkScheduleUseCase', () => {
  it('cria/atualiza jornada com dados válidos', async () => {
    const { proRepo, scheduleRepo } = makeRepos()
    const useCase = new SetWorkScheduleUseCase(proRepo, scheduleRepo)

    const result = await useCase.execute({
      professionalId: 'p1', dayOfWeek: 'MONDAY',
      startTime: '09:00', endTime: '19:00',
      breakStart: '12:00', breakEnd: '13:00',
    })

    expect(result.dayOfWeek).toBe('MONDAY')
    expect(scheduleRepo.upsert).toHaveBeenCalledTimes(1)
  })

  it('lança ProfessionalNotFoundError quando profissional não existe', async () => {
    const { proRepo, scheduleRepo } = makeRepos(false)
    const useCase = new SetWorkScheduleUseCase(proRepo, scheduleRepo)

    await expect(
      useCase.execute({ professionalId: 'nao-existe', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '18:00' }),
    ).rejects.toThrow(ProfessionalNotFoundError)
  })

  it('lança DomainError quando horário de início >= fim', async () => {
    const { proRepo, scheduleRepo } = makeRepos()
    const useCase = new SetWorkScheduleUseCase(proRepo, scheduleRepo)

    await expect(
      useCase.execute({ professionalId: 'p1', dayOfWeek: 'MONDAY', startTime: '19:00', endTime: '09:00' }),
    ).rejects.toThrow(DomainError)
  })

  it('lança DomainError quando almoço está fora da jornada', async () => {
    const { proRepo, scheduleRepo } = makeRepos()
    const useCase = new SetWorkScheduleUseCase(proRepo, scheduleRepo)

    await expect(
      useCase.execute({
        professionalId: 'p1', dayOfWeek: 'MONDAY',
        startTime: '13:00', endTime: '19:00',
        breakStart: '11:00', breakEnd: '12:00',
      }),
    ).rejects.toThrow(DomainError)
  })
})
