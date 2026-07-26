import { auth } from '@/lib/auth'
import BlocksClient from './BlocksClient'

export default async function BloquearPage() {
  const session = await auth()
  return <BlocksClient token={session!.user.accessToken} />
}
