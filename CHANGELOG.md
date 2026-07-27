# CHANGELOG — BarberFlow
**Projeto:** BarberFlow SaaS de Agendamento para Barbearias  
**Cliente:** Du_barber  
**Stack:** NestJS + Next.js 14 + Prisma + PostgreSQL (Supabase) + Redis

---

## [Sprint 8] — 2026-07-26/27 · Engajamento, Finanças & Mobile
> *Objetivo: Fidelização de clientes, dashboard financeiro admin, avaliações, notas de atendimento e experiência mobile/PWA completa.*

### Backend — Novos Módulos

#### Avaliações (`ReviewsModule`)
- `CreateReviewUseCase` — cria avaliação (1–5 estrelas + comentário) vinculada a agendamento concluído
- `GetProfessionalReviewsUseCase` — lista avaliações públicas de um profissional
- `PrismaReviewRepository` — persistência de avaliações
- `ReviewsController` — `POST /reviews`, `GET /reviews/:professionalId`
- Domínio: `ReviewAlreadyExistsError` para impedir avaliação duplicada

#### Fidelidade (`LoyaltyModule`)
- `GetLoyaltyCardUseCase` — retorna cartão de fidelidade do cliente (pontos, meta, stamp atual)
- `PrismaLoyaltyCardRepository` — persistência com incremento automático ao concluir atendimento
- `LoyaltyController` — `GET /loyalty?clientPhone=...`

#### Lista de Espera (`WaitlistModule`)
- `JoinWaitlistUseCase` — insere cliente na fila para uma data/serviço/profissional
- `PrismaWaitlistRepository`
- `WaitlistController` — `POST /waitlist`

#### Financeiro (`FinancialModule`)
- `GetFinancialSummaryUseCase` — agrega receita total, ticket médio, concluídos, cancelamentos e no-shows por período
- `FinancialController` — `GET /financial/summary?from=&to=`
- `IAppointmentRepository` estendido com `getFinancialSummary(from, to)`
- Retorna: `totalRevenue`, `appointmentCount`, `ticketMedio`, `byService[]`, `cancellations.{cancelledCount, noShowCount, totalScheduled, cancellationRate}`

#### Notas de Atendimento & Conclusão
- `AddAppointmentNoteUseCase` — barbeiro registra observações internas do atendimento
- `CompleteAppointmentUseCase` — marca agendamento como `COMPLETED` e incrementa stamp de fidelidade
- Domínio: `AppointmentNotFoundError`, `AppointmentNotCompletedError`
- Novos endpoints: `PATCH /appointments/:id/note`, `PATCH /appointments/:id/complete`
- Entidade `Appointment` estendida: campo `barberNotes?`, `depositPaidCents?`, status `COMPLETED`

#### Lembretes Automáticos (`RemindersModule`)
- `SendAppointmentRemindersUseCase` — identifica agendamentos confirmados com início em 24h
- Cron job `@Cron('0 8 * * *')` executa diariamente às 08:00
- `findPendingReminders` e `markReminderSent` adicionados ao repositório

---

### Frontend — Novas Telas e Componentes

#### Página Inicial (Home)
- Layout dividido: **60% esquerda** (imagem de barbearia + logo + 4 cards de jornada) / **40% direita** (painel branco com botões de ação)
- Botão principal "Agendar horário" (dourado) → `/agendar`
- Botão "Área profissional" (escuro) → `/login`
- Responsivo: colapsa para uma coluna em mobile

#### Dashboard Financeiro Admin (`/admin/financeiro`)
- Seletor de período: **Quinzenal (15d)**, **Mensal (1m)**, **4 meses**, **12 meses**
- KPIs: Receita total, Concluídos, Ticket médio (card escuro destaque)
- Painel de cancelamentos: Total agendados, Cancelados (vermelho), Não compareceu (laranja), Taxa de cancelamento (verde < 15%, âmbar < 30%, vermelho ≥ 30%)
- Breakdown por serviço com barra de proporção
- Item "Financeiro" adicionado ao nav lateral do admin

#### Agenda do Barbeiro — Melhorias (`/barbeiro/agenda`)
- `AppointmentCard` refeito: ID do agendamento, painel de notas colapsável (textarea + botão salvar), botão "Concluir" (esmeralda) para atendimentos ativos
- `AgendaClient` com handlers `handleSaveNote` e `handleComplete` que chamam os novos endpoints

#### Página de Sucesso do Agendamento (`/agendar/sucesso`)
- Formulário de avaliação inline: estrelas 1–5 + comentário opcional → `POST /reviews`
- Banner de fidelidade (card escuro + ícone Gift) mostrando stamps acumulados
- Botão "Repetir este agendamento" → volta para `/agendar` com serviços e profissional pré-selecionados

#### Serviços Admin (`/admin/servicos`)
- Banner informativo esmeralda: "Serviços criados aqui aparecem automaticamente na tela de agendamento"

---

