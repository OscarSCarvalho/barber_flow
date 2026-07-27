# BarberFlow

SaaS de agendamento online para barbearias — elimina double-booking e agendamentos manuais por WhatsApp.

## Visão Geral

Plataforma multi-tenant com três perfis de acesso:

| Perfil | Acesso | Funcionalidades principais |
|---|---|---|
| **Cliente** | Público (`/agendar`) | Escolhe serviço, profissional e horário; recebe confirmação |
| **Barbeiro** | `/barbeiro` | Agenda do dia, notas de atendimento, bloqueios manuais, concluir atendimento |
| **Admin/Dono** | `/admin` | Gestão de serviços, equipe, agendamentos, dashboard financeiro |

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **API** | NestJS 10 + TypeScript (Clean Architecture) |
| **Web** | Next.js 14 App Router + Tailwind CSS |
| **Banco** | PostgreSQL via Prisma ORM |
| **Cache / Lock** | Redis (prevenção de double-booking) |
| **Auth** | NextAuth.js v5 + JWT (HS256) |
| **Monorepo** | pnpm workspaces |

---

## Funcionalidades

### Agendamento (Cliente)
- Wizard em 4 etapas: Serviços → Profissional → Data/Hora → Confirmação
- Seleção múltipla de serviços com cálculo de duração e preço total
- Opção "Qualquer profissional disponível" (atribuição automática)
- Engine de disponibilidade em tempo real (slots de 30min)
- Prevenção de double-booking via Redis distributed lock
- Formulário de avaliação (1–5 estrelas) na tela de sucesso
- Cartão de fidelidade — stamps por atendimento concluído
- PWA instalável (Add to Home Screen em iOS e Android)

### Painel do Barbeiro
- Agenda do dia com todos os agendamentos
- Notas internas por atendimento
- Botão "Concluir atendimento" (incrementa fidelidade do cliente)
- Bloqueio manual de horários
- Atualização de status: confirmar, cancelar, marcar no-show

### Painel Admin
- Dashboard financeiro: receita total, ticket médio, concluídos
- Análise de cancelamentos: taxa de desistência, no-shows
- Breakdown de receita por serviço
- Períodos: quinzenal, mensal, 4 meses, 12 meses
- CRUD de serviços (reflete imediatamente na tela de agendamento)
- Gestão de equipe e jornadas de trabalho por dia da semana
- Lista de agendamentos com filtros

---

## Arquitetura

```
apps/
├── api/                        # NestJS — Clean Architecture
│   └── src/
│       ├── domain/             # Entidades e interfaces (zero dependência externa)
│       ├── application/        # Use Cases (regras de negócio)
│       ├── infrastructure/     # Prisma, Redis, implementações
│       └── interfaces/         # Controllers, DTOs, Guards
│
└── web/                        # Next.js 14 App Router
    └── src/
        ├── app/
        │   ├── (booking)/      # Fluxo público de agendamento
        │   ├── (auth)/         # Login
        │   ├── admin/          # Painel admin (RBAC: ADMIN)
        │   └── barbeiro/       # Painel barbeiro (RBAC: BARBER, ADMIN)
        ├── components/
        │   ├── booking/        # BookingWizard e steps
        │   └── calendar/       # WeekStrip, SlotGrid, AvailabilityCalendar
        ├── hooks/              # use-availability (SWR)
        └── lib/                # api.ts (cliente HTTP com proxy)
```

### Proxy de Rede

O frontend nunca chama a API diretamente pelo host — usa URL relativa:

```
Browser → /api/v1/...
            ↓ Next.js rewrite (next.config.mjs)
          localhost:3001/api/v1/...
```

Isso elimina problemas de CORS e garante funcionamento em qualquer dispositivo da rede.

---

## Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 20+
- pnpm 9+
- PostgreSQL 16 (ou conta Supabase)
- Redis 7 (ou Upstash)

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/seu-usuario/barberflow.git
cd barberflow
pnpm install
```

### 2. Configurar variáveis de ambiente

**API** (`apps/api/.env`):
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/barberflow?schema=public"
REDIS_URL=""                          # deixe vazio para cache in-memory em dev
JWT_SECRET="troque-por-secret-forte"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="troque-por-secret-forte"
JWT_REFRESH_EXPIRES_IN="7d"
API_PORT=3001
NODE_ENV=development
DEFAULT_TENANT_ID="tenant-dubarber-001"
FRONTEND_URL="http://localhost:3000"
```

