# VALIDATE.md — BarberFlow Hardening Checklist

**Responsável:** Squad Gamma (SDET) + Squad Delta (DevOps)  
**Referência:** SPEC.md, OWASP Top 10 2021

---

## 1. Rate Limiting

| Endpoint | Limite | Implementado |
|---|---|---|
| `POST /auth/login` | 5 req/60s por IP | ✅ `@Throttle({ default: { limit: 5, ttl: 60_000 } })` |
| `POST /auth/register` | 3 req/60s por IP | ✅ `@Throttle({ default: { limit: 3, ttl: 60_000 } })` |
| `POST /appointments` | 10 req/60s por IP | ✅ `@Throttle({ default: { limit: 10, ttl: 60_000 } })` |
| `GET /availability/*` | Sem limite | ✅ `@SkipThrottle()` no controller |
| Demais rotas | 100 req/60s por IP | ✅ `APP_GUARD: ThrottlerGuard` global |

---

## 2. Autenticação e Autorização

| Controle | Implementado |
|---|---|
| JWT assinado com `JWT_SECRET` (HS256) | ✅ `JwtStrategy` |
| Token expira em `JWT_EXPIRES_IN` (padrão 15min) | ✅ |
| Rotas admin protegidas por `RolesGuard` + `@Roles('ADMIN')` | ✅ |
| Rotas barbeiro protegidas por `RolesGuard` + `@Roles('BARBER','ADMIN')` | ✅ |
| `TenantGuard` — valida presença de `tenantId` em requisições autenticadas | ✅ |
| Middleware Next.js protege prefixos `/admin/*` e `/barbeiro/*` | ✅ |

---

## 3. Validação de Entrada (OWASP A03 — Injection)

| Controle | Implementado |
|---|---|
| `ValidationPipe` com `whitelist: true, forbidNonWhitelisted: true` | ✅ |
| Nenhuma query SQL raw nos repositórios | ✅ (grep zerou `$queryRaw/$executeRaw`) |
| Prisma ORM usa queries parametrizadas | ✅ |
| Senhas hasheadas com `bcrypt` (rounds=10) | ✅ |
| Telefone validado por regex `^\d{10,11}$` | ✅ |

---

## 4. Headers de Segurança (OWASP A05 — Misconfiguration)

| Header | Implementado |
|---|---|
| `helmet()` ativo com defaults | ✅ |
| CSP restritiva em `NODE_ENV=production` | ✅ |
| `X-Frame-Options: DENY` | ✅ (via helmet) |
| `X-Content-Type-Options: nosniff` | ✅ (via helmet) |
| CORS restrito ao `FRONTEND_URL` env var | ✅ |
| `credentials: true` no CORS | ✅ |

---

## 5. Tratamento de Erros (OWASP A09 — Logging)

| Controle | Implementado |
|---|---|
| `GlobalExceptionFilter` captura todos os erros | ✅ |
| Erros 5xx logados com stack trace pelo `Logger` | ✅ |
| Erros 4xx logados como warning (sem stack) | ✅ |
| Stack trace nunca exposto no response body | ✅ |
| Response de erro normalizado `{ statusCode, message, code?, timestamp, path }` | ✅ |

---

## 6. Logging Estruturado

| Controle | Implementado |
|---|---|
| `LoggingInterceptor` loga método, path, status e `ms` de cada request | ✅ |
| `console.log` não usado em nenhum módulo de negócio | ✅ (grep zerou) |
| Logs via `Logger` do NestJS (stdout para Railway capturar) | ✅ |

---

## 7. Isolamento de Tenant (Multi-Tenant Safety)

| Controle | Implementado |
|---|---|
| `tenantId` extraído exclusivamente do JWT (nunca do body/query) | ✅ |
| Todas as queries de domínio filtradas por `tenantId` | ✅ |
| `TenantGuard` rejeita JWT sem `tenantId` | ✅ |
| `DEFAULT_TENANT_ID` usado apenas em rotas públicas documentadas | ✅ (booking público) |

