'use client'

import { Service } from '@/types'
import { Clock, CheckCircle2 } from 'lucide-react'

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface ServiceSelectorProps {
  services: Service[]
  selected: Service[]
  onSelect: (services: Service[]) => void
  onNext: () => void
}

export default function ServiceSelector({ services, selected, onSelect, onNext }: ServiceSelectorProps) {
  const totalDuration = selected.reduce((a, s) => a + s.durationMinutes, 0)
  const totalPrice = selected.reduce((a, s) => a + s.priceInCents, 0)

  function toggle(svc: Service) {
    const isSelected = selected.some((s) => s.id === svc.id)
    onSelect(isSelected ? selected.filter((s) => s.id !== svc.id) : [...selected, svc])
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Escolha os serviços</h2>
      <p className="text-sm text-gray-500 mb-5">Selecione um ou mais serviços.</p>

      {services.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-8">Nenhum serviço disponível.</p>
      ) : (
        <div className="space-y-2">
          {services.map((svc) => {
            const isSelected = selected.some((s) => s.id === svc.id)
            return (
              <button
                key={svc.id}
                onClick={() => toggle(svc)}
                aria-pressed={isSelected}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? 'border-[#1a1a1a] bg-[#1a1a1a]/5'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-[#1a1a1a] bg-[#1a1a1a]' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <CheckCircle2 size={12} className="text-white" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{svc.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock size={11} /> {svc.durationMinutes} min
                    </span>
                  </div>
                </div>

                <span className="font-semibold text-gray-900 shrink-0">
                  {formatPrice(svc.priceInCents)}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{selected.length}</span> serviço(s) ·{' '}
            <span className="font-medium">{totalDuration} min</span> ·{' '}
            <span className="font-medium text-gray-900">{formatPrice(totalPrice)}</span>
          </div>
          <button
            onClick={onNext}
            className="bg-[#1a1a1a] hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Próximo →
          </button>
        </div>
      )}

      {services.length > 0 && selected.length === 0 && (
        <p className="text-center text-xs text-gray-400 mt-6">Selecione ao menos um serviço para continuar.</p>
      )}
    </div>
  )
}
