import { IWorkScheduleRepository } from '@domain/repositories/IWorkScheduleRepository'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { WorkSchedule, UpsertWorkScheduleInput } from '@domain/entities/WorkSchedule'
import { ProfessionalNotFoundError, DomainError } from '@domain/errors'

export class SetWorkScheduleUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly workScheduleRepository: IWorkScheduleRepository,
  ) {}

  async execute(input: UpsertWorkScheduleInput): Promise<WorkSchedule> {
    const professional = await this.professionalRepository.findById(input.professionalId)
    if (!professional) throw new ProfessionalNotFoundError(input.professionalId)

    if (input.startTime >= input.endTime) {
      throw new DomainError('Horário de início deve ser anterior ao horário de fim', 'INVALID_SCHEDULE_TIME')
    }

    if (input.breakStart && input.breakEnd) {
      if (input.breakStart >= input.breakEnd) {
        throw new DomainError('Início do almoço deve ser anterior ao fim', 'INVALID_BREAK_TIME')
      }
      if (input.breakStart < input.startTime || input.breakEnd > input.endTime) {
        throw new DomainError('Horário de almoço deve estar dentro da jornada', 'BREAK_OUTSIDE_SCHEDULE')
      }
    }

    return this.workScheduleRepository.upsert(input)
  }
}
