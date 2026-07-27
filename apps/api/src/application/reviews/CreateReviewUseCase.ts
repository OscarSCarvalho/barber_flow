import { Injectable, Inject } from '@nestjs/common'
import { IAppointmentRepository } from '@domain/repositories/IAppointmentRepository'
import { IReviewRepository } from '@domain/repositories/IReviewRepository'
import { Review } from '@domain/entities/Review'
import {
  AppointmentNotFoundError,
  AppointmentNotCompletedError,
  ReviewAlreadyExistsError,
} from '@domain/errors'

export interface CreateReviewInput {
  appointmentId: string
  rating: number
  comment?: string
}

@Injectable()
export class CreateReviewUseCase {
  constructor(
    @Inject('IAppointmentRepository')
    private readonly appointmentRepository: IAppointmentRepository,
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(input: CreateReviewInput): Promise<Review> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId)
    if (!appointment) throw new AppointmentNotFoundError(input.appointmentId)
    if (appointment.status !== 'COMPLETED') throw new AppointmentNotCompletedError()

    const existing = await this.reviewRepository.findByAppointmentId(input.appointmentId)
    if (existing) throw new ReviewAlreadyExistsError()

    return this.reviewRepository.create({
      tenantId: appointment.tenantId,
      appointmentId: input.appointmentId,
      professionalId: appointment.professionalId,
      clientName: appointment.clientName,
      rating: input.rating,
      comment: input.comment,
    })
  }
}
