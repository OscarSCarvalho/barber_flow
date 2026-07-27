'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, DollarSign, Scissors, BarChart2, XCircle, UserX, CalendarCheck, AlertTriangle } from 'lucide-react'
import { api } from '@/lib/api'

interface FinancialSummary {
  totalRevenue: number
  appointmentCount: number
  ticketMedio: number
  byService: Array<{ serviceName: string; count: number; revenue: number }>
  cancellations: {
    cancelledCount: number
    noShowCount: number
    totalScheduled: number
    cancellationRate: number
  }
}

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type PeriodKey = '15d' | '1m' | '4m' | '12m'

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: '15d', label: 'Quinzenal' },
  { key: '1m',  label: 'Mensal' },
  { key: '4m',  label: '4 meses' },
  { key: '12m', label: '12 meses' },
]

function getPeriodDates(key: PeriodKey): { from: Date; to: Date } {
  const now = new Date()
  switch (key) {
    case '15d': return { from: subDays(startOfDay(now), 14), to: endOfDay(now) }
    case '1m':  return { from: startOfMonth(now), to: endOfMonth(now) }
    case '4m':  return { from: startOfMonth(subMonths(now, 3)), to: endOfDay(now) }
    case '12m': return { from: startOfMonth(subMonths(now, 11)), to: endOfDay(now) }
  }
}

function periodLabel(key: PeriodKey, from: Date, to: Date) {
  return `${format(from, "dd 'de' MMM", { locale: ptBR })} – ${format(to, "dd 'de' MMM yyyy", { locale: ptBR })}`
}

export default function FinanceiroClient({ token }: { token: string }) {
  const [period, setPeriod] = useState<PeriodKey>('1m')
  const { from, to } = getPeriodDates(period)

  const fetcher = <T,>(url: string): Promise<T> => api.get<T>(url, { token })

  const { data, isLoading } = useSWR<FinancialSummary>(
    `/financial/summary?from=${from.toISOString()}&to=${to.toISOString()}`,
    fetcher,
  )

  const c = data?.cancellations

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Financeiro</h1>
        <p className="text-sm text-gray-500 mt-1">{periodLabel(period, from, to)}</p>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2 flex-wrap">
        {PERIODS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === key
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : data ? (
        <>
          {/* ── KPIs de Faturamento ── */}
          <div>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Faturamento</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <DollarSign size={15} />
                  <span className="text-xs font-medium">Receita total</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(data.totalRevenue)}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <CalendarCheck size={15} />
                  <span className="text-xs font-medium">Concluídos</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{data.appointmentCount}</p>
              </div>

              <div className="bg-[#1a1a1a] rounded-xl p-5 col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <TrendingUp size={15} className="text-[#c9a84c]" />
                  <span className="text-xs font-medium text-gray-400">Ticket médio</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatPrice(data.ticketMedio)}</p>
              </div>
            </div>
          </div>

          {/* ── Cancelamentos ── */}
          {c && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Desistências e cancelamentos</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-2 text-gray-400 mb-2">
                    <Scissors size={15} />
                    <span className="text-xs font-medium">Total agendados</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{c.totalScheduled}</p>
                </div>

                <div className="bg-white rounded-xl border border-red-100 p-5">
                  <div className="flex items-center gap-2 text-red-400 mb-2">
                    <XCircle size={15} />
                    <span className="text-xs font-medium">Cancelados</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{c.cancelledCount}</p>
                </div>

                <div className="bg-white rounded-xl border border-orange-100 p-5">
                  <div className="flex items-center gap-2 text-orange-400 mb-2">
                    <UserX size={15} />
                    <span className="text-xs font-medium">Não compareceu</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-500">{c.noShowCount}</p>
                </div>

                <div className={`rounded-xl p-5 ${c.cancellationRate >= 30 ? 'bg-red-50 border border-red-200' : c.cancellationRate >= 15 ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={15} className={c.cancellationRate >= 30 ? 'text-red-400' : c.cancellationRate >= 15 ? 'text-amber-400' : 'text-emerald-400'} />
                    <span className="text-xs font-medium text-gray-500">Taxa de cancelamento</span>
                  </div>
                  <p className={`text-2xl font-bold ${c.cancellationRate >= 30 ? 'text-red-600' : c.cancellationRate >= 15 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {c.cancellationRate}%
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    {c.cancellationRate < 15 ? 'Ótimo 👍' : c.cancellationRate < 30 ? 'Atenção' : 'Alto — revisar'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Por serviço ── */}
          {data.byService.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Por serviço</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                {data.byService.sort((a, b) => b.revenue - a.revenue).map((s) => {
                  const pct = data.totalRevenue > 0 ? (s.revenue / data.totalRevenue) * 100 : 0
                  return (
                    <div key={s.serviceName}>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-sm font-medium text-gray-800">{s.serviceName}</span>
                          <span className="text-xs text-gray-400 ml-2">{s.count} atend.</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatPrice(s.revenue)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#c9a84c] rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {data.appointmentCount === 0 && c?.totalScheduled === 0 && (
            <div className="text-center py-16 text-gray-400">
              <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum dado para o período selecionado.</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}
