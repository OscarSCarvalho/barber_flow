# PLAN.md — BarberFlow
**Fase 3 — Planejamento Técnico Atômico**
**Cliente:** Du_barber | **Projeto:** BarberFlow MVP
**Executado por:** Squads Alpha + Beta + Delta
**Data:** 2026-07-26

---

## CONVENÇÕES

- **[BE]** = Backend (NestJS)
- **[FE]** = Frontend (Next.js)
- **[DB]** = Banco/Migrations (Prisma)
- **[QA]** = Testes (Jest/Playwright)
- **[OPS]** = Infra/DevOps
- Status: `[ ]` pendente | `[x]` concluído

---

## SPRINT 0 — Fundação (Semana 1)
> *Objetivo: Repositório, monorepo, Docker, CI/CD e schema inicial prontos. Nenhum code de negócio ainda.*

### [OPS] Estrutura do Repositório
- [ ] S0-01 `[OPS]` Criar repositório GitHub `barberflow` com `.gitignore`, `README.md` e branch strategy (`main` + `develop`)
- [ ] S0-02 `[OPS]` Configurar monorepo com **pnpm workspaces**: `apps/api` (NestJS), `apps/web` (Next.js), `packages/types` (tipos compartilhados)
- [ ] S0-03 `[OPS]` Criar `docker-compose.yml` com serviços: `postgres:16`, `redis:7-alpine`, `api` (com hot-reload), `web`
- [ ] S0-04 `[OPS]` Adicionar `.env.example` com todas as variáveis necessárias documentadas
- [ ] S0-05 `[OPS]` Configurar ESLint + Prettier unificados no root do monorepo
- [ ] S0-06 `[OPS]` Configurar GitHub Actions: workflow `ci.yml` com jobs `lint → test → build`

### [BE] Setup NestJS
- [ ] S0-07 `[BE]` Inicializar projeto NestJS em `apps/api` com TypeScript strict
- [ ] S0-08 `[BE]` Criar estrutura de pastas Clean Architecture: `src/domain/`, `src/application/`, `src/infrastructure/`, `src/interfaces/`
- [ ] S0-09 `[BE]` Instalar e configurar dependências: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `class-validator`, `class-transformer`, `date-fns-tz`
- [ ] S0-10 `[BE]` Configurar `ConfigModule` global com validação de schema de variáveis de ambiente

### [DB] Schema Prisma Inicial
- [ ] S0-11 `[DB]` Instalar Prisma + `@prisma/client`, configurar `DATABASE_URL`
- [ ] S0-12 `[DB]` Escrever schema completo:
  ```
  Tenant, User (com role enum), Professional, WorkSchedule,
  Service, Appointment, AppointmentService, ManualBlock
  ```
- [ ] S0-13 `[DB]` Criar migration inicial: `0001_initial_schema`
- [ ] S0-14 `[DB]` Criar seed script com dados de exemplo (1 tenant, 2 barbeiros, 3 serviços)
- [ ] S0-15 `[DB]` Configurar `PrismaModule` como global no NestJS com connection pooling

### [FE] Setup Next.js
- [ ] S0-16 `[FE]` Inicializar Next.js 14 App Router + TypeScript em `apps/web`
- [ ] S0-17 `[FE]` Instalar e configurar Tailwind CSS v3
- [ ] S0-18 `[FE]` Instalar shadcn/ui e inicializar com tema (cores: dark/barber)
- [ ] S0-19 `[FE]` Adicionar componentes shadcn base: `Button`, `Card`, `Input`, `Badge`, `Calendar`, `Select`, `Sheet`, `Skeleton`
- [ ] S0-20 `[FE]` Configurar estrutura de pastas: `app/`, `components/`, `lib/`, `hooks/`, `types/`

---

## SPRINT 1 — Autenticação & RBAC (Semana 2)
> *Objetivo: Login, registro e controle de acesso por role funcionando ponta a ponta.*

### [BE] Domain & Application — Auth
- [ ] S1-01 `[BE]` Criar entidade de domínio `User` em `domain/entities/User.ts` (sem dependência de ORM)
- [ ] S1-02 `[BE]` Criar interface `IUserRepository` em `domain/repositories/`
- [ ] S1-03 `[BE]` Criar erros de domínio: `UserNotFoundError`, `InvalidCredentialsError`, `EmailAlreadyInUseError`
- [ ] S1-04 `[BE]` Criar `RegisterUserUseCase` em `application/auth/` (hash de senha com `bcrypt`)
- [ ] S1-05 `[BE]` Criar `LoginUseCase` em `application/auth/` (valida credenciais, retorna payload JWT)

