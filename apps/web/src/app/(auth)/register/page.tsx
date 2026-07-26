'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { api, ApiError } from '@/lib/api'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const DEFAULT_TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? 'du-barber-tenant-id'

export default function RegisterPage() {
  const router = useRouter()
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

    try {
      await api.post('/auth/register', { ...data, tenantId: DEFAULT_TENANT_ID })

      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push('/agendar')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError('Este e-mail já está cadastrado.')
      } else {
        setError('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#111] border border-gray-800 rounded-2xl p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-6">Criar conta de cliente</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Nome completo</label>
          <input
            {...register('name')}
            className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600"
            placeholder="João Silva"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">E-mail</label>
          <input
            {...register('email')}
            type="email"
            className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600"
            placeholder="joao@email.com"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Telefone (opcional)</label>
          <input
            {...register('phone')}
            type="tel"
            className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Senha</label>
          <input
            {...register('password')}
            type="password"
            className="w-full bg-[#1a1a1a] border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors placeholder-gray-600"
            placeholder="Mínimo 8 caracteres"
          />
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
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
          {loading ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600 mt-6">
        Já tem conta?{' '}
        <Link href="/login" className="text-[#c9a84c] hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
