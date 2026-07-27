import { LoyaltyCard } from '../entities/LoyaltyCard'

export interface ILoyaltyCardRepository {
  findByPhone(tenantId: string, clientPhone: string): Promise<LoyaltyCard | null>
  upsert(tenantId: string, clientPhone: string): Promise<LoyaltyCard>
  incrementCompleted(tenantId: string, clientPhone: string): Promise<LoyaltyCard>
  redeem(tenantId: string, clientPhone: string): Promise<LoyaltyCard>
}
