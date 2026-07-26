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

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => onWeekChange(weekOffset - 1)}
          disabled={weekOffset <= 0}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm font-medium text-gray-600">
          {format(startDate, "MMMM 'de' yyyy", { locale: ptBR })}
        </span>

        <button
          onClick={() => onWeekChange(weekOffset + 1)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Próxima semana"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.slice(0, 7).map((day) => {
          const past = isPast(startOfDay(day)) && !isToday(day)
          const selected = selectedDate ? isSameDay(day, selectedDate) : false

          return (
            <button
              key={day.toISOString()}
              onClick={() => !past && onSelectDate(day)}
              disabled={past}
              aria-pressed={selected}
              aria-label={format(day, "dd 'de' MMMM", { locale: ptBR })}
              className={`
                flex flex-col items-center py-2.5 rounded-xl transition-all text-sm
                ${past ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                ${selected
                  ? 'bg-[#1a1a1a] text-white shadow-md'
                  : isToday(day) && !selected
                  ? 'bg-[#c9a84c]/10 text-[#b8973b] border border-[#c9a84c]/30'
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
            >
              <span className="text-xs uppercase font-medium opacity-70">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className="font-bold text-base leading-tight">{format(day, 'dd')}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-7 gap-1 mt-1">
        {days.slice(7).map((day) => {
          const past = isPast(startOfDay(day)) && !isToday(day)
          const selected = selectedDate ? isSameDay(day, selectedDate) : false

          return (
            <button
              key={day.toISOString()}
              onClick={() => !past && onSelectDate(day)}
              disabled={past}
              aria-pressed={selected}
              aria-label={format(day, "dd 'de' MMMM", { locale: ptBR })}
              className={`
                flex flex-col items-center py-2.5 rounded-xl transition-all text-sm
                ${past ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                ${selected
                  ? 'bg-[#1a1a1a] text-white shadow-md'
                  : 'hover:bg-gray-100 text-gray-600'
                }
              `}
            >
              <span className="text-xs uppercase font-medium opacity-70">
                {format(day, 'EEE', { locale: ptBR })}
              </span>
              <span className="font-bold text-base leading-tight">{format(day, 'dd')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
