import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PrismaUserRepository } from '@infrastructure/database/PrismaUserRepository'
import { JwtStrategy } from '@infrastructure/auth/jwt.strategy'
import { RegisterUserUseCase } from '@application/auth/RegisterUserUseCase'
import { LoginUseCase } from '@application/auth/LoginUseCase'

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '15m') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaUserRepository,
    {
      provide: RegisterUserUseCase,
      useFactory: (repo: PrismaUserRepository) => new RegisterUserUseCase(repo),
      inject: [PrismaUserRepository],
    },
    {
      provide: LoginUseCase,
      useFactory: (repo: PrismaUserRepository) => new LoginUseCase(repo),
      inject: [PrismaUserRepository],
    },
  ],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
