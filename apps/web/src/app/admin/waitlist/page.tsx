import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import WaitlistClient from './WaitlistClient'

export interface WaitlistEntry {
  id: string
  professionalId: string
  clientName: string
  clientPhone: string
  serviceIds: string[]
  preferredDate?: string
  status: 'WAITING' | 'NOTIFIED' | 'CONFIRMED' | 'EXPIRED'
  notifiedAt?: string
  expiresAt?: string
  createdAt: string
}

export default async function WaitlistPage() {
  const session = await auth()
  const entries = await api
    .get<WaitlistEntry[]>('/waitlist', { token: session!.user.accessToken })
    .catch(() => [] as WaitlistEntry[])

  return <WaitlistClient initialEntries={entries} token={session!.user.accessToken} />
}
