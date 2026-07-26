'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Pencil, Trash2, Plus, X, Clock, DollarSign } from 'lucide-react'
import { api, ApiError } from '@/lib/api'
import { Service } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  durationMinutes: z.coerce.number().int().positive('Deve ser positivo'),
  priceInCents: z.coerce.number().int().min(0, 'Não pode ser negativo'),
})
type FormData = z.infer<typeof schema>

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ServicesClient({
  initialServices,
  token,
}: {
  initialServices: Service[]
  token: string
}) {
  const [services, setServices] = useState(initialServices)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  function openCreate() {
    setEditing(null)
    reset({ name: '', durationMinutes: 30, priceInCents: 0 })
    setServerError(null)
    setModalOpen(true)
  }

  function openEdit(svc: Service) {
    setEditing(svc)
    reset({ name: svc.name, durationMinutes: svc.durationMinutes, priceInCents: svc.priceInCents })
    setServerError(null)
    setModalOpen(true)
  }

  async function onSubmit(data: FormData) {
    setServerError(null)
    try {
      if (editing) {
        const updated = await api.patch<Service>(`/services/${editing.id}`, data, { token })
        setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      } else {
        const created = await api.post<Service>('/services', data, { token })
        setServices((prev) => [...prev, created])
      }
      setModalOpen(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError('Já existe um serviço com este nome.')
      } else {
        setServerError('Erro ao salvar. Tente novamente.')
      }
    }
  }

  async function handleDeactivate(id: string) {
    if (!confirm('Desativar este serviço? Ele não aparecerá mais para novos agendamentos.')) return
    try {
      await api.delete(`/services/${id}`, { token })
      setServices((prev) => prev.filter((s) => s.id !== id))
    } catch {
      alert('Erro ao desativar serviço.')
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Catálogo de serviços</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Novo serviço
          </button>
        </div>

        {services.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-400 text-sm">Nenhum serviço cadastrado ainda.</p>
            <button onClick={openCreate} className="mt-3 text-[#c9a84c] text-sm hover:underline">
              Criar primeiro serviço
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Serviço</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Duração</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Preço</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{svc.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-gray-400" />
                      {svc.durationMinutes} min
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-gray-400" />
                      {formatPrice(svc.priceInCents)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => openEdit(svc)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition-colors"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDeactivate(svc.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
                        title="Desativar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editing ? 'Editar serviço' : 'Novo serviço'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Nome do serviço</label>
                <input
                  {...register('name')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                  placeholder="Ex: Corte Degradê"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Duração (min)</label>
                  <input
                    {...register('durationMinutes')}
                    type="number"
                    min={5}
                    step={5}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                  />
                  {errors.durationMinutes && <p className="text-red-500 text-xs mt-1">{errors.durationMinutes.message}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Preço (R$)</label>
                  <input
                    {...register('priceInCents', {
                      setValueAs: (v) => Math.round(parseFloat(String(v).replace(',', '.')) * 100),
                    })}
                    type="number"
                    min={0}
                    step={0.5}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#c9a84c] transition-colors"
                    placeholder="45.00"
                  />
                  {errors.priceInCents && <p className="text-red-500 text-xs mt-1">{errors.priceInCents.message}</p>}
                </div>
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
                  className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1a1a1a] hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
