export interface LoyaltyCard {
  id: string
  tenantId: string
  clientPhone: string
  completedCuts: number
  redeemedCuts: number
  createdAt: Date
  updatedAt: Date
}
