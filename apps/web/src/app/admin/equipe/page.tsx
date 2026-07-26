import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Professional } from '@/types'
import TeamClient from './TeamClient'

export default async function EquipePage() {
  const session = await auth()
  const professionals = await api
    .get<Professional[]>('/professionals', { token: session!.user.accessToken })
    .catch(() => [] as Professional[])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="text-sm text-gray-500 mt-0.5">{professionals.length} profissional(is) ativo(s)</p>
        </div>
      </div>
      <TeamClient initialProfessionals={professionals} token={session!.user.accessToken} />
    </div>
  )
}
