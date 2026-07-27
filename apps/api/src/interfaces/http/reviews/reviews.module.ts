import { Module } from '@nestjs/common'
import { ReviewsController } from './reviews.controller'
import { PrismaReviewRepository } from '@infrastructure/database/PrismaReviewRepository'
import { PrismaAppointmentRepository } from '@infrastructure/database/PrismaAppointmentRepository'
import { CreateReviewUseCase } from '@application/reviews/CreateReviewUseCase'
import { GetProfessionalReviewsUseCase } from '@application/reviews/GetProfessionalReviewsUseCase'

@Module({
  controllers: [ReviewsController],
  providers: [
    PrismaReviewRepository,
    PrismaAppointmentRepository,
    {
      provide: CreateReviewUseCase,
      useFactory: (appt: PrismaAppointmentRepository, review: PrismaReviewRepository) =>
        new CreateReviewUseCase(appt, review),
      inject: [PrismaAppointmentRepository, PrismaReviewRepository],
    },
    {
      provide: GetProfessionalReviewsUseCase,
      useFactory: (review: PrismaReviewRepository) => new GetProfessionalReviewsUseCase(review),
      inject: [PrismaReviewRepository],
    },
  ],
  exports: [PrismaReviewRepository],
})
export class ReviewsModule {}
