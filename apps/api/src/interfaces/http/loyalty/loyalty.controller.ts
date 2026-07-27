import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { GetLoyaltyCardUseCase } from '@application/loyalty/GetLoyaltyCardUseCase'

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? ''

@ApiTags('loyalty')
@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly getLoyaltyCard: GetLoyaltyCardUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Consultar cartão fidelidade por telefone' })
  async get(
    @Query('phone') clientPhone: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.getLoyaltyCard.execute({ tenantId: tenantId || DEFAULT_TENANT_ID, clientPhone })
  }
}
