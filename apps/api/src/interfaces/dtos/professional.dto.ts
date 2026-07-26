import { IsString, IsEmail, MinLength, IsOptional, IsUrl, IsEnum, IsBoolean } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DayOfWeek } from '@domain/entities/WorkSchedule'

export class CreateProfessionalDto {
  @ApiProperty({ example: 'Carlos Oliveira' })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty({ example: 'carlos@dubarber.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'senha123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string

  @ApiPropertyOptional({ example: 'Especialista em cortes clássicos.' })
  @IsString()
  @IsOptional()
  bio?: string

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string
}

export class UpdateProfessionalDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bio?: string

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}

export class UpsertWorkScheduleDto {
  @ApiProperty({ enum: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'] })
  @IsEnum(['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'])
  dayOfWeek!: DayOfWeek

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime!: string

  @ApiProperty({ example: '19:00' })
  @IsString()
  endTime!: string

  @ApiPropertyOptional({ example: '12:00' })
  @IsString()
  @IsOptional()
  breakStart?: string

  @ApiPropertyOptional({ example: '13:00' })
  @IsString()
  @IsOptional()
  breakEnd?: string
}
