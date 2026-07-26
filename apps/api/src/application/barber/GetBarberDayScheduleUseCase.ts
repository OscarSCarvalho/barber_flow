import { Injectable, Inject } from '@nestjs/common'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { IManualBlockRepository } from '@domain/repositories/IManualBlockRepository'
import { IProfessionalRepository } from '@domain/repositories/IProfessionalRepository'
import { ProfessionalNotFoundError } from '@domain/errors'
import { Appointment } from '@domain/entities/Appointment'
import { ManualBlock } from '@domain/entities/ManualBlock'
import { startOfDay, endOfDay } from 'date-fns'

export interface GetBarberDayScheduleInput {
  userId: string
  date: Date
}

export interface GetBarberDayScheduleOutput {
  appointments: Appointment[]
  blocks: ManualBlock[]
}

@Injectable()
export class GetBarberDayScheduleUseCase {
  constructor(
    @Inject('IProfessionalRepository')
    private readonly professionalRepository: IProfessionalRepository,
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IManualBlockRepository')
    private readonly manualBlockRepository: IManualBlockRepository,
  ) {}

  async execute(input: GetBarberDayScheduleInput): Promise<GetBarberDayScheduleOutput> {
    const professional = await this.professionalRepository.findByUserId(input.userId)
    if (!professional) throw new ProfessionalNotFoundError(input.userId)

    const from = startOfDay(input.date)
    const to = endOfDay(input.date)

    const [appointments, blocks] = await Promise.all([
      this.appointmentRepository.findByProfessionalAndRange(professional.id, from, to),
      this.manualBlockRepository.findByProfessionalAndRange(professional.id, from, to),
    ])

    return { appointments, blocks }
  }
}
