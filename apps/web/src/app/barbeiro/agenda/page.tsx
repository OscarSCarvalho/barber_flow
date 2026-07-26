import { auth } from '@/lib/auth'
import AgendaClient from './AgendaClient'

export default async function AgendaPage() {
  const session = await auth()
  return <AgendaClient token={session!.user.accessToken} />
}
