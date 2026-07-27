'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format, addDays, startOfDay, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarX } from 'lucide-react'
import AppointmentCard from '@/components/barbeiro/AppointmentCard'
import { api } from '@/lib/api'

interface Block {
  id: string
  startsAt: string
  endsAt: string
  reason?: string
}

interface BarberAppt {
  id: string
  clientName: string
  clientPhone: string
  startsAt: string
  endsAt: string
  status: string
  barberNotes?: string
  services: Array<{ serviceId: string; priceSnapshot: number; durationSnapshot: number }>
}

export default function AgendaClient({ token }: { token: string }) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))

  const dateParam = format(selectedDate, 'yyyy-MM-dd')

  const fetcher = <T,>(url: string): Promise<T> => api.get<T>(url, { token })

  const { data, isLoading, mutate } = useSWR<{ appointments: BarberAppt[]; blocks: Block[] }>(
    `/manual-blocks/schedule?date=${dateParam}T00:00:00.000Z`,
    fetcher,
    { refreshInterval: 60_000 },
  )

  const appointments = data?.appointments ?? []
  const blocks: Block[] = data?.blocks ?? []

  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(new Date()), i))

  async function handleSaveNote(appointmentId: string, notes: string) {
    await api.patch(`/appointments/${appointmentId}/note`, { barberNotes: notes }, { token })
    mutate()
  }

  async function handleComplete(appointmentId: string) {
    await api.patch(`/appointments/${appointmentId}/complete`, {}, { token })
    mutate()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Minha Agenda</h1>

      {/* Week nav */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl text-sm transition-colors ${
                isSelected
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              <span className="text-xs capitalize">{format(day, 'EEE', { locale: ptBR })}</span>
              <span className="font-semibold">{format(day, 'dd')}</span>
            </button>
          )
        })}
      </div>

      <h2 className="text-sm font-medium text-gray-500 mb-4 capitalize">
        {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : appointments.length === 0 && blocks.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CalendarX size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum agendamento ou bloqueio para este dia.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((b) => (
            <div
              key={b.id}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm"
            >
              <p className="font-semibold text-amber-800">
                🔒 Bloqueado: {format(new Date(b.startsAt), 'HH:mm')} – {format(new Date(b.endsAt), 'HH:mm')}
              </p>
              {b.reason && <p className="text-amber-600 mt-0.5">{b.reason}</p>}
            </div>
          ))}
          {appointments.map((appt) => (
            <AppointmentCard
              key={appt.id}
              {...appt}
              onSaveNote={(notes: string) => handleSaveNote(appt.id, notes)}
              onComplete={() => handleComplete(appt.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
