import { RegisterUserUseCase } from './RegisterUserUseCase'
import { IUserRepository } from '@domain/repositories/IUserRepository'
import { EmailAlreadyInUseError } from '@domain/errors'
import { User } from '@domain/entities/User'

const makeRepo = (existingUser: User | null = null): IUserRepository => ({
  findById: jest.fn(),
  findByEmail: jest.fn().mockResolvedValue(existingUser),
  create: jest.fn().mockImplementation((input) => Promise.resolve({
    id: 'user-uuid',
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
})

describe('RegisterUserUseCase', () => {
  it('cria usuário com senha hasheada quando e-mail não está em uso', async () => {
    const repo = makeRepo(null)
    const useCase = new RegisterUserUseCase(repo)

    const user = await useCase.execute({
      tenantId: 't1',
      name: 'João',
      email: 'joao@test.com',
      password: 'senha123',
    })

    expect(user.id).toBe('user-uuid')
    expect(user.email).toBe('joao@test.com')
    expect(user.passwordHash).not.toBe('senha123')
    expect(user.role).toBe('CLIENT')
  })

  it('atribui role passado como parâmetro', async () => {
    const repo = makeRepo(null)
    const useCase = new RegisterUserUseCase(repo)

    const user = await useCase.execute({
      tenantId: 't1',
      name: 'Carlos',
      email: 'carlos@test.com',
      password: 'senha123',
      role: 'BARBER',
    })

    expect(user.role).toBe('BARBER')
  })

  it('lança EmailAlreadyInUseError quando e-mail já existe no tenant', async () => {
    const existing: User = {
      id: 'u1', tenantId: 't1', name: 'Já existe', email: 'joao@test.com',
      passwordHash: 'hash', role: 'CLIENT', createdAt: new Date(), updatedAt: new Date(),
    }
    const repo = makeRepo(existing)
    const useCase = new RegisterUserUseCase(repo)

    await expect(
      useCase.execute({ tenantId: 't1', name: 'João', email: 'joao@test.com', password: 'senha123' }),
    ).rejects.toThrow(EmailAlreadyInUseError)
  })

  it('não chama create quando e-mail já existe', async () => {
    const existing: User = {
      id: 'u1', tenantId: 't1', name: 'Já existe', email: 'joao@test.com',
      passwordHash: 'hash', role: 'CLIENT', createdAt: new Date(), updatedAt: new Date(),
    }
    const repo = makeRepo(existing)
    const useCase = new RegisterUserUseCase(repo)

    await useCase.execute({ tenantId: 't1', name: 'João', email: 'joao@test.com', password: 'senha123' }).catch(() => {})

    expect(repo.create).not.toHaveBeenCalled()
  })
})
