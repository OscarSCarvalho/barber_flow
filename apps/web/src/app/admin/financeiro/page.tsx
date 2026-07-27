import { auth } from '@/lib/auth'
import FinanceiroClient from './FinanceiroClient'

export default async function FinanceiroPage() {
  const session = await auth()
  return <FinanceiroClient token={session!.user.accessToken} />
}