**Web** (`apps/web/.env.local`):
```env
API_INTERNAL_URL="http://localhost:3001"   # servidor → API (nunca exposta ao browser)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="troque-por-secret-forte"
```

> **Importante:** Não use `NEXT_PUBLIC_API_URL`. O frontend usa o proxy do Next.js — o browser jamais deve apontar diretamente para `localhost:3001`.

### 3. Banco de dados

```bash
# Criar tabelas
pnpm --filter api run db:migrate

# Popular com dados de exemplo (1 tenant, 2 barbeiros, 4 serviços)
pnpm --filter api run db:seed
```

### 4. Iniciar em desenvolvimento

```bash
# Inicia API (porta 3001) e Web (porta 3000) em paralelo
pnpm dev
```

Ou separadamente:
```bash
pnpm --filter api dev    # NestJS com hot-reload
pnpm --filter web dev    # Next.js
```

### 5. Credenciais do seed

| Usuário | E-mail | Senha | Role |
|---|---|---|---|
| Admin | admin@dubarber.com | admin123456 | ADMIN |
| Carlos | carlos@dubarber.com | barber123456 | BARBER |
| Ana | ana@dubarber.com | barber123456 | BARBER |

---

## Acesso Mobile / LAN

Para testar no celular na mesma rede Wi-Fi:

1. Descubra o IP do seu computador (`ipconfig` no Windows)
2. Acesse `http://SEU-IP:3000` no browser do celular
3. Sem configurações adicionais — o proxy já está configurado

Para instalar como PWA no celular: abra a URL no Safari (iOS) ou Chrome (Android) e use "Adicionar à tela inicial".

---

## Testes

```bash
pnpm test                          # Todos os testes unitários
pnpm --filter api test             # Apenas API
pnpm --filter api test:integration # Testes de integração (requer banco ativo)
pnpm test:e2e                      # E2E com Playwright
```

---

## Deploy

### API — Railway

Variáveis de produção necessárias:

```env
DATABASE_URL=           # PostgreSQL Railway
REDIS_URL=              # Redis Railway ou Upstash
JWT_SECRET=             # Secret forte (32+ chars)
JWT_REFRESH_SECRET=     # Secret forte diferente
NODE_ENV=production
FRONTEND_URL=           # URL do Vercel (ex: https://barberflow.vercel.app)
DEFAULT_TENANT_ID=      # ID do tenant principal
```

### Web — Vercel

Variáveis de produção necessárias:

```env
API_INTERNAL_URL=       # URL interna da API no Railway (ex: https://barberflow-api.up.railway.app)
NEXTAUTH_URL=           # URL do app Vercel (ex: https://barberflow.vercel.app)
NEXTAUTH_SECRET=        # Secret forte (32+ chars)
```

> Em produção o proxy Next.js encaminha `/api/v1/*` para `API_INTERNAL_URL`, mantendo o mesmo padrão do desenvolvimento.

---

## Estrutura de Banco de Dados

```
Tenant              → barbearia isolada
User                → Admin, Barbeiro (RBAC por role)
Professional        → perfil do barbeiro (bio, avatar)
WorkSchedule        → jornada por dia da semana (horário início/fim, intervalo)
Service             → serviço (nome, duração, preço)
Appointment         → agendamento (status: PENDING → CONFIRMED → COMPLETED)
AppointmentService  → N:N agendamento ↔ serviços
ManualBlock         → bloqueio manual de horário pelo barbeiro
Review              → avaliação do cliente (1–5 estrelas)
LoyaltyCard         → cartão de fidelidade (stamps por atendimento)
WaitlistEntry       → fila de espera
```

---

## Segurança

- **RBAC** — Guards NestJS + Middleware Next.js protegem rotas por role
- **JWT** — access token 15min, refresh token 7d
- **Tenant isolation** — todas as queries filtradas por `tenantId` extraído do JWT
- **Anti double-booking** — Redis `SET NX EX` + verificação de conflito transacional
- **Helmet** — headers de segurança HTTP
- **Rate limiting** — ThrottlerGuard global (100 req/60s); login limitado a 5 req/60s
- **Validação** — `ValidationPipe` com `whitelist: true` em todos os endpoints
- **CORS** — restrito ao `FRONTEND_URL` em produção

---

## Licença

Projeto privado — Du_barber © 2026
