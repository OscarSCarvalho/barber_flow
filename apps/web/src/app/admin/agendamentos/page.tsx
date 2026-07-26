import { auth } from '@/lib/auth'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { Appointment, Professional } from '@/types'
import AppointmentsClient from './AppointmentsClient'

export default async function AgendamentosPage() {
  const session = await auth()
  const token = session!.user.accessToken
  const today = format(new Date(), 'yyyy-MM-dd')

  const [appointments, professionals] = await Promise.all([
    api.get<Appointment[]>(
      `/appointments?dateFrom=${today}T00:00:00.000Z&dateTo=${today}T23:59:59.999Z`,
      { token },
    ).catch(() => [] as Appointment[]),
    api.get<Professional[]>('/professionals', { token }).catch(() => [] as Professional[]),
  ])

  return (
    <AppointmentsClient
      initialAppointments={appointments}
      professionals={professionals}
      token={token}
    />
  )
}
