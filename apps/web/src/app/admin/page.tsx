import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { Service, Professional, Appointment } from '@/types'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

async function getDashboardData(token: string) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const [services, professionals, appointmentsToday] = await Promise.all([
    api.get<Service[]>('/services', { token }).catch(() => [] as Service[]),
    api.get<Professional[]>('/professionals', { token }).catch(() => [] as Professional[]),
    api.get<Appointment[]>(
      `/appointments?dateFrom=${today}T00:00:00.000Z&dateTo=${today}T23:59:59.999Z&status=CONFIRMED`,
      { token },
    ).catch(() => [] as Appointment[]),
  ])
  return { services, professionals, appointmentsToday }
}

export default async function AdminDashboardPage() {
  const session = await auth()
  const { services, professionals, appointmentsToday } = await getDashboardData(session!.user.accessToken)

  const revenueToday = appointmentsToday.reduce(
    (sum, a) => sum + a.services.reduce((s, svc) => s + svc.priceSnapshot, 0),
    0,
  )

  const stats = [
    { label: 'Serviços ativos', value: services.length },
    { label: 'Profissionais', value: professionals.length },
    { label: 'Agendamentos hoje', value: appointmentsToday.length },
    { label: 'Receita projetada', value: formatPrice(revenueToday) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Today's appointments preview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-gray-700">
            Agendamentos de hoje — {format(new Date(), 'dd/MM/yyyy')}
          </p>
          <Link
            href="/admin/agendamentos"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            Ver todos <ArrowRight size={12} />
          </Link>
        </div>

        {appointmentsToday.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-10">
            Nenhum agendamento confirmado para hoje.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {appointmentsToday.slice(0, 5).map((appt) => {
              const profName = professionals.find((p) => p.id === appt.professionalId)?.user.name ?? '—'
              const total = appt.services.reduce((s, svc) => s + svc.priceSnapshot, 0)
              return (
                <div key={appt.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="w-14 text-xs font-semibold text-gray-500 shrink-0">
                    {format(new Date(appt.startsAt), 'HH:mm')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{appt.clientName}</p>
                    <p className="text-xs text-gray-400 truncate">{profName}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 shrink-0">{formatPrice(total)}</p>
                </div>
              )
            })}
            {appointmentsToday.length > 5 && (
              <div className="px-6 py-3 text-center">
                <Link href="/admin/agendamentos" className="text-xs text-gray-500 hover:text-gray-900">
                  + {appointmentsToday.length - 5} agendamento(s) restantes
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
