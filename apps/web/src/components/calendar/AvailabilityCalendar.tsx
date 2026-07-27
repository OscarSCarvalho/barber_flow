'use client'

import { useState, useRef } from 'react'
import { TimeSlot } from '@/types'
import { useAvailability } from '@/hooks/use-availability'
import WeekStrip from './WeekStrip'
import SlotGrid from './SlotGrid'

interface AvailabilityCalendarProps {
  professionalId: string | null
  serviceIds: string[]
  selectedSlot: TimeSlot | null
  onSelectSlot: (slot: TimeSlot) => void
}

export default function AvailabilityCalendar({
  professionalId,
  serviceIds,
  selectedSlot,
  onSelectSlot,
}: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)
  const slotGridRef = useRef<HTMLDivElement>(null)

  const { slots, totalDurationMinutes, notWorking, isLoading } = useAvailability(
    professionalId,
    serviceIds,
    selectedDate,
  )

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    if (selectedSlot) onSelectSlot(null as unknown as TimeSlot)

    // Scroll slot grid into view so user sees the time options appear
    setTimeout(() => {
      slotGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 150)
  }

  const canShowSlots = !!professionalId && serviceIds.length > 0

  return (
    <div>
      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        weekOffset={weekOffset}
        onWeekChange={setWeekOffset}
      />

      {!canShowSlots && (
        <div className="mt-4 py-6 text-center">
          <p className="text-gray-400 text-sm">
            Selecione os serviços e o profissional para ver os horários disponíveis.
          </p>
        </div>
      )}

      {canShowSlots && (
        <div ref={slotGridRef}>
          <SlotGrid
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={onSelectSlot}
            isLoading={isLoading && !!selectedDate}
            notWorking={notWorking}
            totalDurationMinutes={totalDurationMinutes}
          />
        </div>
      )}
    </div>
  )
}
