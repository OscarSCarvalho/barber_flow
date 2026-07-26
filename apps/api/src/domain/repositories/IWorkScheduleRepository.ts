import { WorkSchedule, DayOfWeek, UpsertWorkScheduleInput } from '../entities/WorkSchedule'

export interface IWorkScheduleRepository {
  findByProfessional(professionalId: string): Promise<WorkSchedule[]>
  findByProfessionalAndDay(professionalId: string, dayOfWeek: DayOfWeek): Promise<WorkSchedule | null>
  upsert(input: UpsertWorkScheduleInput): Promise<WorkSchedule>
}