### PWA (Progressive Web App)
- `apps/web/public/manifest.json` criado: `start_url: /agendar`, `display: standalone`, ícones 192px e 512px
- Ícones PNG gerados via script Node.js (`generate-icons.js`) usando apenas módulos nativos
- `layout.tsx` root: `appleWebApp: { statusBarStyle: 'black' }`, `Viewport` export separado conforme API Next.js 14

---

### Correções de Bugs

#### Bug 1 — Login Admin redirecionando para agenda do barbeiro
- **Arquivo:** `apps/web/src/app/(auth)/login/page.tsx`
- **Causa:** `callbackUrl ?? '/barbeiro/agenda'` enviava ADMIN para rota errada
- **Fix:** `getSession()` pós-login + verificação de `role` → ADMIN vai para `/admin`, BARBER vai para `/barbeiro/agenda`

#### Bug 2 — WeekStrip sobrepondo texto no mobile
- **Arquivo:** `apps/web/src/components/calendar/WeekStrip.tsx`
- **Causa:** `format(day, 'EEE')` gera 3 letras que não cabem em 7 colunas em telas pequenas
- **Fix:** `format(day, 'EEEEE')` (letra única), `text-[10px]`, `min-h-[44px]`, `gap-0.5`

#### Bug 3 — Campos nome/telefone invisíveis na confirmação mobile
- **Arquivo:** `apps/web/src/components/booking/steps/BookingConfirmation.tsx`
- **Causa:** Resumo do agendamento com `mb-6` empurrava o formulário para fora da tela
- **Fix:** Layout `flex flex-col gap-3`, resumo em grid 2×2 no mobile, inputs com `py-2.5`

#### Bug 4 — Horários não apareciam no mobile PWA (CORS)
- **Arquivo:** `apps/api/src/main.ts`
- **Causa:** CORS configurado apenas para `http://localhost:3000`; celular acessa via IP da rede
- **Fix:** `origin: isProd ? FRONTEND_URL : true` — dev aceita qualquer origem

#### Bug 5 — Horários não apareciam no mobile (localhost no bundle JS)
- **Arquivos:** `apps/web/next.config.mjs`, `apps/web/src/lib/api.ts`, `apps/web/src/hooks/use-availability.ts`
- **Causa:** `NEXT_PUBLIC_API_URL=http://localhost:3001` embutido no bundle JS; no celular `localhost` resolve para o próprio celular
- **Fix:** Proxy Next.js — rewrite `/api/v1/*` → `http://localhost:3001/api/v1/*`. Browser usa URL relativa (`/api/v1/...`), SSR usa `API_INTERNAL_URL`. `use-availability.ts` corrigido para usar URL relativa (tinha sua própria constante hardcoded)

#### Bug 6 — Dias de julho aparecendo como bloqueados (timezone UTC vs local)
- **Arquivo:** `apps/api/src/interfaces/http/availability/availability.controller.ts`
- **Causa:** `new Date('2026-07-28')` em Node.js cria `2026-07-28T00:00:00Z` (UTC). No fuso UTC-3 (Brasil), isso equivale a `2026-07-27T21:00:00` — o dia anterior. `getDay()` retornava o dia errado; segundas-feiras viravam domingos (sem agenda configurada → `notWorking: true` → todos os slots bloqueados)
- **Fix:** `parseDateLocal('2026-07-28')` → `new Date(2026, 6, 28)` (meia-noite local, sem deslocamento UTC)

#### Bug 7 — Layout mobile com conteúdo abaixo da área visível
- **Arquivo:** `apps/web/src/app/(booking)/layout.tsx`
- **Causa:** `min-h-screen` com scroll de página; usuário não percebia que havia conteúdo abaixo
- **Fix:** `height: 100dvh` + `flex-col` no container; `<main>` com `flex-1 min-h-0 overflow-y-auto` (scroll interno, padrão app nativo). `min-h-0` é obrigatório para que `overflow-y-auto` funcione em flex child

---

## [Sprint 7] — 2026-07-25 · Admin Dashboard & Gestão de Agenda
> *Objetivo: Painel administrativo completo com gestão de agendamentos, equipe, serviços e bloqueios.*

- Admin layout com sidebar responsiva (Agendamentos, Serviços, Equipe, Bloqueios, Financeiro)
- `GET /admin/appointments` — lista agendamentos com filtros por data e status
- CRUD de serviços pelo admin com reflexo imediato na tela de agendamento
- Gestão de jornada de trabalho (WorkScheduleEditor por dia da semana)
- Bloqueios manuais de horário (`ManualBlock`)
- Dashboard principal admin com métricas do dia

---

## [Sprint 6] — 2026-07-24 · Painel do Barbeiro
> *Objetivo: Visão diária do barbeiro com agenda, status de atendimentos e perfil.*

- `app/barbeiro/agenda` — agenda do dia com slots por horário
- Visualização de detalhes do agendamento: serviços, cliente, duração, valor
- Atualização de status (confirmar, cancelar, no-show)
- Perfil do barbeiro editável (bio, avatar URL)
- Layout com sidebar `/barbeiro/layout.tsx`

---

