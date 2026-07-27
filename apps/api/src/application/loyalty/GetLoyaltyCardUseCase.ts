import { Injectable, Inject } from '@nestjs/common'
import { ILoyaltyCardRepository } from '@domain/repositories/ILoyaltyCardRepository'

export interface GetLoyaltyCardInput {
  tenantId: string
  clientPhone: string
}

export interface GetLoyaltyCardOutput {
  completedCuts: number
  redeemedCuts: number
  availableRewards: number
  progressToNextReward: number
}

const CUTS_PER_REWARD = 10

@Injectable()
export class GetLoyaltyCardUseCase {
  constructor(
    @Inject('ILoyaltyCardRepository')
    private readonly loyaltyCardRepository: ILoyaltyCardRepository,
  ) {}

  async execute(input: GetLoyaltyCardInput): Promise<GetLoyaltyCardOutput> {
    const card = await this.loyaltyCardRepository.findByPhone(input.tenantId, input.clientPhone)

    const completedCuts = card?.completedCuts ?? 0
    const redeemedCuts = card?.redeemedCuts ?? 0
    const effectiveCuts = completedCuts - redeemedCuts * CUTS_PER_REWARD
    const availableRewards = Math.floor(effectiveCuts / CUTS_PER_REWARD)
    const progressToNextReward = effectiveCuts % CUTS_PER_REWARD

    return { completedCuts, redeemedCuts, availableRewards, progressToNextReward }
  }
}