---

## 8. Prevenção de Double-Booking (Regra de Negócio Crítica)

| Controle | Implementado |
|---|---|
| Redis distributed lock (`SET key 1 PX ttl NX`) | ✅ |
| Verificação de conflito no banco após lock | ✅ |
| Lock sempre liberado no `finally` | ✅ |
| Teste unitário simula race condition | ✅ `CreateAppointmentUseCase.spec.ts` |

---

---

## 9. Mobile / PWA

| Controle | Implementado |
|---|---|
| `manifest.json` com `display: standalone`, `start_url: /agendar`, ícones 192px/512px | ✅ |
| `appleWebApp: { statusBarStyle: 'black' }` — status bar não sobrepõe conteúdo | ✅ |
| `Viewport` export separado conforme API Next.js 14 | ✅ |
| Layout `height: 100dvh` + `overflow-y-auto` no `<main>` — scroll interno (padrão app nativo) | ✅ |
| `min-h-0` no flex child para habilitar `overflow-y-auto` | ✅ |
| Scroll automático para slot grid ao selecionar data | ✅ `AvailabilityCalendar.tsx` |
| Scroll para topo ao mudar de step no wizard | ✅ `BookingWizard.tsx` useEffect |
| Tamanho mínimo de toque 44px nos botões do calendário (Apple HIG) | ✅ `WeekStrip.tsx` |
| Nomes de dias com letra única (`EEEEE`) para não sobrepor em 7 colunas | ✅ |
| Resumo de confirmação em grid 2×2 no mobile (reduz altura) | ✅ `BookingConfirmation.tsx` |

---

## 10. Rede / CORS (Desenvolvimento)

| Controle | Implementado |
|---|---|
| `NODE_ENV !== production` → `origin: true` (aceita IP da LAN para testes mobile) | ✅ `main.ts` |
| `NODE_ENV === production` → `origin: FRONTEND_URL` (restritivo) | ✅ |
| Proxy Next.js rewrites `/api/v1/*` → `http://localhost:3001/api/v1/*` | ✅ `next.config.mjs` |
| Browser usa URL relativa `/api/v1/...` (sem `localhost` hardcoded no bundle) | ✅ `api.ts`, `use-availability.ts` |
| SSR usa `API_INTERNAL_URL` (variável de servidor, não exposta ao client) | ✅ |

---

## 11. Bugs Críticos Corrigidos

| Bug | Arquivo | Fix |
|---|---|---|
| Login ADMIN redirecionava para agenda do barbeiro | `login/page.tsx` | `getSession()` pós-login + check de `role` |
| Horários de segunda-feira sempre bloqueados (UTC vs local) | `availability.controller.ts` | `parseDateLocal()` → `new Date(y, m-1, d)` |
| Horários não carregavam no mobile (`localhost` no bundle JS) | `use-availability.ts` | URL relativa `/api/v1/...` via proxy |
| CORS bloqueava celular na LAN | `main.ts` | `origin: true` em dev |
| WeekStrip sobrepondo texto em mobile | `WeekStrip.tsx` | `EEEEE` (1 letra) + `min-h-[44px]` |
| Campos de formulário fora da tela no mobile | `BookingConfirmation.tsx` | Grid 2×2 compacto + `flex-col gap-3` |

---

## Próximos passos (pré-deploy)

- [ ] Deploy API → Railway (configurar `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `NODE_ENV=production`)
- [ ] Deploy Web → Vercel (configurar `API_INTERNAL_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`)
- [ ] Configurar `FRONTEND_URL` na API apontando para o domínio Vercel
- [ ] Testar PWA em produção (HTTPS obrigatório para "Add to Home Screen" no iOS)
- [ ] Gerar seed de dados demo para ambiente de produção
- [ ] Handoff e treinamento do cliente Du
