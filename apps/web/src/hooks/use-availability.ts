'use client'

import useSWR from 'swr'
import { format } from 'date-fns'
import { AvailabilityResponse } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function fetcher(url: string): Promise<AvailabilityResponse> {
  const res = await fetch(`${API_URL}/api/v1${url}`)
  if (!res.ok) throw new Error('Erro ao buscar disponibilidade')
  return res.json()
}

export function useAvailability(
  professionalId: string | null,
  serviceIds: string[],
  date: Date | null,
) {
  const dateStr = date ? format(date, 'yyyy-MM-dd') : null
  const svcParam = serviceIds.length > 0 ? serviceIds.map((id) => `serviceIds=${id}`).join('&') : null

  const key =
    professionalId && svcParam && dateStr
      ? `/availability?professionalId=${professionalId}&${svcParam}&date=${dateStr}`
      : null

  const { data, error, isLoading, mutate } = useSWR<AvailabilityResponse>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  })

  return {
    slots: data?.slots ?? [],
    totalDurationMinutes: data?.totalDurationMinutes ?? 0,
    notWorking: data?.notWorking ?? false,
    isLoading,
    error,
    invalidate: () => mutate(),
  }
}
