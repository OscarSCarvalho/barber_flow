import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import FidelidadeClient from './FidelidadeClient'

export interface LoyaltyCardAdmin {
  id: string
  clientPhone: string
  completedCuts: number
  redeemedCuts: number
  availableRewards: number
  progressToNextReward: number
  createdAt: string
  updatedAt: string
}

export default async function FidelidadePage() {
  const session = await auth()
  const cards = await api
    .get<LoyaltyCardAdmin[]>('/loyalty/admin', { token: session!.user.accessToken })
    .catch(() => [] as LoyaltyCardAdmin[])

  return <FidelidadeClient initialCards={cards} token={session!.user.accessToken} />
}
