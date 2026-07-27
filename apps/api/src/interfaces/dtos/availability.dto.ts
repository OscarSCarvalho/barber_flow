import { IsString, IsDateString, IsArray, ArrayNotEmpty, IsOptional } from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CheckAvailabilityDto {
  @ApiProperty({ example: 'prof-uuid' })
  @IsString()
  professionalId!: string

  @ApiProperty({ example: ['svc-uuid-1', 'svc-uuid-2'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  serviceIds!: string[]

  @ApiProperty({ example: '2026-08-01', description: 'Data no formato YYYY-MM-DD' })
  @IsDateString()
  date!: string
}

export class GetAvailableProfessionalsDto {
  @ApiProperty({ example: ['svc-uuid-1'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  serviceIds!: string[]

  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  date!: string

  @ApiPropertyOptional({ example: '2026-08-01T14:00:00.000Z', description: 'Filtrar profissionais disponíveis neste slot específico' })
  @IsOptional()
  @IsDateString()
  slotStartsAt?: string
}
