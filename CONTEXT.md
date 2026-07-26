# CONTEXT.md — BarberFlow
**Cliente:** Du_barber
**Projeto:** BarberFlow — SaaS de Agendamento para Barbearias
**Data de Início:** 2026-07-26
**Orquestrador:** ATHOS v5 — Squad Alpha (Agent Software Architect)

---

## 1. ANÁLISE DE DEMANDA (FASE 0)

### 1.1 Problema de Negócio
Barbearias independentes e redes pequenas perdem receita por conflitos de agenda gerenciados manualmente (WhatsApp, papel), causando:
- Double-booking (dois clientes no mesmo horário/profissional)
- Ausência de visibilidade em tempo real da disponibilidade
- Nenhuma digitalização do fluxo cliente → serviço → profissional → horário

### 1.2 Solução Proposta
SaaS multi-tenant (cada barbearia é um tenant isolado) com três perfis de acesso:
- **Cliente** — fluxo público de autoagendamento
- **Barbeiro** — painel próprio de agenda e bloqueio manual
- **Admin/Dono** — gestão completa da barbearia

### 1.3 Classificação Técnica da Demanda
| Dimensão | Classificação |
|---|---|
| Tipo | Web SaaS multi-tenant |
| Complexidade de domínio | Alta — lógica de disponibilidade em tempo real, prevenção de race conditions |
| Concorrência | Média-Alta — múltiplos clientes tentando reservar o mesmo slot simultaneamente |
| Tempo Real | Parcial — calendário precisa refletir disponibilidade atualizada |
| Perfis de Acesso | 3 roles distintos (RBAC obrigatório) |
| Volume MVP | Baixo-médio (1 tenant, escala horizontal futura) |
| Compliance | LGPD (dados de clientes brasileiros) |

---

## 2. DECISÃO DE STACK (JUSTIFICATIVA OBRIGATÓRIA)

### 2.1 Backend — NestJS + TypeScript
**Escolha:** NestJS (framework Node.js)
**Por que não Python/FastAPI:** Python/FastAPI é superior para cargas de IA/ML intensivo. O BarberFlow é um SaaS de domínio rico (regras de negócio complexas), não computação científica. TypeScript unificado entre backend e frontend elimina context-switching e permite compartilhar tipos via pacotes internos.
**Por que NestJS e não Express/Fastify puro:** O módulo de RBAC (Guards), sistema de DI nativo, decorators e modularidade do NestJS mapeiam diretamente para a estrutura de Clean Architecture mandatória da ATHOS. Express/Fastify requerem setup manual de toda essa estrutura.
**Biblioteca de datas:** `date-fns-tz` — leve, tree-shakeable, imutável e com suporte a timezones (critical para agenda multi-região futura).

### 2.2 Frontend — Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
**Escolha:** Next.js App Router
**Justificativa:** Server Components reduzem bundle do cliente (importante para calendários com muito estado). shadcn/ui provê componentes de calendário, date-picker e time-picker prontos e acessíveis, evitando integrar FullCalendar (licença comercial restritiva no tier pago). Tailwind garante consistência visual rápida no MVP.

### 2.3 Banco de Dados — PostgreSQL + Prisma ORM
**Escolha:** PostgreSQL
**Justificativa:** Transações ACID são mandatórias para prevenir double-booking: o fluxo de reserva exige `SELECT ... FOR UPDATE` (row-level lock) para garantir atomicidade. PostgreSQL é o único banco relacional open-source maduro com suporte nativo a locks de linha, range types (para representar intervalos de tempo) e JSONB (para metadados futuros). Prisma provê type-safety end-to-end e migrations versionadas.

### 2.4 Cache e Prevenção de Race Condition — Redis
**Escolha:** Redis (via Upstash no MVP)
**Justificativa:** Distributed lock com `SET NX EX` garante que dois requests simultâneos para o mesmo slot só permitam que um avance. Upstash oferece tier gratuito serverless, sem infra extra no MVP.

### 2.5 Autenticação — NextAuth.js v5 (Auth.js) + JWT
**Escolha:** NextAuth.js v5
**Justificativa:** Integração nativa com Next.js App Router, suporte a Credentials (email/senha) e OAuth (Google — canal de aquisição futuro), roles no JWT claim sem servidor de identidade externo. Custo zero no MVP.

### 2.6 Infra — Docker Compose + GitHub Actions + Vercel + Railway
**Escolha:** Docker Compose para desenvolvimento local; Vercel (frontend) + Railway (backend + PostgreSQL + Redis) para produção.
**Justificativa:** Railway provê PostgreSQL e Redis gerenciados com tier gratuito/baixo custo para MVP. Vercel é zero-config para Next.js. GitHub Actions para CI/CD sem custo adicional. Docker Compose garante ambiente reproduzível localmente.

