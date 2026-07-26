# AI_ROLES.md — BarberFlow
**Constituição de Agentes do Projeto**
**Cliente:** Du_barber | **Projeto:** BarberFlow
**Data:** 2026-07-26

---

## SQUAD OMEGA — Commercial & Growth (The Rainmakers)

### Agent SDR Staff
**Responsabilidade no Projeto:** Identificação de barbearias-piloto para validação do MVP, coleta de feedback de mercado sobre features prioritárias e inteligência competitiva (Booksy, Trinks, SetMoreApp).

### Agent Tech Estimator & Pricing Specialist
**Responsabilidade no Projeto:** Estimativa de horas por sprint baseada na stack NestJS + Next.js + PostgreSQL, cálculo de custo de infra Railway/Vercel/Upstash e modelagem de pricing do SaaS (planos Free/Pro/Business).

### Agent Account Executive Staff
**Responsabilidade no Projeto:** Elaboração do `PROPOSAL.md`, definição de milestone de aprovação e estrutura contratual de entrega por fase.

---

## SQUAD ALPHA — Product & Architecture (The Architects)

### Agent Product Manager Staff
**Responsabilidade no Projeto:** Tradução dos requisitos do Du_barber em `SPEC.md` com BDD completo. Mapeamento de personas (Cliente, Barbeiro, Admin). Priorização do backlog do MVP.

### Agent Software Architect
**Responsabilidade no Projeto:** Guardião da Clean Architecture definida no `CONTEXT.md`. Decisões de stack já tomadas (NestJS + Next.js + PostgreSQL + Redis). Review de PRs para garantir aderência às camadas `/domain`, `/application`, `/infrastructure`, `/interfaces`. Design do algoritmo de disponibilidade.

---

## SQUAD BETA — Core Engineering (The Builders)

### Agent Senior Backend Engineer
**Stack do Projeto:** NestJS + TypeScript + Prisma + PostgreSQL + Redis (Upstash)
**Responsabilidades:**
- Implementar as camadas `/domain`, `/application`, `/infrastructure` e `/interfaces` no backend
- `CheckAvailabilityUseCase` — engine de disponibilidade (core feature)
- `CreateAppointmentUseCase` — fluxo atômico com Redis distributed lock
- Endpoints REST: `/appointments`, `/availability`, `/professionals`, `/services`
- Migrations Prisma versionadas

### Agent Senior Frontend Engineer
**Stack do Projeto:** Next.js 14 App Router + TypeScript + Tailwind CSS + shadcn/ui
**Responsabilidades:**
- Fluxo de agendamento público (Serviço → Profissional → Calendário → Confirmação)
- Painel do Barbeiro (agenda diária/semanal, bloqueio manual)
- Painel do Admin (gestão de serviços, equipe, visão geral)
- Componentes de calendário com slots visuais (disponível/bloqueado/selecionado)
- Integração com NextAuth.js v5

---

## SQUAD GAMMA — Quality & Assurance (The Guardians)

### Agent Senior SDET (QA)
**Responsabilidades no Projeto:**
- Testes unitários das camadas `/domain` e `/application` (Jest, sem banco ativo)
- Testes de integração para `CheckAvailabilityUseCase` e `CreateAppointmentUseCase`
- Testes E2E do fluxo de agendamento (Playwright)
- Validação de todos os cenários BDD definidos no `SPEC.md`
- Teste de concorrência: dois clientes tentando reservar o mesmo slot simultaneamente

---

## SQUAD DELTA — Platform & DevOps (The Enablers)

### Agent Senior DevOps/SRE
**Responsabilidades no Projeto:**
- `docker-compose.yml` para ambiente local (PostgreSQL + Redis + Backend + Frontend)
- GitHub Actions: lint → test → build → deploy (CI/CD)
- Deploy automático: Vercel (frontend) + Railway (backend + PostgreSQL + Redis)
- Variáveis de ambiente e secrets management
- Health checks e readiness probes

---

## FLUXO DE ESCALAÇÃO
```
Cliente (Du_barber) → Orquestrador ATHOS
  → Squad Omega (proposta/comercial)
  → Squad Alpha (spec/arquitetura) ← aprovação du_barber
  → Squad Beta (implementação)
  → Squad Gamma (validação)
  → Squad Delta (deploy)
  → Du_barber (entrega)
```

---

*Constituição registrada. Todos os agentes cientes de suas responsabilidades no projeto BarberFlow.*
