import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'du-barber' },
    update: {},
    create: { name: 'Du Barber', slug: 'du-barber' },
  })

  const adminHash = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@dubarber.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Administrador',
      email: 'admin@dubarber.com',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })

  const barberHash = await bcrypt.hash('barber123', 10)
  const carlosUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'carlos@dubarber.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Carlos Oliveira',
      email: 'carlos@dubarber.com',
      passwordHash: barberHash,
      role: 'BARBER',
    },
  })

  const pedro = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'pedro@dubarber.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Pedro Santos',
      email: 'pedro@dubarber.com',
      passwordHash: barberHash,
      role: 'BARBER',
    },
  })

  const carlosPro = await prisma.professional.upsert({
    where: { userId: carlosUser.id },
    update: {},
    create: { tenantId: tenant.id, userId: carlosUser.id, bio: 'Especialista em cortes clássicos e modernos.' },
  })

  const pedroPro = await prisma.professional.upsert({
    where: { userId: pedro.id },
    update: {},
    create: { tenantId: tenant.id, userId: pedro.id, bio: 'Expert em barba e degradê.' },
  })

  const weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const
  for (const professional of [carlosPro, pedroPro]) {
    for (const day of weekdays) {
      await prisma.workSchedule.upsert({
        where: { professionalId_dayOfWeek: { professionalId: professional.id, dayOfWeek: day } },
        update: {},
        create: {
          professionalId: professional.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '19:00',
          breakStart: '12:00',
          breakEnd: '13:00',
        },
      })
    }
  }

  const services = [
    { name: 'Corte', durationMinutes: 60, priceInCents: 4500 },
    { name: 'Barba', durationMinutes: 30, priceInCents: 2500 },
    { name: 'Combo (Corte + Barba)', durationMinutes: 90, priceInCents: 6500 },
    { name: 'Pezinho', durationMinutes: 15, priceInCents: 1500 },
  ]

  for (const svc of services) {
    await prisma.service.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: svc.name } },
      update: {},
      create: { tenantId: tenant.id, ...svc },
    })
  }

  console.log('Seed concluído:', { tenant: tenant.slug, profissionais: 2, serviços: services.length })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
