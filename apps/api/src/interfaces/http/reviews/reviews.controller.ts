import {
  Body, Controller, Get, Param, Post,
  UseGuards, Request, NotFoundException, ConflictException, BadRequestException,
  Query,
} from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { JwtAuthGuard } from '@interfaces/guards/jwt-auth.guard'
import { CreateReviewUseCase } from '@application/reviews/CreateReviewUseCase'
import { GetProfessionalReviewsUseCase } from '@application/reviews/GetProfessionalReviewsUseCase'
import {
  AppointmentNotFoundError,
  AppointmentNotCompletedError,
  ReviewAlreadyExistsError,
} from '@domain/errors'

class CreateReviewDto {
  @IsString() appointmentId!: string
  @IsInt() @Min(1) @Max(5) rating!: number
  @IsOptional() @IsString() comment?: string
}

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly createReview: CreateReviewUseCase,
    private readonly getProfessionalReviews: GetProfessionalReviewsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar avaliação (público — após atendimento)' })
  async create(@Body() dto: CreateReviewDto) {
    try {
      return await this.createReview.execute(dto)
    } catch (err) {
      if (err instanceof AppointmentNotFoundError) throw new NotFoundException(err.message)
      if (err instanceof AppointmentNotCompletedError) throw new BadRequestException(err.message)
      if (err instanceof ReviewAlreadyExistsError) throw new ConflictException(err.message)
      throw err
    }
  }

  @Get('professional/:professionalId')
  @ApiOperation({ summary: 'Listar avaliações de um profissional' })
  async list(
    @Param('professionalId') professionalId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.getProfessionalReviews.execute({ professionalId, tenantId })
  }
}
