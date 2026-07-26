import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Service } from '@/types'
import ServicesClient from './ServicesClient'

export default async function ServicosPage() {
  const session = await auth()
  const services = await api
    .get<Service[]>('/services?all=true', { token: session!.user.accessToken })
    .catch(() => [] as Service[])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} serviços cadastrados</p>
        </div>
      </div>
      <ServicesClient initialServices={services} token={session!.user.accessToken} />
    </div>
  )
}
