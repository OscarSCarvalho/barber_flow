'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Service, Professional, TimeSlot } from '@/types'
import { api, ApiError } from '@/lib/api'
import ServiceSelector from './steps/ServiceSelector'
import ProfessionalSelector from './steps/ProfessionalSelector'
import DateTimePicker from './steps/DateTimePicker'
import BookingConfirmation from './steps/BookingConfirmation'

export type BookingStep = 'SERVICES' | 'PROFESSIONAL' | 'DATETIME' | 'CONFIRM'

export interface BookingState {
  selectedServices: Service[]
  selectedProfessional: Professional | 'ANY' | null
  selectedSlot: TimeSlot | null
  resolvedProfessionalId: string | null
}

const STEP_LABELS: Record<BookingStep, string> = {
  SERVICES: 'Serviço',
  PROFESSIONAL: 'Profissional',
  DATETIME: 'Data e hora',
  CONFIRM: 'Confirmação',
}
const STEP_ORDER: BookingStep[] = ['SERVICES', 'PROFESSIONAL', 'DATETIME', 'CONFIRM']

interface BookingWizardProps {
  services: Service[]
  professionals: Professional[]
}

export default function BookingWizard({ services, professionals }: BookingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState<BookingStep>('SERVICES')
  const [state, setState] = useState<BookingState>({
    selectedServices: [],
    selectedProfessional: null,
    selectedSlot: null,
    resolvedProfessionalId: null,
  })
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentIndex = STEP_ORDER.indexOf(step)

  function goTo(s: BookingStep) {
    setBookingError(null)
    setStep(s)
  }

  function next() {
    const nextStep = STEP_ORDER[currentIndex + 1]
    if (nextStep) goTo(nextStep)
  }

  function back() {
    const prevStep = STEP_ORDER[currentIndex - 1]
    if (prevStep) goTo(prevStep)
  }

  async function submit(clientName: string, clientPhone: string) {
    setIsSubmitting(true)
    setBookingError(null)

    const professionalId =
      state.selectedProfessional === 'ANY'
        ? state.resolvedProfessionalId
        : (state.selectedProfessional as Professional)?.id

    if (!professionalId || !state.selectedSlot) {
      setBookingError('Dados incompletos. Volte e selecione o horário novamente.')
      setIsSubmitting(false)
      return
    }

    try {
      const appointment = await api.post<{ id: string }>('/appointments', {
        professionalId,
        serviceIds: state.selectedServices.map((s) => s.id),
        startsAt: new Date(state.selectedSlot.startsAt).toISOString(),
        clientName,
        clientPhone: clientPhone.replace(/\D/g, ''),
      })

      const params = new URLSearchParams({
        id: appointment.id,
        name: clientName,
        slot: new Date(state.selectedSlot.startsAt).toISOString(),
        duration: String(state.selectedServices.reduce((a, s) => a + s.durationMinutes, 0)),
        price: String(state.selectedServices.reduce((a, s) => a + s.priceInCents, 0)),
        services: state.selectedServices.map((s) => s.name).join(', '),
        professional: state.selectedProfessional === 'ANY'
          ? 'Profissional disponível'
          : ((state.selectedProfessional as Professional).user?.name ?? ''),
      })

      router.push(`/agendar/sucesso?${params.toString()}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setBookingError(
          'Este horário foi ocupado enquanto você escolhia. Por favor, selecione outro.',
        )
        goTo('DATETIME')
        setState((prev) => ({ ...prev, selectedSlot: null }))
      } else {
        setBookingError('Erro ao confirmar agendamento. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const professionalId =
    state.selectedProfessional === 'ANY'
      ? null
      : (state.selectedProfessional as Professional | null)?.id ?? null

  return (
    <div>
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_ORDER.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 transition-colors ${
                i < currentIndex
                  ? 'bg-emerald-500 text-white'
                  : i === currentIndex
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {i < currentIndex ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i === currentIndex ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {STEP_LABELS[s]}
            </span>
            {i < STEP_ORDER.length - 1 && (
              <div className={`h-px flex-1 ${i < currentIndex ? 'bg-emerald-400' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Global error banner */}
      {bookingError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{bookingError}</p>
        </div>
      )}

      {/* Steps */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        {step === 'SERVICES' && (
          <ServiceSelector
            services={services}
            selected={state.selectedServices}
            onSelect={(svcs) => setState((p) => ({ ...p, selectedServices: svcs }))}
            onNext={next}
          />
        )}

        {step === 'PROFESSIONAL' && (
          <ProfessionalSelector
            professionals={professionals}
            selected={state.selectedProfessional}
            onSelect={(pro) => setState((p) => ({ ...p, selectedProfessional: pro, selectedSlot: null }))}
            onNext={next}
            onBack={back}
          />
        )}

        {step === 'DATETIME' && (
          <DateTimePicker
            professionalId={professionalId}
            professionals={professionals}
            serviceIds={state.selectedServices.map((s) => s.id)}
            isAnyProfessional={state.selectedProfessional === 'ANY'}
            selectedSlot={state.selectedSlot}
            onSelectSlot={(slot, resolvedProfId) =>
              setState((p) => ({
                ...p,
                selectedSlot: slot,
                resolvedProfessionalId: resolvedProfId ?? p.resolvedProfessionalId,
              }))
            }
            onNext={next}
            onBack={back}
          />
        )}

        {step === 'CONFIRM' && (
          <BookingConfirmation
            services={state.selectedServices}
            professional={
              state.selectedProfessional === 'ANY'
                ? professionals.find((p) => p.id === state.resolvedProfessionalId) ?? null
                : (state.selectedProfessional as Professional | null)
            }
            slot={state.selectedSlot!}
            isSubmitting={isSubmitting}
            onSubmit={submit}
            onBack={back}
          />
        )}
      </div>
    </div>
  )
}
