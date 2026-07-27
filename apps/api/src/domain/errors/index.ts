export class DomainError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class UserNotFoundError extends DomainError {
  constructor(identifier: string) {
    super(`Usuário não encontrado: ${identifier}`, 'USER_NOT_FOUND')
  }
}

export class EmailAlreadyInUseError extends DomainError {
  constructor(email: string) {
    super(`E-mail já em uso: ${email}`, 'EMAIL_ALREADY_IN_USE')
  }
}

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('Credenciais inválidas', 'INVALID_CREDENTIALS')
  }
}

export class ServiceNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Serviço não encontrado: ${id}`, 'SERVICE_NOT_FOUND')
  }
}

export class ServiceInactiveError extends DomainError {
  constructor(id: string) {
    super(`Serviço inativo: ${id}`, 'SERVICE_INACTIVE')
  }
}

export class ProfessionalNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Profissional não encontrado: ${id}`, 'PROFESSIONAL_NOT_FOUND')
  }
}

export class SlotUnavailableError extends DomainError {
  constructor(startsAt: Date) {
    super(`Horário não disponível: ${startsAt.toISOString()}`, 'SLOT_UNAVAILABLE')
  }
}

export class AppointmentConflictError extends DomainError {
  constructor() {
    super('Conflito de agendamento: horário já ocupado', 'APPOINTMENT_CONFLICT')
  }
}

export class PastDateError extends DomainError {
  constructor() {
    super('Não é possível agendar em datas passadas', 'PAST_DATE')
  }
}

export class ManualBlockConflictError extends DomainError {
  constructor() {
    super('Bloqueio conflita com agendamento existente', 'MANUAL_BLOCK_CONFLICT')
  }
}

export class ManualBlockNotFoundError extends DomainError {
  constructor() {
    super('Bloqueio não encontrado', 'MANUAL_BLOCK_NOT_FOUND')
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super('Acesso não autorizado', 'UNAUTHORIZED')
  }
}

export class AppointmentNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Agendamento não encontrado: ${id}`, 'APPOINTMENT_NOT_FOUND')
  }
}

export class AppointmentNotCompletedError extends DomainError {
  constructor() {
    super('Avaliação só pode ser feita após a conclusão do serviço', 'APPOINTMENT_NOT_COMPLETED')
  }
}

export class ReviewAlreadyExistsError extends DomainError {
  constructor() {
    super('Este agendamento já foi avaliado', 'REVIEW_ALREADY_EXISTS')
  }
}

export class WaitlistEntryNotFoundError extends DomainError {
  constructor() {
    super('Entrada na lista de espera não encontrada', 'WAITLIST_ENTRY_NOT_FOUND')
  }
}
