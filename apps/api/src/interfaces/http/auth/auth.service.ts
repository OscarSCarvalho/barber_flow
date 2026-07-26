import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { RegisterUserUseCase } from '@application/auth/RegisterUserUseCase'
import { LoginUseCase } from '@application/auth/LoginUseCase'
import { RegisterDto, LoginDto } from '@interfaces/dtos/auth.dto'
import { EmailAlreadyInUseError, InvalidCredentialsError } from '@domain/errors'

@Injectable()
export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    try {
      const user = await this.registerUseCase.execute(dto)
      return this.buildTokens(user.id, user.email, user.role, user.tenantId)
    } catch (err) {
      if (err instanceof EmailAlreadyInUseError) throw new ConflictException(err.message)
      throw err
    }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.loginUseCase.execute(dto)
      return this.buildTokens(user.id, user.email, user.role, user.tenantId)
    } catch (err) {
      if (err instanceof InvalidCredentialsError) throw new UnauthorizedException(err.message)
      throw err
    }
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      })
      return this.buildTokens(payload.sub, payload.email, payload.role, payload.tenantId)
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }
  }

  private buildTokens(userId: string, email: string, role: string, tenantId: string) {
    const payload = { sub: userId, email, role, tenantId }

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    })

    return { accessToken, refreshToken, role, userId }
  }
}
