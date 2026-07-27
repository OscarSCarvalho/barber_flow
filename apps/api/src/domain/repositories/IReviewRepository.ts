import { Review, CreateReviewInput } from '../entities/Review'

export interface IReviewRepository {
  findByAppointmentId(appointmentId: string): Promise<Review | null>
  findByProfessional(professionalId: string, tenantId: string): Promise<Review[]>
  create(input: CreateReviewInput): Promise<Review>
}