### [BE] Infrastructure — Auth
- [ ] S1-06 `[BE]` Implementar `PrismaUserRepository` em `infrastructure/database/` (implementa `IUserRepository`)
- [ ] S1-07 `[BE]` Configurar `JwtModule` (access token 15min + refresh token 7d)
- [ ] S1-08 `[BE]` Criar `JwtAuthGuard` e `RolesGuard` em `interfaces/guards/`
- [ ] S1-09 `[BE]` Criar decorator `@Roles(Role.ADMIN, Role.BARBER)` para uso nos controllers
- [ ] S1-10 `[BE]` Criar `AuthController` com rotas: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- [ ] S1-11 `[BE]` Criar `AuthDto`s com validação `class-validator`: `RegisterDto`, `LoginDto`

### [FE] Auth Flow
- [ ] S1-12 `[FE]` Instalar e configurar **NextAuth.js v5** com provider `Credentials`
- [ ] S1-13 `[FE]` Criar `app/(auth)/login/page.tsx` — formulário de login com validação (react-hook-form + zod)
- [ ] S1-14 `[FE]` Criar `app/(auth)/register/page.tsx` — formulário de registro de cliente
- [ ] S1-15 `[FE]` Criar `middleware.ts` na raiz para proteger rotas `/barbeiro/*` e `/admin/*` por role
- [ ] S1-16 `[FE]` Criar `lib/api.ts` — client HTTP centralizado com interceptor para injetar Bearer token

### [QA] Auth
- [ ] S1-17 `[QA]` Testes unitários: `RegisterUserUseCase` e `LoginUseCase` (mock do `IUserRepository`)
- [ ] S1-18 `[QA]` Teste de integração: `POST /auth/login` com credenciais válidas e inválidas

---

## SPRINT 2 — Catálogo: Serviços e Profissionais (Semanas 3–4)
> *Objetivo: CRUD completo de serviços, profissionais e jornadas de trabalho.*

### [BE] Domain
- [ ] S2-01 `[BE]` Criar entidade `Service` em `domain/entities/Service.ts` (id, tenantId, name, durationMinutes, priceInCents, isActive)
- [ ] S2-02 `[BE]` Criar entidade `Professional` em `domain/entities/Professional.ts`
- [ ] S2-03 `[BE]` Criar entidade `WorkSchedule` em `domain/entities/WorkSchedule.ts` (dayOfWeek enum, startTime, endTime, breakStart, breakEnd)
- [ ] S2-04 `[BE]` Criar interfaces: `IServiceRepository`, `IProfessionalRepository`, `IWorkScheduleRepository`
- [ ] S2-05 `[BE]` Criar erros: `ServiceNotFoundError`, `ProfessionalNotFoundError`, `ServiceInactiveError`

### [BE] Application — Serviços
- [ ] S2-06 `[BE]` `CreateServiceUseCase` — valida unicidade de nome no tenant, cria serviço
- [ ] S2-07 `[BE]` `UpdateServiceUseCase` — atualiza campos, garante que duração > 0
- [ ] S2-08 `[BE]` `DeactivateServiceUseCase` — soft delete (isActive = false), não apaga histórico
- [ ] S2-09 `[BE]` `ListServicesUseCase` — filtra por tenant, retorna apenas ativos por padrão

### [BE] Application — Profissionais
- [ ] S2-10 `[BE]` `CreateProfessionalUseCase` — cria usuário com role BARBER + perfil Professional
- [ ] S2-11 `[BE]` `UpdateProfessionalUseCase` — atualiza bio, avatar
- [ ] S2-12 `[BE]` `SetWorkScheduleUseCase` — upsert da jornada por dia da semana

### [BE] Infrastructure
- [ ] S2-13 `[BE]` Implementar `PrismaServiceRepository`
- [ ] S2-14 `[BE]` Implementar `PrismaProfessionalRepository`
- [ ] S2-15 `[BE]` Implementar `PrismaWorkScheduleRepository`

