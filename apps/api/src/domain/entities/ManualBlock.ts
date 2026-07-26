export interface ManualBlock {
  id: string
  professionalId: string
  startsAt: Date
  endsAt: Date
  reason?: string
  createdAt: Date
}

export interface CreateManualBlockInput {
  professionalId: string
  startsAt: Date
  endsAt: Date
  reason?: string
}
