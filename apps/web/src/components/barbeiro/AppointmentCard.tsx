'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, User, Phone, Scissors } from 'lucide-react'

interface AppointmentCardProps {
  clientName: string
  clientPhone: string
  startsAt: string
  endsAt: string
  services: { serviceId: string; durationSnapshot: number; priceSnapshot: number }[]
  status: string
}

const statusStyles: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
}

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
  COMPLETED: 'Concluído',
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AppointmentCard({
  clientName, clientPhone, startsAt, endsAt, services, status,
}: AppointmentCardProps) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const totalMinutes = services.reduce((a, s) => a + s.durationSnapshot, 0)
  const totalPrice = services.reduce((a, s) => a + s.priceSnapshot, 0)

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-[#c9a84c] shrink-0 mt-0.5" />
          <span className="font-semibold text-gray-900 text-sm">
            {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
          </span>
          <span className="text-xs text-gray-400">({totalMinutes} min)</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[status] ?? 'bg-gray-100 text-gray-500'}`}>
          {statusLabels[status] ?? status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-700">
        <User size={13} className="text-gray-400 shrink-0" />
        <span className="font-medium">{clientName}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Phone size={13} className="text-gray-400 shrink-0" />
        <span>{clientPhone}</span>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Scissors size={12} className="text-gray-400" />
          {services.length} serviço(s)
        </div>
        <span className="text-sm font-bold text-gray-900">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  )
}