---

## 3. ARQUITETURA CLEAN (REGRAS APLICADAS AO PROJETO)

### 3.1 Estrutura de Camadas (Backend — NestJS)
```
src/
├── domain/                    # Entidades, interfaces, regras puras. Zero dependência externa.
│   ├── entities/              # Appointment, Service, Professional, Schedule, Tenant
│   ├── repositories/          # Interfaces (ports): IAppointmentRepository, etc.
│   └── errors/                # AppointmentConflictError, SlotUnavailableError, etc.
│
├── application/               # Use Cases. Depende apenas de /domain.
│   ├── appointments/          # CreateAppointmentUseCase, CheckAvailabilityUseCase
│   ├── professionals/         # ListAvailableProfessionalsUseCase
│   └── services/              # ListServicesUseCase
│
├── infrastructure/            # Implementações concretas. Conhece /application e /domain.
│   ├── database/              # PrismaAppointmentRepository, PrismaProfessionalRepository
│   ├── cache/                 # RedisLockService
│   └── config/                # NestJS modules, providers
│
└── interfaces/                # Controladores HTTP, DTOs, Guards RBAC.
    ├── http/                  # AppointmentsController, ProfessionalsController
    ├── dtos/                  # CreateAppointmentDto, AvailabilityQueryDto
    └── guards/                # RolesGuard, JwtAuthGuard
```

### 3.2 Regra de Dependência (Estrita)
```
interfaces → infrastructure → application → domain
                                         ↑
                              (nunca o contrário)
```

### 3.3 Core Domain — Entidade Central: `Appointment`
```typescript
// domain/entities/Appointment.ts
interface Appointment {
  id: string
  tenantId: string
  professionalId: string
  clientId: string
  serviceIds: string[]
  startsAt: Date
  endsAt: Date          // startsAt + soma das durações dos serviços
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'
  createdAt: Date
}
```

### 3.4 Algoritmo de Disponibilidade (Core Feature)
O `CheckAvailabilityUseCase` executa na camada `/application` e:
1. Busca a jornada do profissional para o dia (`WorkSchedule`)
2. Carrega todos os `Appointment` confirmados do profissional no dia (via `IAppointmentRepository`)
3. Gera slots de N em N minutos (granularidade configurável, padrão 30min)
4. Para cada slot, verifica: `slot.start >= workday.start && slot.end <= workday.end && !overlapsAny(confirmedAppointments)`
5. Marca slots conflitantes como `BLOCKED`
6. Retorna estrutura serializada para o frontend

### 3.5 Prevenção de Double-Booking (Fluxo Atômico)
```
Cliente seleciona slot → Frontend → POST /appointments
→ JwtAuthGuard → RolesGuard
→ AppointmentsController
→ CreateAppointmentUseCase
  → RedisLock.acquire(`lock:prof:{id}:slot:{start}`, TTL=10s)
  → IAppointmentRepository.findConflicts(professionalId, startsAt, endsAt)
  → Se conflito: lança SlotUnavailableError (409)
  → Se livre: IAppointmentRepository.create(appointment)
  → RedisLock.release()
→ Retorna 201 Created
```

---

## 4. MODELO DE DADOS (Prisma Schema — Visão Geral)
```prisma
Tenant          (id, name, slug, plan, createdAt)
User            (id, tenantId, name, email, passwordHash, role: ADMIN|BARBER|CLIENT)
Professional    (id, tenantId, userId, bio, avatarUrl)
WorkSchedule    (id, professionalId, dayOfWeek, startTime, endTime, breakStart, breakEnd)
Service         (id, tenantId, name, durationMinutes, priceInCents, isActive)
Appointment     (id, tenantId, professionalId, clientId, startsAt, endsAt, status)
AppointmentService (appointmentId, serviceId)   -- many-to-many
ManualBlock     (id, professionalId, startsAt, endsAt, reason)
```

---

## 5. FRONTEIRAS DE ESCOPO — MVP vs. PÓS-MVP

| Feature | MVP | Pós-MVP |
|---|---|---|
| Agendamento público | ✅ | — |
| Múltiplos serviços por agendamento | ✅ | — |
| 3 perfis de usuário | ✅ | — |
| Engine de disponibilidade | ✅ | — |
| Prevenção double-booking | ✅ | — |
| Notificações WhatsApp/Email | ❌ | v1.1 |
| Pagamento online | ❌ | v1.2 |
| Multi-tenant (múltiplas barbearias) | Parcial (1 tenant) | v2.0 |
| App Mobile | ❌ | v2.0 |
| Relatórios financeiros | ❌ | v1.1 |
| Avaliações/Reviews | ❌ | v1.2 |

---

*Fase 0 concluída. Stack decidida e justificada. SPEC.md autorizada.*
