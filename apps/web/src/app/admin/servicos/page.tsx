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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-sm text-gray-500 mt-0.5">{services.length} serviço(s) cadastrado(s)</p>
        </div>
      </div>

      {/* Aviso informativo */}
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6">
        <span className="text-emerald-500 text-base mt-0.5">✓</span>
        <p className="text-sm text-emerald-700">
          Serviços criados ou editados aqui aparecem <strong>automaticamente</strong> na tela de agendamento dos clientes.
        </p>
      </div>

      <ServicesClient initialServices={services} token={session!.user.accessToken} />
    </div>
  )
}
