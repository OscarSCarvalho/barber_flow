'use client'

import { Professional } from '@/types'
import { User, Shuffle } from 'lucide-react'

interface ProfessionalSelectorProps {
  professionals: Professional[]
  selected: Professional | 'ANY' | null
  onSelect: (pro: Professional | 'ANY') => void
  onNext: () => void
  onBack: () => void
}

export default function ProfessionalSelector({
  professionals,
  selected,
  onSelect,
  onNext,
  onBack,
}: ProfessionalSelectorProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-1">Escolha o profissional</h2>
      <p className="text-sm text-gray-500 mb-5">Selecione quem vai te atender.</p>

      <div className="space-y-2">
        {/* Qualquer profissional */}
        <button
          onClick={() => onSelect('ANY')}
          aria-pressed={selected === 'ANY'}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
            selected === 'ANY'
              ? 'border-[#c9a84c] bg-[#c9a84c]/5'
              : 'border-gray-200 hover:border-gray-300 bg-white'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              selected === 'ANY' ? 'bg-[#c9a84c]' : 'bg-gray-100'
            }`}
          >
            <Shuffle size={20} className={selected === 'ANY' ? 'text-white' : 'text-gray-400'} />
          </div>
          <div>
            <p className="font-medium text-gray-900">Qualquer profissional disponível</p>
            <p className="text-xs text-gray-500 mt-0.5">
              O sistema escolherá o primeiro disponível no horário selecionado
            </p>
          </div>
        </button>

        {/* Profissionais específicos */}
        {professionals.map((pro) => {
          const isSelected = selected !== 'ANY' && (selected as Professional | null)?.id === pro.id
          return (
            <button
              key={pro.id}
              onClick={() => onSelect(pro)}
              aria-pressed={isSelected}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? 'border-[#1a1a1a] bg-[#1a1a1a]/5'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                {pro.avatarUrl ? (
                  <img src={pro.avatarUrl} alt={pro.user?.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{pro.user?.name}</p>
                {pro.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{pro.bio}</p>}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex-1 bg-[#1a1a1a] hover:bg-gray-800 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Próximo →
        </button>
      </div>
    </div>
  )
}
