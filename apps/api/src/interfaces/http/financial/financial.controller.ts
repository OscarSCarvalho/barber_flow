import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '@interfaces/guards/jwt-auth.guard'
import { RolesGuard } from '@interfaces/guards/roles.guard'
import { Roles } from '@interfaces/guards/roles.decorator'
import { GetFinancialSummaryUseCase } from '@application/financial/GetFinancialSummaryUseCase'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'

@ApiTags('financial')
@Controller('financial')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinancialController {
  constructor(
    private readonly getFinancialSummary: GetFinancialSummaryUseCase,
    private readonly professionalRepo: PrismaProfessionalRepository,
  ) {}

  @Get('summary')
  @Roles('ADMIN', 'BARBER')
  @ApiOperation({ summary: 'Resumo financeiro do período' })
  async summary(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('professionalId') professionalId: string | undefined,
    @Request() req: { user: { tenantId: string; role: string; id: string } },
  ) {
    let profId = professionalId

    if (req.user.role === 'BARBER') {
      const professional = await this.professionalRepo.findByUserId(req.user.id)
      profId = professional?.id
    }

    const dateFrom = from ? new Date(from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const dateTo = to ? new Date(to) : new Date()

    return this.getFinancialSummary.execute({
      tenantId: req.user.tenantId,
      from: dateFrom,
      to: dateTo,
      professionalId: profId,
    })
  }
}
