'use client'

import { useState, useMemo } from 'react'
import { Gift, Phone, Scissors, Trophy, Star, Search } from 'lucide-react'
import { LoyaltyCardAdmin } from './page'

const CUTS_PER_REWARD = 10

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#c9a84c] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right shrink-0">
        {value}/{max}
      </span>
    </div>
  )
}

export default function FidelidadeClient({
  initialCards,
}: {
  initialCards: LoyaltyCardAdmin[]
  token: string
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim()
    if (!q) return initialCards
    return initialCards.filter((c) => c.clientPhone.includes(q))
  }, [initialCards, search])

  const totalCards      = initialCards.length
  const totalCuts       = initialCards.reduce((a, c) => a + c.completedCuts, 0)
  const totalRewards    = initialCards.reduce((a, c) => a + c.redeemedCuts, 0)
  const pendingRewards  = initialCards.reduce((a, c) => a + c.availableRewards, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fidelidade</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Cartões de fidelidade dos clientes — a cada {CUTS_PER_REWARD} cortes, 1 grátis
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Gift size={15} />
            <span className="text-xs font-medium">Clientes com cartão</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Scissors size={15} />
            <span className="text-xs font-medium">Cortes acumulados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCuts}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-400 mb-2">
            <Trophy size={15} />
            <span className="text-xs font-medium">Prêmios resgatados</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalRewards}</p>
        </div>

        <div className={`rounded-xl p-5 ${pendingRewards > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-gray-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <Star size={15} className={pendingRewards > 0 ? 'text-amber-500' : 'text-gray-400'} />
            <span className="text-xs font-medium text-gray-500">Prêmios disponíveis</span>
          </div>
          <p className={`text-2xl font-bold ${pendingRewards > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
            {pendingRewards}
          </p>
          {pendingRewards > 0 && (
            <p className="text-xs text-amber-600 mt-1">clientes com corte grátis pendente</p>
          )}
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por telefone..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#c9a84c] transition-colors bg-white"
        />
      </div>

      {/* Lista */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 grid grid-cols-12 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span className="col-span-3">Telefone</span>
          <span className="col-span-2 text-center">Cortes</span>
          <span className="col-span-2 text-center">Resgatados</span>
          <span className="col-span-3">Progresso</span>
          <span className="col-span-2 text-center">Disponível</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Gift size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm text-gray-400">Nenhum cartão encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((card) => (
              <div key={card.id} className="px-6 py-4 grid grid-cols-12 items-center gap-2">
                {/* Telefone */}
                <div className="col-span-3 flex items-center gap-2">
                  <Phone size={13} className="text-gray-300 shrink-0" />
                  <span className="text-sm text-gray-700">{card.clientPhone}</span>
                </div>

                {/* Cortes totais */}
                <div className="col-span-2 text-center">
                  <span className="text-sm font-semibold text-gray-900">{card.completedCuts}</span>
                </div>

                {/* Resgatados */}
                <div className="col-span-2 text-center">
                  <span className="text-sm text-gray-500">{card.redeemedCuts}</span>
                </div>

                {/* Barra de progresso */}
                <div className="col-span-3">
                  <ProgressBar value={card.progressToNextReward} max={CUTS_PER_REWARD} />
                </div>

                {/* Prêmios disponíveis */}
                <div className="col-span-2 flex justify-center">
                  {card.availableRewards > 0 ? (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <Gift size={11} />
                      {card.availableRewards} grátis
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
