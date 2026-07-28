'use client'

import { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Phone, Calendar, CheckCheck, BellRing, XCircle, Hourglass } from 'lucide-react'
import { api } from '@/lib/api'
import { WaitlistEntry } from './page'

type StatusFilter = 'ALL' | 'WAITING' | 'NOTIFIED' | 'CONFIRMED' | 'EXPIRED'

const STATUS_CONFIG = {
  WAITING:   { label: 'Aguardando', color: 'bg-amber-100 text-amber-700',   icon: Hourglass },
  NOTIFIED:  { label: 'Notificado', color: 'bg-blue-100 text-blue-700',     icon: BellRing  },
  CONFIRMED: { label: 'Confirmado', color: 'bg-emerald-100 text-emerald-700', icon: CheckCheck },
  EXPIRED:   { label: 'Expirado',   color: 'bg-gray-100 text-gray-500',     icon: XCircle   },
}

function fmt(dateStr?: string) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

function fmtDate(dateStr?: string) {
  if (!dateStr) return '—'
  return format(parseISO(dateStr), 'dd/MM/yyyy', { locale: ptBR })
}

export default function WaitlistClient({
  initialEntries,
  token,
}: {
  initialEntries: WaitlistEntry[]
  token: string
}) {
  const [entries, setEntries] = useState(initialEntries)
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = useMemo(
    () => filter === 'ALL' ? entries : entries.filter((e) => e.status === filter),
    [entries, filter],
  )

  const counts = useMemo(() => ({
    ALL:       entries.length,
    WAITING:   entries.filter((e) => e.status === 'WAITING').length,
    NOTIFIED:  entries.filter((e) => e.status === 'NOTIFIED').length,
    CONFIRMED: entries.filter((e) => e.status === 'CONFIRMED').length,
    EXPIRED:   entries.filter((e) => e.status === 'EXPIRED').length,
  }), [entries])

  async function updateStatus(id: string, status: WaitlistEntry['status']) {
    setLoading(id)
    try {
      const updated = await api.patch<WaitlistEntry>(
        `/waitlist/${id}/status`,
        { status },
        { token },
      )
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)))
    } finally {
      setLoading(null)
    }
  }

  const filterTabs: { key: StatusFilter; label: string }[] = [
    { key: 'ALL',       label: `Todos (${counts.ALL})` },
    { key: 'WAITING',   label: `Aguardando (${counts.WAITING})` },
    { key: 'NOTIFIED',  label: `Notificado (${counts.NOTIFIED})` },
    { key: 'CONFIRMED', label: `Confirmado (${counts.CONFIRMED})` },
    { key: 'EXPIRED',   label: `Expirado (${counts.EXPIRED})` },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lista de Espera</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Clientes aguardando horário disponível
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {filterTabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Clock size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">Nenhuma entrada encontrada.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((entry) => {
              const cfg = STATUS_CONFIG[entry.status]
              const StatusIcon = cfg.icon
              const isLoading = loading === entry.id

              return (
                <div key={entry.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    {/* Info principal */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-gray-900">{entry.clientName}</p>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          {entry.clientPhone}
                        </span>
                        {entry.preferredDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            Preferência: {fmtDate(entry.preferredDate)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          Entrou: {fmt(entry.createdAt)}
                        </span>
                        {entry.notifiedAt && (
                          <span className="flex items-center gap-1 text-blue-500">
                            <BellRing size={11} />
                            Notificado: {fmt(entry.notifiedAt)}
                          </span>
                        )}
                        {entry.expiresAt && entry.status === 'WAITING' && (
                          <span className="text-amber-500">
                            Expira: {fmtDate(entry.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    {entry.status === 'WAITING' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => updateStatus(entry.id, 'NOTIFIED')}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <BellRing size={12} />
                          Notificar
                        </button>
                        <button
                          onClick={() => updateStatus(entry.id, 'EXPIRED')}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          Expirar
                        </button>
                      </div>
                    )}

                    {entry.status === 'NOTIFIED' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => updateStatus(entry.id, 'CONFIRMED')}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCheck size={12} />
                          Confirmar
                        </button>
                        <button
                          onClick={() => updateStatus(entry.id, 'EXPIRED')}
                          disabled={isLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle size={12} />
                          Expirar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
