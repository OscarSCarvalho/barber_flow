import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

/**
 * Ensures that authenticated requests carry a tenantId in the JWT payload.
 * Skipped on public routes (no JwtAuthGuard → no req.user).
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest()
    if (!req.user) return true

    if (!req.user.tenantId) {
      throw new ForbiddenException('Token inválido: tenantId ausente')
    }

    return true
  }
}
