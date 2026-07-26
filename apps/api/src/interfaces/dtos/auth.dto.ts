import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class RegisterDto {
  @ApiProperty({ example: 'tenant-uuid' })
  @IsString()
  tenantId!: string

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'senha123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string

  @ApiPropertyOptional({ example: '11999998888' })
  @IsString()
  @IsOptional()
  phone?: string
}

export class LoginDto {
  @ApiProperty({ example: 'tenant-uuid' })
  @IsString()
  tenantId!: string

  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  email!: string

  @ApiProperty({ example: 'senha123' })
  @IsString()
  password!: string
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string
}
