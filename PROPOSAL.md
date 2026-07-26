# PROPOSAL.md — BarberFlow
**Fase 2 — Proposta Comercial**
**Cliente:** Du_barber | **Projeto:** BarberFlow MVP
**Executado por:** Agent Account Executive Staff (Squad Omega)
**Data:** 2026-07-26

---

## 1. RESUMO EXECUTIVO

O BarberFlow é um SaaS de agendamento online para barbearias com engine de disponibilidade em tempo real, prevenção automática de double-booking e três perfis de usuário (cliente, barbeiro, admin). O MVP entrega o produto funcional com 1 barbearia (tenant piloto) em **10 semanas de desenvolvimento**.

---

## 2. ESCOPO DO MVP

### Incluído
- Fluxo público de agendamento (4 etapas)
- Engine de disponibilidade em tempo real
- Prevenção de double-booking (Redis + PostgreSQL)
- Painel do Barbeiro (agenda + bloqueio manual)
- Painel do Admin (gestão de serviços, equipe, agendamentos)
- Autenticação JWT com 3 roles (ADMIN, BARBER, CLIENT)
- API REST documentada (Swagger)
- Deploy em produção (Vercel + Railway)
- Docker Compose para desenvolvimento local
- CI/CD (GitHub Actions)
- Testes unitários e de integração
- 30 dias de suporte pós-deploy

### Não Incluído no MVP (Fases Futuras)
- Notificações WhatsApp/Email
- Pagamento online
- Multi-tenant (múltiplas barbearias)
- App Mobile
- Relatórios financeiros

---

## 3. ESTIMATIVA DE HORAS

### 3.1 Artefatos e Planejamento
| Atividade | Horas |
|---|---|
| Fase 0 — CONTEXT.md (Análise + Stack) | 4h |
| Fase 1 — SPEC.md (BDD + Casos de Borda) | 6h |
| Fase 2 — PROPOSAL.md | 2h |
| Fase 3 — PLAN.md (Quebra técnica em tarefas) | 4h |
| **Subtotal Artefatos** | **16h** |

### 3.2 Implementação (Squad Beta)
| Sprint | Entregável | Horas Backend | Horas Frontend | Total |
|---|---|---|---|---|
| 0 | Setup monorepo, Docker, CI/CD, schema Prisma | 12h | 4h | 16h |
| 1 | Auth (login, registro, RBAC, sessão) | 12h | 8h | 20h |
| 2 | Domínio: Serviços, Profissionais, Jornadas (CRUD) | 16h | 12h | 28h |
| 3 | Engine de Disponibilidade (Core Feature) | 20h | 8h | 28h |
| 4 | Fluxo de Agendamento (booking + confirmação) | 16h | 16h | 32h |
| 5 | Painel do Barbeiro (agenda + bloqueio manual) | 8h | 16h | 24h |
| 6 | Painel do Admin (visão geral + gestão) | 8h | 16h | 24h |
| **Subtotal Implementação** | **92h** | **80h** | **172h** |

### 3.3 QA e DevOps (Squads Gamma + Delta)
| Atividade | Horas |
|---|---|
| Testes unitários (domain/application) | 16h |
| Testes de integração (engine + booking) | 12h |
| Testes E2E — fluxo de agendamento (Playwright) | 8h |
| Deploy + configuração de infra Railway/Vercel | 8h |
| **Subtotal QA + DevOps** | **44h** |

### 3.4 TOTAL GERAL
| Categoria | Horas |
|---|---|
| Artefatos e Planejamento | 16h |
| Implementação (Backend + Frontend) | 172h |
| QA e DevOps | 44h |
| **TOTAL** | **232h** |

---

## 4. INVESTIMENTO

### 4.1 Desenvolvimento
| Item | Horas | Taxa Hora | Valor |
|---|---|---|---|
| Artefatos + Planejamento | 16h | R$ 200/h | R$ 3.200 |
| Backend Senior (NestJS) | 92h | R$ 280/h | R$ 25.760 |
| Frontend Senior (Next.js) | 80h | R$ 260/h | R$ 20.800 |
| QA Senior (Jest + Playwright) | 28h | R$ 240/h | R$ 6.720 |
| DevOps/SRE | 16h | R$ 260/h | R$ 4.160 |
| **Total Desenvolvimento** | **232h** | — | **R$ 60.640** |

### 4.2 Infraestrutura (Mensal — Pós-Deploy)
| Serviço | Plano | Custo/mês |
|---|---|---|
| Vercel (Frontend) | Pro | R$ 100 |
| Railway (Backend + PostgreSQL) | Starter | R$ 130 |
| Upstash Redis | Pay-as-you-go (estimado) | R$ 30 |
| GitHub Actions (CI/CD) | Free tier | R$ 0 |
| **Total Infra Mensal** | — | **R$ 260/mês** |

### 4.3 Modelo de Preço Sugerido para o SaaS (Pós-MVP)
| Plano | Preço Sugerido | Target |
|---|---|---|
| **Starter** (1 barbeiro, até 100 agendamentos/mês) | R$ 49/mês | Freelancers |
| **Pro** (até 5 barbeiros, ilimitado) | R$ 149/mês | Barbearias pequenas |
| **Business** (barbeiros ilimitados + white-label) | R$ 399/mês | Redes |

**Break-even estimado:** 3 clientes no plano Pro já cobrem os custos de infra. Com 10 clientes Pro = R$ 1.490/mês de receita recorrente.

---

## 5. CRONOGRAMA DE ENTREGAS

| Marco | Prazo (semanas após aprovação) | Entregável |
|---|---|---|
| M0 | Semana 1 | Setup completo + CI/CD rodando |
| M1 | Semana 2 | Auth funcionando + schema de banco |
| M2 | Semana 4 | CRUD de serviços e profissionais |
| M3 | Semana 6 | Engine de disponibilidade (demo funcional) |
| M4 | Semana 8 | Fluxo completo de agendamento (beta) |
| M5 | Semana 9 | Painéis do Barbeiro e Admin |
| M6 | Semana 10 | Deploy produção + testes E2E + handoff |

**Prazo Total:** 10 semanas a partir da aprovação desta proposta.

---

## 6. MODELO DE PAGAMENTO SUGERIDO

| Fase | Percentual | Valor | Gatilho |
|---|---|---|---|
| Kickoff | 30% | R$ 18.192 | Assinatura do contrato |
| Marco M3 | 40% | R$ 24.256 | Engine de disponibilidade aprovada |
| Entrega Final | 30% | R$ 18.192 | Deploy em produção aprovado |
| **Total** | 100% | **R$ 60.640** | — |

---

## 7. CONDIÇÕES GERAIS
- Suporte pós-deploy: 30 dias inclusos (correção de bugs críticos)
- Código-fonte entregue via repositório GitHub (cliente como owner)
- Reuniões de alinhamento: semanais (30min) em cada marco
- Ajustes de escopo durante o desenvolvimento: avaliados e orçados separadamente
- Linguagem de contrato: Português Brasileiro
- Foro: São Paulo/SP

---

## 8. PRÓXIMO PASSO
Após aprovação desta proposta, o Agent Software Architect (Squad Alpha) inicia a **Fase 3 — PLAN.md** com a quebra técnica completa em tarefas atômicas mapeadas para Clean Architecture.

> **⚠️ PONTO DE PARADA ATHOS:** O desenvolvimento (Fase 4) só é iniciado após a aprovação formal desta PROPOSAL.md pelo cliente Du_barber.

---

*Proposta válida por 15 dias. Elaborada pela Squad Omega — ATHOS v5.*
