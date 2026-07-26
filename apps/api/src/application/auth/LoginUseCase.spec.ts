import * as bcrypt from 'bcryptjs'
import { LoginUseCase } from './LoginUseCase'
import { IUserRepository } from '@domain/repositories/IUserRepository'
import { InvalidCredentialsError } from '@domain/errors'
import { User } from '@domain/entities/User'

async function makeUserWithHash(password: string): Promise<User> {
  return {
    id: 'u1',
    tenantId: 't1',
    name: 'João',
    email: 'joao@test.com',
    passwordHash: await bcrypt.hash(password, 10),
    role: 'CLIENT',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

describe('LoginUseCase', () => {
  it('retorna usuário quando credenciais são válidas', async () => {
    const user = await makeUserWithHash('senha123')
    const repo: IUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(user),
      create: jest.fn(),
    }
    const useCase = new LoginUseCase(repo)

    const result = await useCase.execute({ tenantId: 't1', email: 'joao@test.com', password: 'senha123' })

    expect(result.id).toBe('u1')
    expect(result.email).toBe('joao@test.com')
  })

  it('lança InvalidCredentialsError quando usuário não existe', async () => {
    const repo: IUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    }
    const useCase = new LoginUseCase(repo)

    await expect(
      useCase.execute({ tenantId: 't1', email: 'naoexiste@test.com', password: 'qualquer' }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('lança InvalidCredentialsError quando senha está errada', async () => {
    const user = await makeUserWithHash('correta123')
    const repo: IUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(user),
      create: jest.fn(),
    }
    const useCase = new LoginUseCase(repo)

    await expect(
      useCase.execute({ tenantId: 't1', email: 'joao@test.com', password: 'errada123' }),
    ).rejects.toThrow(InvalidCredentialsError)
  })

  it('não expõe qual campo está errado (segurança)', async () => {
    const user = await makeUserWithHash('senha123')
    const repo: IUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(user),
      create: jest.fn(),
    }
    const useCase = new LoginUseCase(repo)

    const err1Promise = useCase.execute({ tenantId: 't1', email: 'naoexiste@test.com', password: 'qualquer' }).catch(e => e)
    const err2Promise = useCase.execute({ tenantId: 't1', email: 'joao@test.com', password: 'errada' }).catch(e => e)

    const [err1, err2] = await Promise.all([err1Promise, err2Promise])
    expect(err1.code).toBe(err2.code)
    expect(err1.message).toBe(err2.message)
  })
})
