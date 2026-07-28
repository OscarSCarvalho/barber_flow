/**
 * Script de dados demo realistas para testes manuais do BarberFlow.
 * Executa: pnpm --filter api exec ts-node -r tsconfig-paths/register prisma/seed-demo.ts
 */
import { PrismaClient, AppointmentStatus } from '@prisma/client'

const prisma = new PrismaClient()

function daysAgo(n: number, hour = 10, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, min, 0, 0)
  return d
}

function daysFromNow(n: number, hour = 10, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hour, min, 0, 0)
  return d
}

async function main() {
  // ── Buscar IDs existentes ────────────────────────────────────────────────
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new Error('Nenhum tenant encontrado — rode o seed principal primeiro.')

  const professionals = await prisma.professional.findMany({
    where: { tenantId: tenant.id },
    include: { user: true },
  })
  if (professionals.length === 0) throw new Error('Nenhum profissional encontrado.')

  const services = await prisma.service.findMany({ where: { tenantId: tenant.id } })
  if (services.length === 0) throw new Error('Nenhum serviço encontrado.')

  const svcByName = Object.fromEntries(services.map((s) => [s.name, s]))
  const corte = svcByName['Corte'] ?? services[0]
  const barba = svcByName['Barba'] ?? services[1] ?? services[0]
  const combo = svcByName['Combo (Corte + Barba)'] ?? services[2] ?? services[0]
  const pezinho = svcByName['Pezinho'] ?? services[3] ?? services[0]

  const [carlos, pedro, ...rest] = professionals
  const pro2 = pedro ?? carlos

  console.log(`Tenant: ${tenant.name} (${tenant.id})`)
  console.log(`Profissionais: ${professionals.map((p) => p.user.name).join(', ')}`)
  console.log(`Serviços: ${services.map((s) => s.name).join(', ')}`)

  // ── Clientes fictícios ───────────────────────────────────────────────────
  const clients = [
    { name: 'Rafael Mendes',     phone: '11991110001' },
    { name: 'Bruno Alves',       phone: '11992220002' },
    { name: 'Diego Ferreira',    phone: '11993330003' },
    { name: 'Lucas Rodrigues',   phone: '11994440004' },
    { name: 'Thiago Costa',      phone: '11995550005' },
    { name: 'Mateus Souza',      phone: '11996660006' },
    { name: 'André Lima',        phone: '11997770007' },
    { name: 'Felipe Barbosa',    phone: '11998880008' },
    { name: 'João Carlos',       phone: '11941313160' },
    { name: 'Gabriel Martins',   phone: '11999990009' },
    { name: 'Caio Pereira',      phone: '11988880010' },
  ]

  // ── Agendamentos passados ─────────────────────────────────────────────────
  type ApptDef = {
    pro: typeof carlos
    client: (typeof clients)[0]
    svcs: typeof corte[]
    start: Date
    status: AppointmentStatus
    notes?: string
    cancelReason?: string
  }

  const pastAppts: ApptDef[] = [
    // Semana passada
    { pro: carlos,  client: clients[0], svcs: [corte],  start: daysAgo(7,  9,  0),  status: 'COMPLETED' },
    { pro: carlos,  client: clients[1], svcs: [combo],  start: daysAgo(7,  10, 30), status: 'COMPLETED', notes: 'Cliente prefere tesoura nas laterais. Deixar comprido no topo.' },
    { pro: pro2,    client: clients[2], svcs: [barba],  start: daysAgo(7,  14, 0),  status: 'COMPLETED' },
    { pro: pro2,    client: clients[3], svcs: [corte],  start: daysAgo(7,  15, 0),  status: 'NO_SHOW' },
    { pro: carlos,  client: clients[4], svcs: [pezinho],start: daysAgo(6,  11, 0),  status: 'COMPLETED' },
    { pro: carlos,  client: clients[5], svcs: [combo],  start: daysAgo(6,  16, 0),  status: 'COMPLETED' },
    // Há 2 semanas
    { pro: carlos,  client: clients[6], svcs: [corte],  start: daysAgo(14, 9,  0),  status: 'COMPLETED' },
    { pro: carlos,  client: clients[7], svcs: [barba],  start: daysAgo(14, 10, 0),  status: 'COMPLETED', notes: 'Barba estilo cavanhaque, manter essa linha.' },
    { pro: pro2,    client: clients[8], svcs: [combo],  start: daysAgo(14, 13, 0),  status: 'COMPLETED' },
    { pro: pro2,    client: clients[9], svcs: [corte],  start: daysAgo(13, 15, 30), status: 'CANCELLED', cancelReason: 'Cliente remarcou para outra data' },
    { pro: carlos,  client: clients[0], svcs: [corte],  start: daysAgo(13, 9,  0),  status: 'COMPLETED' },
    // Há 3 semanas
    { pro: carlos,  client: clients[1], svcs: [combo],  start: daysAgo(21, 10, 0),  status: 'COMPLETED' },
    { pro: pro2,    client: clients[2], svcs: [barba],  start: daysAgo(21, 11, 30), status: 'COMPLETED' },
    { pro: pro2,    client: clients[3], svcs: [corte],  start: daysAgo(20, 9,  0),  status: 'COMPLETED', notes: 'Corte social, cliente tem entrevista amanhã.' },
    { pro: carlos,  client: clients[4], svcs: [pezinho],start: daysAgo(20, 14, 0),  status: 'COMPLETED' },
    { pro: carlos,  client: clients[5], svcs: [corte],  start: daysAgo(19, 16, 0),  status: 'NO_SHOW' },
    // Há 1 mês
    { pro: carlos,  client: clients[6], svcs: [combo],  start: daysAgo(30, 9,  0),  status: 'COMPLETED' },
    { pro: pro2,    client: clients[7], svcs: [barba],  start: daysAgo(30, 11, 0),  status: 'COMPLETED' },
    { pro: carlos,  client: clients[8], svcs: [corte],  start: daysAgo(28, 10, 30), status: 'COMPLETED' },
    { pro: pro2,    client: clients[9], svcs: [corte],  start: daysAgo(27, 14, 0),  status: 'COMPLETED' },
    { pro: carlos,  client: clients[10],svcs: [combo],  start: daysAgo(25, 9,  0),  status: 'COMPLETED' },
    { pro: pro2,    client: clients[0], svcs: [barba],  start: daysAgo(24, 15, 0),  status: 'CANCELLED', cancelReason: 'Remarcação pelo cliente via WhatsApp' },
    // Há 2 meses
    { pro: carlos,  client: clients[1], svcs: [corte],  start: daysAgo(60, 10, 0),  status: 'COMPLETED' },
    { pro: pro2,    client: clients[2], svcs: [combo],  start: daysAgo(58, 11, 0),  status: 'COMPLETED' },
    { pro: carlos,  client: clients[3], svcs: [barba],  start: daysAgo(55, 9,  0),  status: 'COMPLETED' },
    { pro: pro2,    client: clients[4], svcs: [corte],  start: daysAgo(50, 14, 30), status: 'COMPLETED' },
    { pro: carlos,  client: clients[5], svcs: [pezinho],start: daysAgo(45, 16, 0),  status: 'COMPLETED' },
  ]

  // ── Agendamentos futuros ──────────────────────────────────────────────────
  const futureAppts: ApptDef[] = [
    { pro: carlos, client: clients[0],  svcs: [corte],   start: daysFromNow(1,  9,  0),  status: 'CONFIRMED' },
    { pro: carlos, client: clients[1],  svcs: [combo],   start: daysFromNow(1,  10, 30), status: 'CONFIRMED' },
    { pro: pro2,   client: clients[2],  svcs: [barba],   start: daysFromNow(1,  14, 0),  status: 'CONFIRMED' },
    { pro: pro2,   client: clients[3],  svcs: [corte],   start: daysFromNow(2,  9,  0),  status: 'CONFIRMED' },
    { pro: carlos, client: clients[4],  svcs: [pezinho], start: daysFromNow(2,  11, 0),  status: 'CONFIRMED' },
    { pro: carlos, client: clients[5],  svcs: [combo],   start: daysFromNow(3,  10, 0),  status: 'CONFIRMED' },
    { pro: pro2,   client: clients[6],  svcs: [corte],   start: daysFromNow(3,  15, 0),  status: 'CONFIRMED' },
    { pro: carlos, client: clients[7],  svcs: [barba],   start: daysFromNow(5,  9,  0),  status: 'CONFIRMED' },
    { pro: pro2,   client: clients[8],  svcs: [combo],   start: daysFromNow(5,  14, 0),  status: 'CONFIRMED' },
    { pro: carlos, client: clients[9],  svcs: [corte],   start: daysFromNow(7,  10, 0),  status: 'CONFIRMED' },
    { pro: pro2,   client: clients[10], svcs: [corte],   start: daysFromNow(7,  16, 0),  status: 'CONFIRMED' },
    { pro: carlos, client: clients[0],  svcs: [combo],   start: daysFromNow(10, 9,  0),  status: 'CONFIRMED' },
    { pro: pro2,   client: clients[1],  svcs: [barba],   start: daysFromNow(10, 11, 0),  status: 'CONFIRMED' },
  ]

  const allAppts = [...pastAppts, ...futureAppts]
  const createdAppts: { id: string; clientName: string; proId: string; svc: typeof corte; status: AppointmentStatus }[] = []

  for (const a of allAppts) {
    const durMin = a.svcs.reduce((acc, s) => acc + s.durationMinutes, 0)
    const endsAt = new Date(a.start.getTime() + durMin * 60_000)

    // verifica se já existe um agendamento nesse horário exato para evitar duplicata
    const existing = await prisma.appointment.findFirst({
      where: { professionalId: a.pro.id, startsAt: a.start },
    })
    if (existing) {
      console.log(`  skip (existe): ${a.client.name} ${a.start.toISOString()}`)
      createdAppts.push({ id: existing.id, clientName: a.client.name, proId: a.pro.id, svc: a.svcs[0], status: existing.status })
      continue
    }

    const appt = await prisma.appointment.create({
      data: {
        tenantId: tenant.id,
        professionalId: a.pro.id,
        clientName: a.client.name,
        clientPhone: a.client.phone,
        startsAt: a.start,
        endsAt,
        status: a.status,
        cancelReason: a.cancelReason,
        barberNotes: a.notes,
        services: {
          create: a.svcs.map((s) => ({
            serviceId: s.id,
            priceSnapshot: s.priceInCents,
            durationSnapshot: s.durationMinutes,
          })),
        },
      },
    })
    createdAppts.push({ id: appt.id, clientName: a.client.name, proId: a.pro.id, svc: a.svcs[0], status: a.status })
  }
  console.log(`✅ ${createdAppts.length} agendamentos criados/verificados`)

  // ── Reviews (agendamentos COMPLETED) ─────────────────────────────────────
  const reviewData = [
    { rating: 5, comment: 'Melhor barbearia do bairro! Corte impecável e atendimento top.' },
    { rating: 5, comment: 'Carlos é muito preciso no corte. Saí perfeito!' },
    { rating: 4, comment: 'Ótimo atendimento, ambiente agradável. Recomendo.' },
    { rating: 5, comment: 'Profissional excelente, barba ficou exatamente como eu queria.' },
    { rating: 4, comment: 'Muito bom! Só um pouquinho de espera, mas valeu a pena.' },
    { rating: 5, comment: 'Atendimento rápido e de qualidade. Já agendei o próximo.' },
    { rating: 3, comment: 'Bom serviço, mas demorou mais do que o previsto.' },
    { rating: 5, comment: 'Simplesmente incrível. Fidelizado aqui!' },
    { rating: 4, comment: 'Profissional dedicado, resultado excelente.' },
    { rating: 5, comment: 'Pedro é fera na barba! Vou voltar com certeza.' },
  ]

  const completedAppts = createdAppts.filter((a) => a.status === 'COMPLETED')
  let reviewCount = 0
  for (let i = 0; i < Math.min(completedAppts.length, reviewData.length); i++) {
    const a = completedAppts[i]
    const r = reviewData[i % reviewData.length]
    const exists = await prisma.review.findUnique({ where: { appointmentId: a.id } })
    if (exists) continue
    await prisma.review.create({
      data: {
        tenantId: tenant.id,
        appointmentId: a.id,
        professionalId: a.proId,
        clientName: a.clientName,
        rating: r.rating,
        comment: r.comment,
      },
    })
    reviewCount++
  }
  console.log(`✅ ${reviewCount} reviews criadas`)

  // ── Cartões de fidelidade ─────────────────────────────────────────────────
  const loyaltyData = [
    { phone: '11991110001', cuts: 8,  redeemed: 1 },
    { phone: '11992220002', cuts: 5,  redeemed: 0 },
    { phone: '11993330003', cuts: 11, redeemed: 2 },
    { phone: '11994440004', cuts: 3,  redeemed: 0 },
    { phone: '11995550005', cuts: 7,  redeemed: 1 },
    { phone: '11996660006', cuts: 14, redeemed: 2 },
    { phone: '11997770007', cuts: 2,  redeemed: 0 },
    { phone: '11998880008', cuts: 9,  redeemed: 1 },
    { phone: '11941313160', cuts: 6,  redeemed: 1 },
    { phone: '11999990009', cuts: 4,  redeemed: 0 },
    { phone: '11988880010', cuts: 12, redeemed: 2 },
  ]

  for (const l of loyaltyData) {
    await prisma.loyaltyCard.upsert({
      where: { tenantId_clientPhone: { tenantId: tenant.id, clientPhone: l.phone } },
      update: { completedCuts: l.cuts, redeemedCuts: l.redeemed },
      create: {
        tenantId: tenant.id,
        clientPhone: l.phone,
        completedCuts: l.cuts,
        redeemedCuts: l.redeemed,
      },
    })
  }
  console.log(`✅ ${loyaltyData.length} cartões de fidelidade criados/atualizados`)

  // ── Waitlist ──────────────────────────────────────────────────────────────
  const svcIds = services.slice(0, 2).map((s) => s.id)
  const waitlistData = [
    { name: 'Henrique Nunes',  phone: '11977770011', proIdx: 0, date: daysFromNow(2) },
    { name: 'Rodrigo Bastos',  phone: '11977770012', proIdx: 1, date: daysFromNow(3) },
    { name: 'Victor Gomes',    phone: '11977770013', proIdx: 0, date: daysFromNow(5) },
  ]

  for (const w of waitlistData) {
    const pro = professionals[w.proIdx] ?? carlos
    const exists = await prisma.waitlistEntry.findFirst({
      where: { tenantId: tenant.id, clientPhone: w.phone },
    })
    if (exists) continue
    await prisma.waitlistEntry.create({
      data: {
        tenantId: tenant.id,
        professionalId: pro.id,
        clientName: w.name,
        clientPhone: w.phone,
        serviceIds: svcIds,
        preferredDate: w.date,
        status: 'WAITING',
      },
    })
  }
  console.log(`✅ ${waitlistData.length} entradas de waitlist criadas/verificadas`)

  // ── Bloqueios manuais ─────────────────────────────────────────────────────
  const blocks = [
    { pro: carlos, start: daysFromNow(4, 12, 0), end: daysFromNow(4, 13, 30), reason: 'Almoço especial — evento da família' },
    { pro: pro2,   start: daysFromNow(6, 8,  0), end: daysFromNow(6, 9,  0),  reason: 'Consulta médica' },
    { pro: carlos, start: daysFromNow(8, 17, 0), end: daysFromNow(8, 19, 0),  reason: 'Curso de técnicas avançadas' },
  ]

  for (const b of blocks) {
    const exists = await prisma.manualBlock.findFirst({
      where: { professionalId: b.pro.id, startsAt: b.start },
    })
    if (exists) continue
    await prisma.manualBlock.create({
      data: {
        professionalId: b.pro.id,
        startsAt: b.start,
        endsAt: b.end,
        reason: b.reason,
      },
    })
  }
  console.log(`✅ ${blocks.length} bloqueios manuais criados`)

  console.log('\n🎉 Seed demo concluído com sucesso!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