### [BE] Interfaces (Controllers)
- [ ] S2-16 `[BE]` `ServicesController`: `GET /services`, `POST /services`, `PATCH /services/:id`, `DELETE /services/:id`
- [ ] S2-17 `[BE]` `ProfessionalsController`: `GET /professionals`, `POST /professionals`, `PATCH /professionals/:id`
- [ ] S2-18 `[BE]` `WorkSchedulesController`: `PUT /professionals/:id/schedules`
- [ ] S2-19 `[BE]` Configurar Swagger (`@nestjs/swagger`) com anotações nos controllers e DTOs

### [FE] Admin — Gestão de Catálogo
- [ ] S2-20 `[FE]` Layout do painel admin: `app/admin/layout.tsx` com sidebar (Serviços, Equipe, Agendamentos)
- [ ] S2-21 `[FE]` `app/admin/servicos/page.tsx` — tabela de serviços com ações (editar, desativar)
- [ ] S2-22 `[FE]` Componente `ServiceForm` — modal com formulário de criação/edição (nome, duração, preço)
- [ ] S2-23 `[FE]` `app/admin/equipe/page.tsx` — lista de barbeiros com card de perfil
- [ ] S2-24 `[FE]` Componente `WorkScheduleEditor` — grade semanal para configurar jornada (por dia da semana)

### [QA] Catálogo
- [ ] S2-25 `[QA]` Testes unitários para todos os Use Cases de Serviços e Profissionais
- [ ] S2-26 `[QA]` Teste de integração: `GET /services` retorna apenas serviços ativos do tenant

---

## SPRINT 3 — Engine de Disponibilidade (Semanas 5–6) ⭐ CORE FEATURE
> *Objetivo: Algoritmo de disponibilidade funcionando com todos os cenários da SPEC.md.*

### [BE] Domain — Conceito de Disponibilidade
- [ ] S3-01 `[BE]` Criar Value Object `TimeSlot` em `domain/entities/TimeSlot.ts`:
  ```typescript
  class TimeSlot {
    readonly startsAt: Date
    readonly endsAt: Date
    readonly status: 'AVAILABLE' | 'BLOCKED'
    readonly blockReason?: 'APPOINTMENT' | 'MANUAL_BLOCK' | 'OUTSIDE_HOURS' | 'LUNCH'
  }
  ```
- [ ] S3-02 `[BE]` Criar entidade `ManualBlock` em `domain/entities/ManualBlock.ts`
- [ ] S3-03 `[BE]` Criar interface `IManualBlockRepository`
- [ ] S3-04 `[BE]` Criar erro `SlotUnavailableError` com campo `conflictingSlot: TimeSlot`

### [BE] Application — CheckAvailabilityUseCase
- [ ] S3-05 `[BE]` Criar `CheckAvailabilityUseCase` em `application/availability/`:
  - Input: `{ professionalId, serviceIds[], date, tenantId }`
  - Passo 1: Busca jornada do profissional para o `dayOfWeek` da data
  - Passo 2: Se jornada ausente → retorna `[]` com flag `NOT_WORKING`
  - Passo 3: Calcula `totalDuration = soma(service.durationMinutes)`
  - Passo 4: Gera lista de slots candidatos (granularidade 30min) dentro da jornada
  - Passo 5: Para cada slot candidato, verifica 4 condições de bloqueio:
    1. `slot.end > workday.end` → OUTSIDE_HOURS
    2. `slot overlaps lunch` → LUNCH
    3. `slot overlaps confirmedAppointment` → APPOINTMENT
    4. `slot overlaps manualBlock` → MANUAL_BLOCK
  - Passo 6: Retorna `TimeSlot[]` com status de cada slot
- [ ] S3-06 `[BE]` Criar `GetAvailableProfessionalsUseCase` — para "Qualquer profissional": executa `CheckAvailabilityUseCase` para cada profissional e retorna os que têm o slot disponível

### [BE] Infrastructure — Cache de Disponibilidade
- [ ] S3-07 `[BE]` Criar `RedisModule` e `RedisService` em `infrastructure/cache/`
- [ ] S3-08 `[BE]` Implementar `AvailabilityCacheService`: cache de slots por `prof:{id}:date:{YYYY-MM-DD}` com TTL de 60s
- [ ] S3-09 `[BE]` Implementar `RedisLockService` com `acquireLock(key, ttl)` e `releaseLock(key)`
- [ ] S3-10 `[BE]` Implementar `PrismaManualBlockRepository`

