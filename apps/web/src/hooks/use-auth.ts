'use client'

import { useSession } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()

  return {
    user: session?.user ?? null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isAdmin: session?.user?.role === 'ADMIN',
    isBarber: session?.user?.role === 'BARBER' || session?.user?.role === 'ADMIN',
    accessToken: session?.user?.accessToken ?? null,
  }
}
