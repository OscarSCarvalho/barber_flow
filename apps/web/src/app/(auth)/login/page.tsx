'use client'

import { Suspense, useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type FormData = z.infer<typeof schema>

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError(null)

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('E-mail ou senha inválidos. Verifique seus dados.')
      return
    }

    const session = await getSession()
    const role = session?.user?.role

    if (callbackUrl) {
      router.push(callbackUrl)
    } else if (role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/barbeiro/agenda')
    }
    router.refresh()
  }

  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Entrar na sua conta</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">E-mail</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600"
            placeholder="seu@email.com"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Senha</label>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#c9a84c] hover:bg-[#b8973b] disabled:opacity-50 text-[#1a1a1a] font-semibold py-3 rounded-lg transition-colors text-sm"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-gray-600 text-sm mt-6">
        <Link href="/" className="text-gray-500 hover:text-gray-300 transition-colors">
          Voltar para o início
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
