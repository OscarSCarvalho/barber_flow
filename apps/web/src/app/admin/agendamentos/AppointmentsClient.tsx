'use client'

import { useState, useTransition } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, Search, CalendarDays, UserCircle2, AlertCircle } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { Appointment, Professional } from '@/types'

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
  COMPLETED: 'Concluído',
  PENDING: 'Pendente',
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-amber-100 text-amber-700',
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function todayParam() {
  return format(new Date(), 'yyyy-MM-dd')
}

interface AppointmentsClientProps {
  initialAppointments: Appointment[]
  professionals: Professional[]
  token: string
}

export default function AppointmentsClient({
  initialAppointments,
  professionals,
  token,
}: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [dateFrom, setDateFrom] = useState(todayParam())
  const [dateTo, setDateTo] = useState(todayParam())
  const [professionalId, setProfessionalId] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function fetchAppointments() {
    setError(null)
    const params = new URLSearchParams()
    if (dateFrom) params.set('dateFrom', `${dateFrom}T00:00:00.000Z`)
    if (dateTo) params.set('dateTo', `${dateTo}T23:59:59.999Z`)
    if (professionalId) params.set('professionalId', professionalId)
    if (status) params.set('status', status)

    startTransition(async () => {
      try {
        const data = await api.get<Appointment[]>(`/appointments?${params}`, { token })
        setAppointments(data)
      } catch (err: unknown) {
        setError((err as Error).message ?? 'Erro ao buscar agendamentos')
      }
    })
  }

  async function handleCancel(id: string) {
    if (!confirm('Cancelar este agendamento? Esta ação não pode ser desfeita.')) return
    setCancellingId(id)
    try {
      const updated = await api.patch<Appointment>(`/appointments/${id}/cancel`, {}, { token })
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)))
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Erro ao cancelar agendamento')
      }
    } finally {
      setCancellingId(null)
    }
  }

  const totalRevenue = appointments
    .filter((a) => a.status === 'CONFIRMED')
    .reduce((sum, a) => sum + a.services.reduce((s, svc) => s + svc.priceSnapshot, 0), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
        {appointments.length > 0 && (
          <p className="text-sm text-gray-500">
            {appointments.length} resultado(s) ·{' '}
            <span className="font-semibold text-gray-900">{formatPrice(totalRevenue)}</span> confirmados
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">De</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Até</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Profissional</label>
            <select
              value={professionalId}
              onChange={(e) => setProfessionalId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] bg-white"
            >
              <option value="">Todos</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] bg-white"
            >
              <option value="">Todos</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="NO_SHOW">Não compareceu</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={fetchAppointments}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Search size={14} />
            {isPending ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Table */}
      {appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum agendamento encontrado para os filtros selecionados.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Horário</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Profissional</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Serviços</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {appointments.map((appt) => {
                const profName = professionals.find((p) => p.id === appt.professionalId)?.user.name ?? '—'
                const total = appt.services.reduce((s, svc) => s + svc.priceSnapshot, 0)
                const totalDuration = appt.services.reduce((s, svc) => s + svc.durationSnapshot, 0)
                const isCancelling = cancellingId === appt.id

                return (
                  <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      <p>{format(new Date(appt.startsAt), "dd/MM · HH:mm", { locale: ptBR })}</p>
                      <p className="text-xs text-gray-400">{totalDuration} min</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{appt.clientName}</p>
                      <p className="text-xs text-gray-500">{appt.clientPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      <span className="flex items-center gap-1.5">
                        <UserCircle2 size={13} className="text-gray-400" />
                        {profName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {appt.services.length} serviço(s)
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatPrice(total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[appt.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {STATUS_LABELS[appt.status] ?? appt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {appt.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          disabled={isCancelling}
                          className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-40 rounded transition-colors"
                          title="Cancelar agendamento"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
