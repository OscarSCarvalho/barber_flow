import { Body, Controller, Get, Patch, Param, Post, Query, UseGuards, Request, NotFoundException } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator'
import { JwtAuthGuard } from '@interfaces/guards/jwt-auth.guard'
import { RolesGuard } from '@interfaces/guards/roles.guard'
import { Roles } from '@interfaces/guards/roles.decorator'
import { JoinWaitlistUseCase } from '@application/waitlist/JoinWaitlistUseCase'
import { PrismaWaitlistRepository } from '@infrastructure/database/PrismaWaitlistRepository'
import { ProfessionalNotFoundError } from '@domain/errors'
import { WaitlistStatus } from '@domain/entities/WaitlistEntry'

class JoinWaitlistDto {
  @IsString() professionalId!: string
  @IsString() clientName!: string
  @IsString() clientPhone!: string
  @IsArray() serviceIds!: string[]
  @IsOptional() @IsString() preferredDate?: string
}

class UpdateWaitlistStatusDto {
  @IsEnum(['WAITING', 'NOTIFIED', 'CONFIRMED', 'EXPIRED'])
  status!: WaitlistStatus
}

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? ''

@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(
    private readonly joinWaitlist: JoinWaitlistUseCase,
    private readonly waitlistRepo: PrismaWaitlistRepository,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Entrar na lista de espera' })
  async join(@Body() dto: JoinWaitlistDto) {
    try {
      return await this.joinWaitlist.execute({
        tenantId: DEFAULT_TENANT_ID,
        professionalId: dto.professionalId,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone,
        serviceIds: dto.serviceIds,
        preferredDate: dto.preferredDate ? new Date(dto.preferredDate) : undefined,
      })
    } catch (err) {
      if (err instanceof ProfessionalNotFoundError) throw new NotFoundException(err.message)
      throw err
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar lista de espera (admin)' })
  async list(
    @Request() req: { user: { tenantId: string } },
    @Query('status') status?: WaitlistStatus,
  ) {
    return this.waitlistRepo.findAllByTenant(req.user.tenantId, status)
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status de entrada na waitlist (admin)' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateWaitlistStatusDto) {
    const notifiedAt = dto.status === 'NOTIFIED' ? new Date() : undefined
    return this.waitlistRepo.updateStatus(id, dto.status, notifiedAt)
  }
}
