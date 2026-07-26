import { CreateServiceUseCase, ServiceNameAlreadyExistsError } from './CreateServiceUseCase'
import { IServiceRepository } from '@domain/repositories/IServiceRepository'
import { DomainError } from '@domain/errors'

const makeRepo = (existing: string[] = []): IServiceRepository => ({
  findById: jest.fn(),
  findByTenant: jest.fn().mockResolvedValue(
    existing.map((name) => ({ id: `id-${name}`, tenantId: 't1', name, durationMinutes: 30, priceInCents: 1000, isActive: true, createdAt: new Date(), updatedAt: new Date() })),
  ),
  findManyByIds: jest.fn(),
  create: jest.fn().mockImplementation((input) => Promise.resolve({ id: 'new-id', ...input, isActive: true, createdAt: new Date(), updatedAt: new Date() })),
  update: jest.fn(),
})

describe('CreateServiceUseCase', () => {
  it('cria serviço com dados válidos', async () => {
    const repo = makeRepo()
    const useCase = new CreateServiceUseCase(repo)

    const svc = await useCase.execute({ tenantId: 't1', name: 'Corte', durationMinutes: 60, priceInCents: 4500 })

    expect(svc.name).toBe('Corte')
    expect(repo.create).toHaveBeenCalledTimes(1)
  })

  it('lança ServiceNameAlreadyExistsError quando nome já existe no tenant', async () => {
    const repo = makeRepo(['Corte'])
    const useCase = new CreateServiceUseCase(repo)

    await expect(
      useCase.execute({ tenantId: 't1', name: 'Corte', durationMinutes: 60, priceInCents: 4500 }),
    ).rejects.toThrow(ServiceNameAlreadyExistsError)
  })

  it('comparação de nome é case-insensitive', async () => {
    const repo = makeRepo(['corte'])
    const useCase = new CreateServiceUseCase(repo)

    await expect(
      useCase.execute({ tenantId: 't1', name: 'CORTE', durationMinutes: 60, priceInCents: 4500 }),
    ).rejects.toThrow(ServiceNameAlreadyExistsError)
  })

  it('lança DomainError quando duração é zero', async () => {
    const repo = makeRepo()
    const useCase = new CreateServiceUseCase(repo)

    await expect(
      useCase.execute({ tenantId: 't1', name: 'Corte', durationMinutes: 0, priceInCents: 4500 }),
    ).rejects.toThrow(DomainError)
  })

  it('lança DomainError quando preço é negativo', async () => {
    const repo = makeRepo()
    const useCase = new CreateServiceUseCase(repo)

    await expect(
      useCase.execute({ tenantId: 't1', name: 'Corte', durationMinutes: 60, priceInCents: -1 }),
    ).rejects.toThrow(DomainError)
  })

  it('permite preço zero (serviço gratuito)', async () => {
    const repo = makeRepo()
    const useCase = new CreateServiceUseCase(repo)

    const svc = await useCase.execute({ tenantId: 't1', name: 'Cortezinho', durationMinutes: 15, priceInCents: 0 })
    expect(svc.priceInCents).toBe(0)
  })
})
