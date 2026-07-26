export interface Professional {
  id: string
  tenantId: string
  userId: string
  bio?: string
  avatarUrl?: string
  isActive: boolean
}

export interface CreateProfessionalInput {
  tenantId: string
  userId: string
  bio?: string
  avatarUrl?: string
}
