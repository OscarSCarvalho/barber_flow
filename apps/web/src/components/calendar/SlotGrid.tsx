'use client'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TimeSlot } from '@/types'

const BLOCK_LABELS: Record<string, string> = {
  APPOINTMENT: 'Ocupado',
  MANUAL_BLOCK: 'Bloqueado',
  OUTSIDE_HOURS: 'Fora do horário',
  LUNCH: 'Almoço',
}

interface SlotGridProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
  isLoading: boolean
  notWorking: boolean
  totalDurationMinutes: number
}

export default function SlotGrid({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
  notWorking,
  totalDurationMinutes,
}: SlotGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-11 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (notWorking) {
    return (
      <div className="mt-4 py-10 text-center">
        <p className="text-gray-400 text-sm">Profissional não atende neste dia.</p>
      </div>
    )
  }

  const availableSlots = slots.filter((s) => s.status === 'AVAILABLE')

  if (availableSlots.length === 0 && slots.length > 0) {
    return (
      <div className="mt-4 py-10 text-center">
        <p className="text-gray-400 text-sm">Nenhum horário disponível neste dia.</p>
        <p className="text-gray-300 text-xs mt-1">Tente outra data ou profissional.</p>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="mt-4 py-10 text-center">
        <p className="text-gray-300 text-sm">Selecione uma data para ver os horários.</p>
      </div>
    )
  }

  return (
    <div>
      {totalDurationMinutes > 0 && (
        <p className="text-xs text-gray-400 mt-3 mb-2">
          Duração total: <span className="font-medium text-gray-600">{totalDurationMinutes} min</span>
          {' '}· {availableSlots.length} horário(s) disponível(is)
        </p>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
        {slots.map((slot) => {
          const isAvailable = slot.status === 'AVAILABLE'
          const isSelected =
            selectedSlot?.startsAt === slot.startsAt ||
            (selectedSlot && new Date(selectedSlot.startsAt).getTime() === new Date(slot.startsAt).getTime())

          if (!isAvailable) {
            return (
              <div
                key={slot.startsAt.toString()}
                title={BLOCK_LABELS[slot.blockReason ?? ''] ?? 'Indisponível'}
                className="h-11 rounded-lg bg-gray-100 flex items-center justify-center cursor-not-allowed"
                aria-disabled="true"
                aria-label={`${format(new Date(slot.startsAt), 'HH:mm')} — ${BLOCK_LABELS[slot.blockReason ?? ''] ?? 'Indisponível'}`}
              >
                <span className="text-gray-300 text-sm font-medium">
                  {format(new Date(slot.startsAt), 'HH:mm')}
                </span>
              </div>
            )
          }

          return (
            <button
              key={slot.startsAt.toString()}
              onClick={() => onSelectSlot(slot)}
              aria-pressed={!!isSelected}
              aria-label={`Selecionar horário ${format(new Date(slot.startsAt), "HH:mm", { locale: ptBR })}`}
              className={`
                h-11 rounded-lg text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a84c]
                ${isSelected
                  ? 'bg-[#1a1a1a] text-white shadow-md scale-[1.03]'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300'
                }
              `}
            >
              {format(new Date(slot.startsAt), 'HH:mm')}
            </button>
          )
        })}
      </div>
    </div>
  )
}
