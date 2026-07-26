export type UserRole = 'ADMIN' | 'BARBER' | 'CLIENT'

export interface User {
  id: string
  tenantId: string
  name: string
  email: string
  passwordHash: string
  phone?: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  tenantId: string
  name: string
  email: string
  passwordHash: string
  phone?: string
  role: UserRole
}