### [BE] Interfaces — Availability Controller
- [ ] S3-11 `[BE]` `AvailabilityController`:
  - `GET /availability?professionalId=&serviceIds=&date=`
  - `GET /availability/professionals?serviceIds=&date=&time=`
- [ ] S3-12 `[BE]` `AvailabilityQueryDto` com validação: `date` no futuro, `serviceIds` array não-vazio

### [FE] Componente de Calendário
- [ ] S3-13 `[FE]` Criar hook `useAvailability(professionalId, serviceIds, date)` — chama `GET /availability`, retorna `TimeSlot[]` com SWR
- [ ] S3-14 `[FE]` Componente `AvailabilityCalendar`:
  - Cabeçalho: navegação de semana (prev/next)
  - Body: grid de dias com botões de slot
  - Slot `AVAILABLE` → verde/clicável
  - Slot `BLOCKED` → cinza/desabilitado com tooltip do motivo
  - Slot selecionado → destacado (anel primário)
  - Loading state com Skeleton
- [ ] S3-15 `[FE]` Lógica de invalidação: ao confirmar um agendamento, invalidar cache SWR do calendário

### [QA] Engine de Disponibilidade
- [ ] S3-16 `[QA]` Testes unitários `CheckAvailabilityUseCase` cobrindo TODOS os cenários BDD da SPEC.md (B-01 a B-08)
- [ ] S3-17 `[QA]` Teste de concorrência: simular 10 requests simultâneos para o mesmo slot via `Promise.all`
- [ ] S3-18 `[QA]` Teste de integração: `GET /availability` com banco real via `@nestjs/testing`

---

## SPRINT 4 — Fluxo de Agendamento (Semanas 7–8)
> *Objetivo: Cliente consegue agendar de ponta a ponta com prevenção de double-booking.*

### [BE] Domain — Appointment
- [ ] S4-01 `[BE]` Criar entidade `Appointment` em `domain/entities/Appointment.ts`
- [ ] S4-02 `[BE]` Criar interface `IAppointmentRepository` com método `findConflicts(professionalId, startsAt, endsAt)`
- [ ] S4-03 `[BE]` Criar erros: `AppointmentConflictError`, `PastDateError`, `ProfessionalNotAvailableError`

### [BE] Application — CreateAppointmentUseCase
- [ ] S4-04 `[BE]` Criar `CreateAppointmentUseCase` (fluxo atômico com lock):
  ```
  1. Validar data no futuro → PastDateError se falhar
  2. RedisLock.acquire(`lock:prof:{id}:slot:{startsAt}`, 10s)
  3. IAppointmentRepository.findConflicts(professionalId, startsAt, endsAt)
  4. Se conflito → ReleaseLock → throw AppointmentConflictError
  5. IAppointmentRepository.create(appointment)
  6. RedisLock.release()
  7. Invalidar cache de disponibilidade do dia no Redis
  ```
- [ ] S4-05 `[BE]` Criar `CancelAppointmentUseCase` — muda status para CANCELLED, valida se já passou
- [ ] S4-06 `[BE]` Criar `ListAppointmentsUseCase` — filtra por tenantId, professionalId, date range, status

### [BE] Infrastructure
- [ ] S4-07 `[BE]` Implementar `PrismaAppointmentRepository` com `findConflicts` usando query:
  ```sql
  WHERE professionalId = $1
  AND status NOT IN ('CANCELLED', 'NO_SHOW')
  AND startsAt < $endsAt AND endsAt > $startsAt
  FOR UPDATE
  ```

### [BE] Interfaces
- [ ] S4-08 `[BE]` `AppointmentsController`:
  - `POST /appointments` — público (client sem auth no MVP)
  - `GET /appointments` — admin/barber (com filtros)
  - `PATCH /appointments/:id/cancel` — admin ou dono do agendamento
- [ ] S4-09 `[BE]` `CreateAppointmentDto`: nome, telefone, professionalId, serviceIds[], startsAt

