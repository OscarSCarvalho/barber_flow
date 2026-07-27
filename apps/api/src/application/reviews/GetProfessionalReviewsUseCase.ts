import { Injectable, Inject } from '@nestjs/common'
import { IReviewRepository } from '@domain/repositories/IReviewRepository'
import { Review } from '@domain/entities/Review'

export interface GetProfessionalReviewsInput {
  professionalId: string
  tenantId: string
}

export interface GetProfessionalReviewsOutput {
  reviews: Review[]
  averageRating: number
  totalCount: number
}

@Injectable()
export class GetProfessionalReviewsUseCase {
  constructor(
    @Inject('IReviewRepository')
    private readonly reviewRepository: IReviewRepository,
  ) {}

  async execute(input: GetProfessionalReviewsInput): Promise<GetProfessionalReviewsOutput> {
    const reviews = await this.reviewRepository.findByProfessional(input.professionalId, input.tenantId)
    const totalCount = reviews.length
    const averageRating = totalCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0

    return { reviews, averageRating: Math.round(averageRating * 10) / 10, totalCount }
  }
}
