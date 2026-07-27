import { api } from '@/lib/api'
import { Service, Professional } from '@/types'
import BookingWizard from '@/components/booking/BookingWizard'

async function getInitialData() {
  const [services, professionals] = await Promise.all([
    api.get<Service[]>('/services').catch(() => [] as Service[]),
    api.get<Professional[]>('/professionals').catch(() => [] as Professional[]),
  ])
  return { services, professionals }
}

export default async function AgendarPage() {
  const { services, professionals } = await getInitialData()

  return (
    <div>
      <div className="mb-3 sm:mb-6 hidden sm:block">
        <h1 className="text-2xl font-bold text-gray-900">Fazer agendamento</h1>
        <p className="text-sm text-gray-500 mt-1">Escolha o serviço, profissional e horário.</p>
      </div>
      <BookingWizard services={services} professionals={professionals} />
    </div>
  )
}
