export interface Review {
  id: string
  tenantId: string
  appointmentId: string
  professionalId: string
  clientName: string
  rating: number
  comment?: string
  createdAt: Date
}

export interface CreateReviewInput {
  tenantId: string
  appointmentId: string
  professionalId: string
  clientName: string
  rating: number
  comment?: string
}
