'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format, addDays, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Ban, Trash2, Plus, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface Block {
  id: string
  startsAt: string
  endsAt: string
  reason?: string
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function toLocalDatetimeValue(date: Date) {
  return `${format(date, 'yyyy-MM-dd')}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function BlocksClient({ token }: { token: string }) {
  const tomorrow = addDays(startOfDay(new Date()), 1)

  const [startsAt, setStartsAt] = useState(toLocalDatetimeValue(new Date(tomorrow.setHours(9, 0))))
  const [endsAt, setEndsAt] = useState(toLocalDatetimeValue(new Date(tomorrow.setHours(10, 0))))
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const previewDate = startsAt ? startsAt.split('T')[0] : format(tomorrow, 'yyyy-MM-dd')

  const fetcher = <T,>(url: string): Promise<T> => api.get<T>(url, { token })

  const { data, mutate } = useSWR<{ blocks: Block[]; appointments: any[] }>(
    `/manual-blocks/schedule?date=${previewDate}T00:00:00.000Z`,
    fetcher,
  )
  const blocks: Block[] = data?.blocks ?? []
  const futureBlocks = blocks.filter((b) => new Date(b.startsAt) > new Date())

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setSubmitting(true)

    try {
      await api.post('/manual-blocks', {
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        reason: reason || undefined,
      }, { token })
      setReason('')
      setSuccessMsg('Horário bloqueado com sucesso!')
      mutate()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await api.delete(`/manual-blocks/${id}`, { token })
      mutate()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bloquear Horário</h1>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Novo bloqueio</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Início</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fim</label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Motivo (opcional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Almoço, compromisso pessoal..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        {successMsg && (
          <p className="text-sm text-emerald-600 font-medium">{successMsg}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={15} />
          {submitting ? 'Bloqueando...' : 'Bloquear horário'}
        </button>
      </form>

      {/* Future blocks list */}
      <h2 className="text-base font-semibold text-gray-800 mb-3">Bloqueios futuros</h2>

      {futureBlocks.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Ban size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Nenhum bloqueio futuro cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {futureBlocks.map((b) => (
            <div
              key={b.id}
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  {format(new Date(b.startsAt), "dd/MM/yyyy HH:mm", { locale: ptBR })} –{' '}
                  {format(new Date(b.endsAt), 'HH:mm')}
                </p>
                {b.reason && <p className="text-xs text-amber-600 mt-0.5">{b.reason}</p>}
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-2 rounded-lg text-amber-600 hover:bg-amber-100 transition-colors"
                title="Remover bloqueio"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
