'use client'

import { useState } from 'react'
import { TimeSlot, Professional } from '@/types'
import { api } from '@/lib/api'
import AvailabilityCalendar from '@/components/calendar/AvailabilityCalendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DateTimePickerProps {
  professionalId: string | null
  professionals: Professional[]
  serviceIds: string[]
  isAnyProfessional: boolean
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot, resolvedProfessionalId?: string) => void
  onNext: () => void
  onBack: () => void
}

export default function DateTimePicker({
  professionalId,
  professionals,
  serviceIds,
  isAnyProfessional,
  selectedSlot,
  onSelectSlot,
  onNext,
  onBack,
}: DateTimePickerProps) {
  const [resolvingSlot, setResolvingSlot] = useState(false)

  async function handleSlotSelect(slot: TimeSlot) {
    if (!isAnyProfessional) {
      onSelectSlot(slot)
      return
    }

    // Modo "Qualquer profissional": resolve quem está disponível no slot
    setResolvingSlot(true)
    try {
      const params = new URLSearchParams({
        date: new Date(slot.startsAt).toISOString().split('T')[0],
        slotStartsAt: new Date(slot.startsAt).toISOString(),
      })
      serviceIds.forEach((id) => params.append('serviceIds', id))

      const available = await api.get<Array<{ id: string; hasSlotAvailable: boolean }>>(
        `/availability/professionals?${params.toString()}`,
      )

      const first = available.find((p) => p.hasSlotAvailable)
      if (first) {
        onSelectSlot(slot, first.id)
      } else {
        alert('Nenhum profissional disponível neste horário. Escolha outro.')
      }
    } catch {
      alert('Erro ao verificar disponibilidade. Tente novamente.')
    } finally {
      setResolvingSlot(false)
    }
  }

  // Para modo "Qualquer profissional", usa o primeiro profissional para mostrar slots disponíveis
  const calendarProfessionalId = isAnyProfessional
    ? (professionals[0]?.id ?? null)
    : professionalId

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Escolha a data e horário</h2>
      <p className="text-sm text-gray-500 mb-2 sm:mb-5">
        {isAnyProfessional
          ? 'Selecione um horário — atribuiremos o profissional disponível.'
          : 'Selecione um dia e clique no horário desejado.'}
      </p>

      {resolvingSlot && (
        <div className="mb-3 text-center text-sm text-gray-500 animate-pulse">
          Verificando disponibilidade...
        </div>
      )}

      <AvailabilityCalendar
        professionalId={calendarProfessionalId}
        serviceIds={serviceIds}
        selectedSlot={selectedSlot}
        onSelectSlot={handleSlotSelect}
      />

      {selectedSlot && (
        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm text-emerald-700 font-medium">
            Horário selecionado:{' '}
            {format(new Date(selectedSlot.startsAt), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      )}

      <div className="mt-3 sm:mt-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!selectedSlot}
          className="flex-1 bg-[#1a1a1a] hover:bg-gray-800 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}
