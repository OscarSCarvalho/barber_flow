# SPEC.md — BarberFlow
**Fase 1 — Especificação BDD**
**Cliente:** Du_barber | **Projeto:** BarberFlow MVP
**Executado por:** Agent Product Manager Staff (Squad Alpha)
**Data:** 2026-07-26

---

## 1. OBJETIVO DO PRODUTO
Permitir que clientes de barbearias agendem horários online de forma autônoma, em tempo real, sem conflitos, através de uma interface fluída — eliminando o agendamento manual por WhatsApp e prevenindo double-booking.

---

## 2. PERSONAS & PERFIS DE ACESSO

| Persona | Acesso | Descrição |
|---|---|---|
| **Cliente** | Público (sem login obrigatório no MVP*) | Realiza agendamentos |
| **Barbeiro** | Autenticado (role: BARBER) | Visualiza e gerencia própria agenda |
| **Admin/Dono** | Autenticado (role: ADMIN) | Gerencia toda a barbearia |

*\*MVP: cliente pode agendar fornecendo nome + telefone, sem criar conta. Conta opcional.*

---

## 3. ÉPICOS E HISTÓRIAS DE USUÁRIO

### ÉPICO 1 — Catálogo de Serviços

**US-01:** Como cliente, quero visualizar os serviços disponíveis (nome, duração, preço) para escolher o que desejo contratar.

**US-02:** Como admin, quero cadastrar, editar e desativar serviços (nome, duração em minutos, preço em centavos) para manter o catálogo atualizado.

---

### ÉPICO 2 — Seleção de Profissional

**US-03:** Como cliente, quero escolher um profissional específico da barbearia para ser atendido por quem prefiro.

**US-04:** Como cliente, quero selecionar "Qualquer profissional disponível" para que o sistema me atribua automaticamente o primeiro barbeiro livre no horário escolhido.

---

### ÉPICO 3 — Engine de Disponibilidade (Core Feature)

**US-05:** Como cliente, quero ver apenas os horários disponíveis no calendário (sem precisar ligar para confirmar) para agendar com segurança.

**US-06:** Como sistema, devo calcular a disponibilidade real de um profissional cruzando: jornada de trabalho + horário de almoço + agendamentos existentes + duração dos serviços escolhidos.

---

### ÉPICO 4 — Fluxo de Agendamento

**US-07:** Como cliente, quero completar um agendamento em até 4 etapas (Serviço → Profissional → Data/Hora → Confirmação) para que o processo seja rápido e intuitivo.

**US-08:** Como cliente, quero receber uma confirmação visual (tela de sucesso) com os detalhes do meu agendamento (serviço, profissional, data, horário, duração e preço total).

---

### ÉPICO 5 — Painel do Barbeiro

**US-09:** Como barbeiro, quero visualizar minha agenda do dia em formato de lista e do dia/semana em formato de calendário para me organizar.

**US-10:** Como barbeiro, quero bloquear manualmente um intervalo de horário (motivo opcional) para que clientes não consigam agendar nesse período (ex: consulta médica, treinamento).

---

### ÉPICO 6 — Painel do Admin

**US-11:** Como admin, quero visualizar todos os agendamentos do dia/semana de todos os profissionais para ter visão geral da operação.

**US-12:** Como admin, quero cadastrar e editar perfis de barbeiros (nome, foto, bio, jornada de trabalho por dia da semana) para manter o time atualizado.

**US-13:** Como admin, quero cancelar qualquer agendamento com registro de motivo para lidar com imprevistos.

---

## 4. ESPECIFICAÇÕES BDD — CENÁRIOS DETALHADOS

### FEATURE: Cálculo de Disponibilidade

```gherkin
Feature: Disponibilidade de horários

  Background:
    Given existe o profissional "Carlos" com jornada 09:00–19:00
    And "Carlos" tem horário de almoço 12:00–13:00
    And o serviço "Corte" tem duração de 60 minutos
    And o serviço "Barba" tem duração de 30 minutos

  Scenario: Slot disponível dentro da jornada sem conflitos
    Given não há agendamentos para "Carlos" no dia 2026-08-01
    When o cliente consulta disponibilidade para "Corte" com "Carlos" em 2026-08-01
    Then o slot 09:00–10:00 deve aparecer como DISPONÍVEL

  Scenario: Slot bloqueado por agendamento existente
    Given "Carlos" tem agendamento confirmado das 10:00 às 11:00 em 2026-08-01
    When o cliente consulta disponibilidade para "Corte" com "Carlos" em 2026-08-01
    Then o slot 10:00–11:00 deve aparecer como BLOQUEADO
    And o slot 10:30–11:30 deve aparecer como BLOQUEADO (overlap parcial)

  Scenario: Slot bloqueado por horário de almoço
    When o cliente consulta disponibilidade para "Corte" com "Carlos" em 2026-08-01
    Then o slot 12:00–13:00 deve aparecer como BLOQUEADO
    And o slot 11:30–12:30 deve aparecer como BLOQUEADO (ultrapassa almoço)

  Scenario: Slot fora da jornada de trabalho
    When o cliente consulta disponibilidade para "Corte" com "Carlos" em 2026-08-01
    Then o slot 18:30–19:30 deve aparecer como BLOQUEADO (ultrapassa fim do expediente)
    And o slot 19:00–20:00 deve aparecer como BLOQUEADO

  Scenario: Serviço composto aumenta duração total
    When o cliente seleciona "Corte" (60min) + "Barba" (30min) = 90min
    And consulta disponibilidade para "Carlos" em 2026-08-01
    Then o slot 11:00–12:30 deve aparecer como BLOQUEADO (ultrapassa início do almoço)
    And o slot 17:30–19:00 deve aparecer como DISPONÍVEL (último slot válido)

  Scenario: Profissional não trabalha no dia
    Given "Carlos" não tem jornada cadastrada para domingo
    When o cliente consulta disponibilidade para "Corte" com "Carlos" em 2026-08-02 (domingo)
    Then nenhum slot deve ser retornado
    And a mensagem "Profissional não disponível nesta data" deve ser exibida
```

