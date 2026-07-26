import { IsDateString, IsOptional, IsString } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateManualBlockDto {
  @ApiProperty({ example: '2026-08-01T10:00:00.000Z' })
  @IsDateString()
  startsAt!: string

  @ApiProperty({ example: '2026-08-01T12:00:00.000Z' })
  @IsDateString()
  endsAt!: string

  @ApiPropertyOptional({ example: 'Almoço especial' })
  @IsOptional()
  @IsString()
  reason?: string
}
