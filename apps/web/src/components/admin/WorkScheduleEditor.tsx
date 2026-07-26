'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

interface WorkSchedule {
  id: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: 'MONDAY', label: 'Segunda' },
  { key: 'TUESDAY', label: 'Terça' },
  { key: 'WEDNESDAY', label: 'Quarta' },
  { key: 'THURSDAY', label: 'Quinta' },
  { key: 'FRIDAY', label: 'Sexta' },
  { key: 'SATURDAY', label: 'Sábado' },
  { key: 'SUNDAY', label: 'Domingo' },
]

interface DayState {
  enabled: boolean
  startTime: string
  endTime: string
  breakStart: string
  breakEnd: string
}

const DEFAULT_DAY: DayState = {
  enabled: false,
  startTime: '09:00',
  endTime: '19:00',
  breakStart: '12:00',
  breakEnd: '13:00',
}

export default function WorkScheduleEditor({
  professionalId,
  token,
}: {
  professionalId: string
  token: string
}) {
  const [schedule, setSchedule] = useState<Record<DayOfWeek, DayState>>(
    Object.fromEntries(DAYS.map(({ key }) => [key, { ...DEFAULT_DAY }])) as Record<DayOfWeek, DayState>,
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<DayOfWeek | null>(null)
  const [saved, setSaved] = useState<DayOfWeek | null>(null)

  useEffect(() => {
    api
      .get<WorkSchedule[]>(`/professionals/${professionalId}/schedules`, { token })
      .then((rows) => {
        setSchedule((prev) => {
          const next = { ...prev }
          for (const row of rows) {
            next[row.dayOfWeek] = {
              enabled: true,
              startTime: row.startTime,
              endTime: row.endTime,
              breakStart: row.breakStart ?? '12:00',
              breakEnd: row.breakEnd ?? '13:00',
            }
          }
          return next
        })
      })
      .finally(() => setLoading(false))
  }, [professionalId, token])

  function update(day: DayOfWeek, field: keyof DayState, value: string | boolean) {
    setSchedule((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }))
  }

  async function saveDay(day: DayOfWeek) {
    const s = schedule[day]
    if (!s.enabled) return

    setSaving(day)
    try {
      await api.put(`/professionals/${professionalId}/schedules`, {
        dayOfWeek: day,
        startTime: s.startTime,
        endTime: s.endTime,
        breakStart: s.breakStart || undefined,
        breakEnd: s.breakEnd || undefined,
      }, { token })
      setSaved(day)
      setTimeout(() => setSaved(null), 2000)
    } catch {
      alert('Erro ao salvar jornada.')
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {DAYS.map(({ key }) => (
          <div key={key} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {DAYS.map(({ key, label }) => {
        const s = schedule[key]
        return (
          <div
            key={key}
            className={`rounded-lg border p-3 transition-colors ${
              s.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 cursor-pointer min-w-[80px]">
                <input
                  type="checkbox"
                  checked={s.enabled}
                  onChange={(e) => update(key, 'enabled', e.target.checked)}
                  className="w-4 h-4 accent-[#c9a84c]"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>

              {s.enabled && (
                <>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <input
                      type="time"
                      value={s.startTime}
                      onChange={(e) => update(key, 'startTime', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#c9a84c]"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={s.endTime}
                      onChange={(e) => update(key, 'endTime', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-[#c9a84c]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="text-gray-400">Almoço:</span>
                    <input
                      type="time"
                      value={s.breakStart}
                      onChange={(e) => update(key, 'breakStart', e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#c9a84c]"
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={s.breakEnd}
                      onChange={(e) => update(key, 'breakEnd', e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#c9a84c]"
                    />
                  </div>

                  <button
                    onClick={() => saveDay(key)}
                    disabled={saving === key}
                    className="ml-auto text-xs bg-[#1a1a1a] hover:bg-gray-800 disabled:opacity-50 text-white px-3 py-1.5 rounded-md transition-colors"
                  >
                    {saving === key ? 'Salvando...' : saved === key ? 'Salvo ✓' : 'Salvar'}
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