## [Sprint 5] — 2026-07-23 · Fluxo de Agendamento (Wizard)
> *Objetivo: Jornada completa de agendamento pelo cliente em 4 passos.*

- `BookingWizard` com 4 steps: Serviços → Profissional → Data/Hora → Confirmação
- `ServiceSelector` com seleção múltipla, preço e duração
- `ProfessionalSelector` com opção "Qualquer profissional disponível"
- `DateTimePicker` com `AvailabilityCalendar` + `WeekStrip` (14 dias) + `SlotGrid`
- `BookingConfirmation` com formulário nome/telefone e resumo compacto
- Prevenção de double-booking via Redis distributed lock
- Página de sucesso `/agendar/sucesso` com detalhes do agendamento

---

## [Sprint 4] — 2026-07-22 · Engine de Disponibilidade
> *Objetivo: Algoritmo central que gera slots livres/ocupados respeitando jornada, almoço e appointments existentes.*

- `CheckAvailabilityUseCase` — gera todos os slots do dia (30min), marca AVAILABLE / APPOINTMENT / MANUAL_BLOCK / OUTSIDE_HOURS / LUNCH
- `GetAvailableProfessionalsUseCase` — dado um slot, retorna quais profissionais têm aquele horário livre
- `AvailabilityCacheService` com Redis (TTL 60s) para evitar recalcular a cada request
- `useAvailability` hook no frontend com SWR (deduplicação 30s)
- Regra de negócio: duração total dos serviços selecionados respeita blocos consecutivos disponíveis

---

## [Sprint 3] — 2026-07-21 · Agendamentos (Core)
> *Objetivo: Criar, consultar, cancelar e marcar no-show em agendamentos.*

- Entidade `Appointment` com status enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `NO_SHOW`, `COMPLETED`
- `CreateAppointmentUseCase` com validação de conflito e lock Redis
- `CancelAppointmentUseCase`, `MarkNoShowUseCase`
- `PrismaAppointmentRepository` com queries filtradas por tenant e dia
- `AppointmentsController` com endpoints CRUD + filtros

---

## [Sprint 2] — 2026-07-20 · Catálogo de Serviços e Profissionais
> *Objetivo: CRUD completo de serviços, profissionais e jornadas de trabalho.*

- Entidades: `Service`, `Professional`, `WorkSchedule`
- Use Cases: Create/Update/Deactivate/List Service; Create/Update Professional; SetWorkSchedule
- Controllers: `ServicesController`, `ProfessionalsController`, `WorkSchedulesController`
- Frontend admin: tabela de serviços, formulário modal, lista de equipe, editor de jornada
- Swagger documentado com `@nestjs/swagger`

---

## [Sprint 1] — 2026-07-19 · Autenticação & RBAC
> *Objetivo: Login, registro e controle de acesso por role ponta a ponta.*

- Entidade `User` com roles: `ADMIN`, `BARBER`
- `RegisterUserUseCase`, `LoginUseCase` com bcrypt (rounds=10)
- JWT access token 15min, JwtStrategy, JwtAuthGuard, RolesGuard, TenantGuard
- `AuthController`: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- NextAuth v5 com provider Credentials
- `middleware.ts` Next.js protegendo `/admin/*` e `/barbeiro/*` por role
- Testes unitários: RegisterUserUseCase, LoginUseCase

---

## [Sprint 0] — 2026-07-18 · Fundação
> *Objetivo: Repositório, monorepo, Docker, banco e CI prontos.*

- Monorepo com pnpm workspaces: `apps/api` (NestJS), `apps/web` (Next.js)
- `docker-compose.yml`: postgres:16, redis:7-alpine, api, web
- Schema Prisma completo: Tenant, User, Professional, WorkSchedule, Service, Appointment, AppointmentService, ManualBlock, Review, LoyaltyCard, WaitlistEntry
- Migration `0001_initial_schema` + seed com 1 tenant, 2 barbeiros (Carlos, Ana), 4 serviços
- Clean Architecture: `/domain`, `/application`, `/infrastructure`, `/interfaces`
- ESLint + Prettier + GitHub Actions CI (lint → test → build)
- Configuração de segurança: Helmet, ThrottlerGuard global, ValidationPipe estrita

---

## Estado Atual do Sistema

### Servidores (dev local)
| Serviço | Porta | Status |
|---|---|---|
| Next.js (web) | 3000 | ✅ Rodando |
| NestJS (api) | 3001 | ✅ Rodando |
| PostgreSQL | 5432 | ✅ Supabase |
| Redis | 6379 | ✅ Local/Docker |

### Acesso mobile/LAN
- URL web: `http://192.168.0.217:3000`
- Proxy Next.js: `/api/v1/*` → `localhost:3001/api/v1/*` (sem CORS, sem exposição de IP)

### Próximos Passos
- [ ] Deploy API → Railway
- [ ] Deploy Web → Vercel
- [ ] Configurar variáveis de produção (`DATABASE_URL`, `REDIS_URL`, `FRONTEND_URL`, `JWT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`)
- [ ] Configurar domínio personalizado
- [ ] Handoff e treinamento do cliente Du
