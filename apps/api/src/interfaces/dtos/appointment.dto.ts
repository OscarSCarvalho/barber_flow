import {
  IsString, IsArray, ArrayNotEmpty, IsDateString,
  MinLength, Matches, IsOptional, IsEnum,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateAppointmentDto {
  @ApiProperty({ example: 'prof-uuid' })
  @IsString()
  professionalId!: string

  @ApiProperty({ example: ['svc-uuid-1'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  serviceIds!: string[]

  @ApiProperty({ example: '2026-08-01T14:00:00.000Z' })
  @IsDateString()
  startsAt!: string

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  clientName!: string

  @ApiProperty({ example: '11999998888' })
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone deve ter 10 ou 11 dígitos (apenas números)' })
  clientPhone!: string

  @ApiPropertyOptional({ example: 'client-uuid' })
  @IsString()
  @IsOptional()
  clientId?: string
}

export class CancelAppointmentDto {
  @ApiPropertyOptional({ example: 'Cliente solicitou cancelamento' })
  @IsString()
  @IsOptional()
  reason?: string
}

export class ListAppointmentsDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  professionalId?: string

  @ApiPropertyOptional({ example: '2026-08-01' })
  @IsDateString()
  @IsOptional()
  dateFrom?: string

  @ApiPropertyOptional({ example: '2026-08-31' })
  @IsDateString()
  @IsOptional()
  dateTo?: string

  @ApiPropertyOptional({ enum: ['PENDING','CONFIRMED','CANCELLED','NO_SHOW'] })
  @IsEnum(['PENDING','CONFIRMED','CANCELLED','NO_SHOW'])
  @IsOptional()
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'NO_SHOW'
}
