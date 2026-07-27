'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, User, Phone, Scissors, FileText, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'

interface AppointmentCardProps {
  id: string
  clientName: string
  clientPhone: string
  startsAt: string
  endsAt: string
  services: { serviceId: string; durationSnapshot: number; priceSnapshot: number }[]
  status: string
  barberNotes?: string
  onSaveNote?: (notes: string) => Promise<void>
  onComplete?: () => Promise<void>
}

const statusStyles: Record<string, string> = {
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-600',
  NO_SHOW: 'bg-gray-100 text-gray-500',
  COMPLETED: 'bg-blue-100 text-blue-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
}

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
  COMPLETED: 'Concluído',
  PENDING: 'Pendente',
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function AppointmentCard({
  clientName, clientPhone, startsAt, endsAt, services, status, barberNotes,
  onSaveNote, onComplete,
}: AppointmentCardProps) {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const totalMinutes = services.reduce((a, s) => a + s.durationSnapshot, 0)
  const totalPrice = services.reduce((a, s) => a + s.priceSnapshot, 0)

  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState(barberNotes ?? '')
  const [savingNote, setSavingNote] = useState(false)
  const [completing, setCompleting] = useState(false)

  async function handleSaveNote() {
    if (!onSaveNote) return
    setSavingNote(true)
    try { await onSaveNote(notes) } finally { setSavingNote(false) }
  }

  async function handleComplete() {
    if (!onComplete) return
    setCompleting(true)
    try { await onComplete() } finally { setCompleting(false) }
  }

  const isActive = status === 'CONFIRMED' || status === 'PENDING'

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

      {/* Actions — only for active appointments */}
      {isActive && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setShowNotes((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            <FileText size={12} />
            Notas
            {showNotes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          <button
            onClick={handleComplete}
            disabled={completing}
            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 border border-emerald-200 hover:border-emerald-300 bg-emerald-50 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 ml-auto"
          >
            <CheckCircle2 size={12} />
            {completing ? 'Concluindo...' : 'Concluir'}
          </button>
        </div>
      )}

      {/* Notes panel */}
      {showNotes && (
        <div className="pt-1 space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações do barbeiro..."
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#1a1a1a] resize-none"
          />
          <button
            onClick={handleSaveNote}
            disabled={savingNote}
            className="text-xs bg-[#1a1a1a] text-white rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            {savingNote ? 'Salvando...' : 'Salvar nota'}
          </button>
        </div>
      )}

      {/* Show saved notes for completed appointments */}
      {!isActive && barberNotes && (
        <div className="pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-medium mb-0.5">Nota do barbeiro</p>
          <p className="text-xs text-gray-600">{barberNotes}</p>
        </div>
      )}
    </div>
  )
}
