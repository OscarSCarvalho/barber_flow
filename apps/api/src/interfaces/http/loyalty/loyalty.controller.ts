import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '@interfaces/guards/jwt-auth.guard'
import { RolesGuard } from '@interfaces/guards/roles.guard'
import { Roles } from '@interfaces/guards/roles.decorator'
import { GetLoyaltyCardUseCase } from '@application/loyalty/GetLoyaltyCardUseCase'
import { PrismaLoyaltyCardRepository } from '@infrastructure/database/PrismaLoyaltyCardRepository'

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? ''

@ApiTags('loyalty')
@Controller('loyalty')
export class LoyaltyController {
  constructor(
    private readonly getLoyaltyCard: GetLoyaltyCardUseCase,
    private readonly loyaltyRepo: PrismaLoyaltyCardRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Consultar cartão fidelidade por telefone' })
  async get(
    @Query('phone') clientPhone: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.getLoyaltyCard.execute({ tenantId: tenantId || DEFAULT_TENANT_ID, clientPhone })
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os cartões de fidelidade (admin)' })
  async listAll(@Request() req: { user: { tenantId: string } }) {
    const cards = await this.loyaltyRepo.findAllByTenant(req.user.tenantId)
    return cards.map((c) => ({
      ...c,
      availableRewards: Math.floor(c.completedCuts / 10) - c.redeemedCuts,
      progressToNextReward: c.completedCuts % 10,
    }))
  }
}
