import { IsString, IsInt, IsPositive, Min, MinLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateServiceDto {
  @ApiProperty({ example: 'Corte' })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty({ example: 60, description: 'Duração em minutos' })
  @IsInt()
  @IsPositive()
  durationMinutes!: number

  @ApiProperty({ example: 4500, description: 'Preço em centavos (R$ 45,00 = 4500)' })
  @IsInt()
  @Min(0)
  priceInCents!: number
}

export class UpdateServiceDto {
  @ApiPropertyOptional({ example: 'Corte Degradê' })
  @IsString()
  @MinLength(2)
  @IsOptional()
  name?: string

  @ApiPropertyOptional({ example: 45 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  durationMinutes?: number

  @ApiPropertyOptional({ example: 5000 })
  @IsInt()
  @Min(0)
  @IsOptional()
  priceInCents?: number
}
