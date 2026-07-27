'use client'

import { addDays, format, isSameDay, isToday, isPast, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAYS_IN_STRIP = 14

interface WeekStripProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  weekOffset: number
  onWeekChange: (offset: number) => void
}

export default function WeekStrip({
  selectedDate,
  onSelectDate,
  weekOffset,
  onWeekChange,
}: WeekStripProps) {
  const today = startOfDay(new Date())
  const startDate = addDays(today, weekOffset * 7)
  const days = Array.from({ length: DAYS_IN_STRIP }, (_, i) => addDays(startDate, i))

  function DayButton({ day }: { day: Date }) {
    const past = isPast(startOfDay(day)) && !isToday(day)
    const selected = selectedDate ? isSameDay(day, selectedDate) : false
    const todayDay = isToday(day)

    return (
      <button
        onClick={() => !past && onSelectDate(day)}
        disabled={past}
        aria-pressed={selected}
        aria-label={format(day, "dd 'de' MMMM", { locale: ptBR })}
        className={`
          flex flex-col items-center justify-center w-full py-1 rounded-lg transition-all min-h-[44px]
          ${past ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
          ${selected
            ? 'bg-[#1a1a1a] text-white shadow-sm'
            : todayDay
            ? 'bg-[#c9a84c]/10 text-[#b8973b] border border-[#c9a84c]/30'
            : 'hover:bg-gray-100 text-gray-600'
          }
        `}
      >
        <span className="text-[10px] uppercase font-semibold leading-none mb-0.5 opacity-60">
          {format(day, 'EEEEE', { locale: ptBR })}
        </span>
        <span className="font-bold text-sm leading-none">
          {format(day, 'dd')}
        </span>
      </button>
    )
  }

  return (
    <div className="select-none mb-1">
      {/* Month label + nav */}
      <div className="flex items-center justify-between mb-1.5">
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          disabled={weekOffset <= 0}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-xs font-medium text-gray-500 capitalize">
          {format(startDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>
        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Próxima semana"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Week rows */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.slice(0, 7).map((day) => <DayButton key={day.toISOString()} day={day} />)}
      </div>
      <div className="grid grid-cols-7 gap-0.5 mt-0.5">
        {days.slice(7).map((day) => <DayButton key={day.toISOString()} day={day} />)}
      </div>
    </div>
  )
}
