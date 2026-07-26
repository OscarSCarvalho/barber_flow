export interface Service {
  id: string
  tenantId: string
  name: string
  durationMinutes: number
  priceInCents: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateServiceInput {
  tenantId: string
  name: string
  durationMinutes: number
  priceInCents: number
}