---

### FEATURE: Criação de Agendamento

```gherkin
Feature: Criação de agendamento

  Scenario: Agendamento criado com sucesso
    Given o slot 14:00 de "Carlos" está disponível em 2026-08-01
    When o cliente "João" envia dados válidos (nome, telefone, serviço, profissional, slot)
    Then um agendamento com status CONFIRMED é criado
    And a tela de confirmação exibe: profissional, serviço, data/hora, duração, preço total

  Scenario: Tentativa de agendamento em slot já ocupado (race condition)
    Given o slot 14:00 de "Carlos" está disponível
    When dois clientes tentam agendar simultaneamente o slot 14:00 de "Carlos"
    Then apenas um agendamento é criado com status CONFIRMED
    And o segundo cliente recebe erro 409 "Horário não disponível"

  Scenario: Agendamento com dados inválidos
    When o cliente envia telefone em formato inválido
    Then o sistema retorna erro 422 com campo "telefone" e mensagem descritiva
    And nenhum agendamento é criado

  Scenario: Agendamento com "Qualquer Profissional"
    Given "Carlos" está ocupado às 15:00
    And "Pedro" está disponível às 15:00
    When o cliente seleciona "Qualquer profissional" para "Corte" às 15:00
    Then o sistema atribui o agendamento a "Pedro"
```

---

### FEATURE: Bloqueio Manual pelo Barbeiro

```gherkin
Feature: Bloqueio manual de horário

  Scenario: Barbeiro bloqueia intervalo com sucesso
    Given "Carlos" está autenticado como BARBER
    When "Carlos" bloqueia 15:00–16:00 em 2026-08-01 com motivo "Treinamento"
    Then o bloco manual é salvo
    And o slot 15:00 aparece como BLOQUEADO para novos agendamentos

  Scenario: Bloqueio sobre agendamento existente é rejeitado
    Given "Carlos" tem agendamento confirmado das 15:00 às 16:00
    When "Carlos" tenta bloquear 14:30–15:30
    Then o sistema retorna erro 409 "Intervalo conflita com agendamento existente"
```

---

### FEATURE: Gestão Admin

```gherkin
Feature: Cadastro de serviço pelo Admin

  Scenario: Admin cadastra novo serviço
    Given usuário autenticado com role ADMIN
    When envia POST /services com { nome: "Pezinho", duração: 15, preço: 1500 }
    Then serviço é criado com isActive: true
    And aparece disponível no catálogo público

  Scenario: Admin desativa serviço sem deletar histórico
    When admin desativa o serviço "Pezinho"
    Then isActive é false
    And o serviço não aparece no catálogo público
    And agendamentos históricos que usavam "Pezinho" continuam visíveis nos relatórios
```

---

## 5. CASOS DE BORDA MAPEADOS

| # | Caso de Borda | Tratamento |
|---|---|---|
| B-01 | Dois usuários reservam o mesmo slot ao mesmo tempo | Redis distributed lock (TTL 10s) + transação PostgreSQL |
| B-02 | Serviço é desativado após agendamento confirmado | Agendamento mantido; serviço marcado como deletado logicamente |
| B-03 | Admin altera jornada do barbeiro com agendamentos futuros | Alerta visual; agendamentos existentes mantidos; novos slots recalculados |
| B-04 | Cliente tenta agendar em data passada | Validação no backend: retorna 422 |
| B-05 | Barbearia não tem nenhum barbeiro cadastrado | Catálogo vazio exibe mensagem "Em breve" |
| B-06 | Serviços com durações não múltiplas de 30min | Engine usa granularidade de 15min como fallback |
| B-07 | Profissional sem jornada no dia solicitado | Nenhum slot retornado; mensagem clara ao cliente |
| B-08 | Cancelamento com menos de 1h de antecedência | MVP: permite. Pós-MVP: política configurável |

---

## 6. REQUISITOS NÃO-FUNCIONAIS

| Requisito | Meta MVP |
|---|---|
| Tempo de resposta da engine de disponibilidade | < 500ms |
| Prevenção de double-booking | 100% (via lock + transação) |
| Disponibilidade do serviço | 99% (Railway SLA) |
| LGPD — dados de clientes | Coleta mínima (nome + telefone no MVP) |
| Acessibilidade | WCAG 2.1 AA nos componentes de calendário |
| Compatibilidade de browser | Chrome 120+, Safari 17+, Firefox 120+ |

---

*Fase 1 concluída. SPEC.md aprovada internamente. PROPOSAL.md autorizada.*
