'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Calendar, User, Clock, DollarSign, Star, Gift, RotateCcw } from 'lucide-react'
import { api } from '@/lib/api'

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface PageProps {
  searchParams: {
    id?: string
    name?: string
    slot?: string
    duration?: string
    price?: string
    services?: string
    professional?: string
    phone?: string
    serviceIds?: string
    professionalId?: string
  }
}

export default function SucessoPage({ searchParams }: PageProps) {
  const { id, name, slot, duration, price, services, professional, phone, serviceIds, professionalId } = searchParams

  const slotDate = slot ? new Date(slot) : null

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  async function handleReview(e: React.FormEvent) {
    e.preventDefault()
    if (!id || rating === 0) return
    setSubmittingReview(true)
    setReviewError(null)
    try {
      await api.post('/reviews', { appointmentId: id, rating, comment: comment || undefined })
      setReviewSent(true)
    } catch (err: unknown) {
      setReviewError((err as Error).message)
    } finally {
      setSubmittingReview(false)
    }
  }

  const repeatParams = new URLSearchParams()
  if (serviceIds) repeatParams.set('repeatServiceIds', serviceIds)
  if (professionalId) repeatParams.set('repeatProfessionalId', professionalId)
  const repeatHref = `/agendar?${repeatParams.toString()}`

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Agendamento confirmado!</h1>
      <p className="text-gray-500 text-sm mb-8">
        {name ? `Olá, ${name}! ` : ''}Seu horário foi reservado com sucesso.
      </p>

      {/* Appointment details */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left mb-4 shadow-sm space-y-4">
        {id && (
          <p className="text-xs text-gray-400 text-center mb-2 font-mono">#{id.slice(0, 8).toUpperCase()}</p>
        )}

        {slotDate && (
          <div className="flex items-start gap-3">
            <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Data e horário</p>
              <p className="text-sm font-semibold text-gray-900 capitalize">
                {format(slotDate, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        )}

        {professional && (
          <div className="flex items-start gap-3">
            <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Profissional</p>
              <p className="text-sm font-semibold text-gray-900">{professional}</p>
            </div>
          </div>
        )}

        {services && (
          <div className="flex items-start gap-3">
            <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Serviços{duration ? ` · ${duration} min` : ''}</p>
              <p className="text-sm font-semibold text-gray-900">{services}</p>
            </div>
          </div>
        )}

        {price && Number(price) > 0 && (
          <div className="flex items-start gap-3">
            <DollarSign size={16} className="text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-sm font-bold text-gray-900">{formatPrice(Number(price))}</p>
            </div>
          </div>
        )}
      </div>

      {/* Fidelidade */}
      {phone && (
        <div className="bg-[#1a1a1a] rounded-2xl p-5 text-left mb-4 flex items-center gap-4">
          <Gift size={28} className="text-[#c9a84c] shrink-0" />
          <div>
            <p className="text-white font-semibold text-sm">Programa Fidelidade</p>
            <p className="text-gray-400 text-xs mt-0.5">
              Cada corte completo acumula pontos. A cada 10 cortes, ganhe 1 grátis!
            </p>
          </div>
        </div>
      )}

      {/* Repetir agendamento */}
      {serviceIds && professionalId && (
        <Link
          href={repeatHref}
          className="flex items-center justify-center gap-2 w-full border border-gray-300 text-gray-700 text-sm font-medium px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors mb-4"
        >
          <RotateCcw size={15} />
          Repetir este agendamento
        </Link>
      )}

      <p className="text-xs text-gray-400 mb-6">
        Guarde o código de confirmação. Para cancelar, entre em contato com a barbearia.
      </p>

      {/* Review form — shown after appointment (UX note: ideally triggered post-completion, but available here for demo) */}
      {id && !reviewSent && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-left mb-4">
          <p className="text-sm font-semibold text-gray-800 mb-3">Já foi atendido? Avalie o serviço</p>
          <form onSubmit={handleReview} className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)}>
                  <Star
                    size={24}
                    className={star <= rating ? 'fill-[#c9a84c] text-[#c9a84c]' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comentário (opcional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a1a]"
            />
            {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
            <button
              type="submit"
              disabled={rating === 0 || submittingReview}
              className="w-full bg-[#1a1a1a] disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl"
            >
              {submittingReview ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </form>
        </div>
      )}

      {reviewSent && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 text-center">
          <p className="text-sm text-emerald-700 font-medium">Obrigado pela sua avaliação!</p>
        </div>
      )}

      <Link
        href="/agendar"
        className="inline-block bg-[#1a1a1a] hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Fazer outro agendamento
      </Link>
    </div>
  )
}
