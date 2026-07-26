'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, X, User, ChevronDown, ChevronUp } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { Professional } from '@/types'
import WorkScheduleEditor from '@/components/admin/WorkScheduleEditor'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  bio: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function TeamClient({
  initialProfessionals,
  token,
}: {
  initialProfessionals: Professional[]
  token: string
}) {
  const [professionals, setProfessionals] = useState(initialProfessionals)
  const [modalOpen, setModalOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function openCreate() {
    reset()
    setServerError(null)
    setModalOpen(true)
  }

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      const created = await api.post<Professional>('/professionals', data, { token })
      setProfessionals((prev) => [...prev, created])
      setModalOpen(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError('E-mail já cadastrado.')
      } else {
        setServerError('Erro ao criar profissional.')
      }
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Profissionais cadastrados</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Novo profissional
          </button>
        </div>

        {professionals.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">Nenhum profissional cadastrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {professionals.map((pro) => (
              <div key={pro.id}>
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === pro.id ? null : pro.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    {pro.avatarUrl ? (
                      <img src={pro.avatarUrl} alt={pro.user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <User size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{pro.user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{pro.user.email}</p>
                    {pro.bio && <p className="text-xs text-gray-400 mt-0.5 truncate">{pro.bio}</p>}
                  </div>
                  <div className="text-gray-400">
                    {expandedId === pro.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {expandedId === pro.id && (
                  <div className="px-6 pb-6 bg-gray-50 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mt-4 mb-3">Jornada de trabalho</h3>
                    <WorkScheduleEditor professionalId={pro.id} token={token} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Novo profissional</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              {[
                { name: 'name', label: 'Nome completo', placeholder: 'Carlos Oliveira', type: 'text' },
                { name: 'email', label: 'E-mail', placeholder: 'carlos@barbearia.com', type: 'email' },
                { name: 'password', label: 'Senha inicial', placeholder: 'Mínimo 8 caracteres', type: 'password' },
              ].map(({ name, label, placeholder, type }) => (
                <div key={name}>
                  <label className="block text-sm text-gray-600 mb-1.5">{label}</label>
                  <input
                    {...register(name as keyof FormData)}
                    type={type}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                  />
                  {errors[name as keyof FormData] && (
                    <p className="text-red-500 text-xs mt-1">{errors[name as keyof FormData]?.message}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Bio (opcional)</label>
                <textarea
                  {...register('bio')}
                  rows={2}
                  placeholder="Especialista em..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors resize-none"
                />
              </div>

              {serverError && (
                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 border border-gray-300 text-gray-700 text-sm py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1a1a1a] hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Criando...' : 'Criar profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
