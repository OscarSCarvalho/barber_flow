import { Controller, Get, Query, Request, BadRequestException } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { SkipThrottle } from '@nestjs/throttler'
import { CheckAvailabilityUseCase } from '@application/availability/CheckAvailabilityUseCase'
import { GetAvailableProfessionalsUseCase } from '@application/availability/GetAvailableProfessionalsUseCase'
import { AvailabilityCacheService } from '@infrastructure/cache/availability-cache.service'
import { CheckAvailabilityDto, GetAvailableProfessionalsDto } from '@interfaces/dtos/availability.dto'
import { ServiceNotFoundError, ServiceInactiveError } from '@domain/errors'

@SkipThrottle()
@ApiTags('availability')
@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly checkAvailability: CheckAvailabilityUseCase,
    private readonly getAvailableProfessionals: GetAvailableProfessionalsUseCase,
    private readonly cache: AvailabilityCacheService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Verificar disponibilidade de horários de um profissional' })
  async check(@Query() dto: CheckAvailabilityDto) {
    const date = new Date(dto.date)
    if (isNaN(date.getTime())) throw new BadRequestException('Data inválida')

    const cached = await this.cache.get(dto.professionalId, dto.date, dto.serviceIds)
    if (cached) return { slots: cached, fromCache: true }

    try {
      const result = await this.checkAvailability.execute({
        professionalId: dto.professionalId,
        serviceIds: dto.serviceIds,
        date,
      })

      if (result.slots.length > 0) {
        await this.cache.set(dto.professionalId, dto.date, dto.serviceIds, result.slots)
      }

      return { ...result, fromCache: false }
    } catch (err) {
      if (err instanceof ServiceNotFoundError || err instanceof ServiceInactiveError) {
        throw new BadRequestException((err as Error).message)
      }
      throw err
    }
  }

  @Get('professionals')
  @ApiOperation({ summary: 'Listar profissionais com disponibilidade para os serviços e data informados' })
  async listAvailable(
    @Query() dto: GetAvailableProfessionalsDto,
    @Request() req: { user?: { tenantId: string } },
  ) {
    const tenantId = req.user?.tenantId ?? process.env.DEFAULT_TENANT_ID ?? ''
    const date = new Date(dto.date)
    if (isNaN(date.getTime())) throw new BadRequestException('Data inválida')

    const slotStartsAt = dto.slotStartsAt ? new Date(dto.slotStartsAt) : date

    return this.getAvailableProfessionals.execute({
      tenantId,
      serviceIds: dto.serviceIds,
      date,
      slotStartsAt,
    })
  }
}