### [FE] Fluxo de Agendamento (4 Etapas)
- [ ] S4-10 `[FE]` Criar `app/(booking)/agendar/page.tsx` — container do wizard de 4 etapas
- [ ] S4-11 `[FE]` Componente `BookingWizard` com state machine (etapas: SERVICES → PROFESSIONAL → DATETIME → CONFIRM)
- [ ] S4-12 `[FE]` **Etapa 1** — `ServiceSelector`: grid de cards de serviços (seleção múltipla), mostra duração total e preço acumulado no rodapé
- [ ] S4-13 `[FE]` **Etapa 2** — `ProfessionalSelector`: cards dos profissionais + opção "Qualquer disponível"
- [ ] S4-14 `[FE]` **Etapa 3** — `DateTimePicker`: calendário de navegação de semana + `AvailabilityCalendar` (do Sprint 3)
- [ ] S4-15 `[FE]` **Etapa 4** — `BookingConfirmation`: resumo completo + campos nome/telefone + botão "Confirmar Agendamento"
- [ ] S4-16 `[FE]` `app/(booking)/agendar/sucesso/page.tsx` — tela de sucesso com QR code fictício e detalhes do agendamento
- [ ] S4-17 `[FE]` Tratamento de erro 409 (slot ocupado): toast de erro + redirect para Etapa 3 para nova seleção

### [QA] Booking
- [ ] S4-18 `[QA]` Teste de integração: fluxo completo `POST /appointments` com lock real do Redis
- [ ] S4-19 `[QA]` Teste E2E (Playwright): fluxo completo na UI (Serviço → Profissional → Horário → Confirmar → Sucesso)
- [ ] S4-20 `[QA]` Teste E2E: tentativa de double-booking (dois tabs simultâneos)

---

## SPRINT 5 — Painel do Barbeiro (Semana 9)
> *Objetivo: Barbeiro consegue ver a própria agenda e bloquear horários.*

### [BE] Application — Painel Barbeiro
- [ ] S5-01 `[BE]` `GetBarberDayScheduleUseCase` — retorna agendamentos do dia ordenados por horário
- [ ] S5-02 `[BE]` `CreateManualBlockUseCase` — verifica conflito com agendamentos antes de salvar
- [ ] S5-03 `[BE]` `DeleteManualBlockUseCase` — remove bloqueio manual (apenas futuros)

### [BE] Interfaces
- [ ] S5-04 `[BE]` `ManualBlocksController`: `POST /manual-blocks`, `GET /manual-blocks`, `DELETE /manual-blocks/:id`
- [ ] S5-05 `[BE]` Garantir que `GET /appointments` com `?professionalId=me` retorna apenas os do barbeiro autenticado

### [FE] Painel do Barbeiro
- [ ] S5-06 `[FE]` Layout: `app/barbeiro/layout.tsx` com sidebar (Minha Agenda, Bloquear Horário)
- [ ] S5-07 `[FE]` `app/barbeiro/agenda/page.tsx` — lista diária de agendamentos:
  - Card por agendamento: hora, cliente (nome + telefone), serviço(s), duração, status badge
  - Navegação dia anterior / próximo dia
  - Botão "Cancelar" com modal de confirmação
- [ ] S5-08 `[FE]` `app/barbeiro/agenda/semana/page.tsx` — visão semanal em grid de horas
- [ ] S5-09 `[FE]` `app/barbeiro/bloquear/page.tsx` — formulário de bloqueio manual:
  - Date picker, range de horário (start/end), campo motivo (opcional)
  - Lista de bloqueios futuros com botão de remover

### [QA] Painel Barbeiro
- [ ] S5-10 `[QA]` Teste unitário: `CreateManualBlockUseCase` com cenário de conflito com agendamento existente
- [ ] S5-11 `[QA]` Teste E2E: barbeiro faz login, bloqueia horário, cliente tenta agendar no mesmo slot → bloqueado

---

## SPRINT 6 — Painel do Admin (Semana 9)
> *Objetivo: Admin tem visão geral completa da operação.*

### [FE] Painel Admin
- [ ] S6-01 `[FE]` `app/admin/page.tsx` — dashboard com KPIs: agendamentos do dia, taxa de ocupação, receita projetada
- [ ] S6-02 `[FE]` `app/admin/agendamentos/page.tsx` — tabela de todos os agendamentos com filtros (data, profissional, status)
- [ ] S6-03 `[FE]` Componente `AppointmentTable` com paginação, ordenação e ação de cancelar (com modal)
- [ ] S6-04 `[FE]` Integrar `WorkScheduleEditor` (criado no Sprint 2) no perfil de cada barbeiro
- [ ] S6-05 `[FE]` `app/admin/equipe/[id]/page.tsx` — página de edição de barbeiro com foto, bio e jornada

