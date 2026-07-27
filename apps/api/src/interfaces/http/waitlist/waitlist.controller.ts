import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString } from 'class-validator'
import { JoinWaitlistUseCase } from '@application/waitlist/JoinWaitlistUseCase'
import { ProfessionalNotFoundError } from '@domain/errors'
import { NotFoundException } from '@nestjs/common'

class JoinWaitlistDto {
  @IsString() professionalId!: string
  @IsString() clientName!: string
  @IsString() clientPhone!: string
  @IsArray() serviceIds!: string[]
  @IsOptional() @IsString() preferredDate?: string
}

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? ''

@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly joinWaitlist: JoinWaitlistUseCase) {}

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
}
