'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Service, Professional, TimeSlot } from '@/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, User, Calendar, DollarSign } from 'lucide-react'

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
}

const schema = z.object({
  clientName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  clientPhone: z
    .string()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 10 && v.length <= 11, 'Telefone deve ter 10 ou 11 dígitos'),
})
type FormData = z.infer<typeof schema>

interface BookingConfirmationProps {
  services: Service[]
  professional: Professional | null
  slot: TimeSlot
  isSubmitting: boolean
  onSubmit: (name: string, phone: string) => void
  onBack: () => void
}

export default function BookingConfirmation({
  services,
  professional,
  slot,
  isSubmitting,
  onSubmit,
  onBack,
}: BookingConfirmationProps) {
  const totalDuration = services.reduce((a, s) => a + s.durationMinutes, 0)
  const totalPrice = services.reduce((a, s) => a + s.priceInCents, 0)
  const slotDate = new Date(slot.startsAt)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value)
    setValue('clientPhone', formatted)
  }

  const phoneValue = watch('clientPhone', '')

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Confirme seu agendamento</h2>
      <p className="text-sm text-gray-500 mb-5">Verifique os detalhes e informe seus dados para confirmar.</p>

      {/* Resumo */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
        <div className="flex items-start gap-3">
          <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Data e horário</p>
            <p className="text-sm font-medium text-gray-900 capitalize">
              {format(slotDate, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Profissional</p>
            <p className="text-sm font-medium text-gray-900">
              {professional?.user?.name ?? 'A definir'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Serviços · {totalDuration} min</p>
            <p className="text-sm font-medium text-gray-900">{services.map((s) => s.name).join(', ')}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign size={16} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-bold text-gray-900">{formatPrice(totalPrice)}</p>
          </div>
        </div>
      </div>

      {/* Dados do cliente */}
      <form onSubmit={handleSubmit((d) => onSubmit(d.clientName, d.clientPhone))} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1.5">Seu nome</label>
          <input
            {...register('clientName')}
            placeholder="João Silva"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
          />
          {errors.clientName && (
            <p className="text-red-500 text-xs mt-1">{errors.clientName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1.5">WhatsApp / Telefone</label>
          <input
            value={phoneValue}
            onChange={handlePhoneChange}
            inputMode="numeric"
            placeholder="(11) 99999-9999"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
          />
          {errors.clientPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.clientPhone.message}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Voltar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-[#c9a84c] hover:bg-[#b8973b] disabled:opacity-50 text-[#1a1a1a] text-sm font-bold py-3 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
          </button>
        </div>
      </form>
    </div>
  )
}