### [QA] Admin
- [ ] S6-06 `[QA]` Teste E2E: admin cancela agendamento → slot volta a aparecer como disponível no calendário público

---

## SPRINT 7 — Hardening, Deploy e Handoff (Semana 10)

### [BE] Hardening
- [ ] S7-01 `[BE]` Implementar rate limiting global (`@nestjs/throttler`): 100 req/min por IP
- [ ] S7-02 `[BE]` Implementar Helmet para headers de segurança
- [ ] S7-03 `[BE]` Adicionar `tenant isolation middleware` — garante que qualquer query sempre filtra por `tenantId` do JWT
- [ ] S7-04 `[BE]` Revisar todos os endpoints: OWASP Top 10 check (injection, broken auth, broken access control)
- [ ] S7-05 `[BE]` Configurar logging estruturado (JSON) com `winston`

### [FE] Hardening
- [ ] S7-06 `[FE]` Adicionar loading states e error boundaries em todos os fluxos críticos
- [ ] S7-07 `[FE]` Implementar `optimistic updates` no cancelamento de agendamento
- [ ] S7-08 `[FE]` Revisar acessibilidade WCAG 2.1 AA: foco visível, aria-labels nos slots de calendário, contraste

### [OPS] Deploy
- [ ] S7-09 `[OPS]` Configurar projeto no Railway: serviço `api` + PostgreSQL + Redis
- [ ] S7-10 `[OPS]` Configurar projeto no Vercel: `apps/web` com variáveis de ambiente de produção
- [ ] S7-11 `[OPS]` Configurar secrets no GitHub Actions para deploy automático em `main`
- [ ] S7-12 `[OPS]` Rodar migration em produção e seed de dados do cliente Du_barber
- [ ] S7-13 `[OPS]` Configurar domínio customizado e SSL

### [QA] Final
- [ ] S7-14 `[QA]` Rodar suite completa de testes: unitários + integração + E2E
- [ ] S7-15 `[QA]` Smoke test em produção: agendar → visualizar como barbeiro → cancelar como admin
- [ ] S7-16 `[QA]` Teste de carga: simular 50 usuários simultâneos via k6 (meta: < 500ms p95)

### [OPS] Handoff
- [ ] S7-17 `[OPS]` Atualizar `README.md` com instruções de setup local e comandos
- [ ] S7-18 `[OPS]` Transferir ownership do repositório GitHub para Du_barber
- [ ] S7-19 `[OPS]` Entregar documento de variáveis de ambiente e credenciais de acesso
- [ ] S7-20 `[OPS]` Sessão de treinamento (30min): Admin, Barbeiro e fluxo de agendamento público

---

## RESUMO DE TAREFAS POR SPRINT

| Sprint | Descrição | Tarefas | Semana |
|---|---|---|---|
| S0 | Fundação (repo, Docker, schema) | 20 | 1 |
| S1 | Auth + RBAC | 18 | 2 |
| S2 | Catálogo (Serviços + Profissionais) | 26 | 3–4 |
| S3 | Engine de Disponibilidade ⭐ | 18 | 5–6 |
| S4 | Fluxo de Agendamento | 20 | 7–8 |
| S5 | Painel do Barbeiro | 11 | 9 |
| S6 | Painel do Admin | 6 | 9 |
| S7 | Hardening + Deploy + Handoff | 20 | 10 |
| **TOTAL** | | **139 tarefas** | **10 semanas** |

---

## ORDEM DE DEPENDÊNCIA (CRÍTICA)

```
S0 (Fundação)
 └─► S1 (Auth)
      └─► S2 (Catálogo)
           └─► S3 (Disponibilidade) ← DESBLOQUEADOR PRINCIPAL
                └─► S4 (Agendamento)
                     ├─► S5 (Painel Barbeiro)
                     ├─► S6 (Painel Admin)
                     └─► S7 (Deploy)
```

---

*Fase 3 concluída. PLAN.md aprovado internamente. Fase 4 (Implementação) autorizada.*
*Squad Beta aguarda ordem de início para Sprint 0.*
