import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, Calendar, User, Clock, DollarSign } from 'lucide-react'

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface SuccessPageProps {
  searchParams: {
    id?: string
    name?: string
    slot?: string
    duration?: string
    price?: string
    services?: string
    professional?: string
  }
}

export default function SucessoPage({ searchParams }: SuccessPageProps) {
  const { id, name, slot, duration, price, services, professional } = searchParams

  const slotDate = slot ? new Date(slot) : null

  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
        <CheckCircle2 size={32} className="text-emerald-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Agendamento confirmado!</h1>
      <p className="text-gray-500 text-sm mb-8">
        {name ? `Olá, ${name}! ` : ''}Seu horário foi reservado com sucesso.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-left mb-6 shadow-sm space-y-4">
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

      <p className="text-xs text-gray-400 mb-6">
        Guarde o código de confirmação. Para cancelar, entre em contato com a barbearia.
      </p>

      <Link
        href="/agendar"
        className="inline-block bg-[#1a1a1a] hover:bg-gray-800 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
      >
        Fazer outro agendamento
      </Link>
    </div>
  )
}
