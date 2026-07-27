import { Injectable, Inject } from '@nestjs/common'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { ILoyaltyCardRepository } from '@domain/repositories/ILoyaltyCardRepository'
import { Appointment } from '@domain/entities/Appointment'
import { AppointmentNotFoundError } from '@domain/errors'

export interface CompleteAppointmentInput {
  appointmentId: string
}

export interface CompleteAppointmentOutput {
  appointment: Appointment
  loyaltyCard: { completedCuts: number; redeemedCuts: number; availableRewards: number } | null
}

const CUTS_PER_REWARD = 10

@Injectable()
export class CompleteAppointmentUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('ILoyaltyCardRepository')
    private readonly loyaltyCardRepository: ILoyaltyCardRepository,
  ) {}

  async execute(input: CompleteAppointmentInput): Promise<CompleteAppointmentOutput> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId)
    if (!appointment) throw new AppointmentNotFoundError(input.appointmentId)

    const completed = await this.appointmentRepository.updateStatus(input.appointmentId, 'COMPLETED')

    let loyaltyCard = null
    if (appointment.clientPhone) {
      const card = await this.loyaltyCardRepository.incrementCompleted(
        appointment.tenantId,
        appointment.clientPhone,
      )
      loyaltyCard = {
        completedCuts: card.completedCuts,
        redeemedCuts: card.redeemedCuts,
        availableRewards: Math.floor((card.completedCuts - card.redeemedCuts * CUTS_PER_REWARD) / CUTS_PER_REWARD),
      }
    }

    return { appointment: completed, loyaltyCard }
  }
}
