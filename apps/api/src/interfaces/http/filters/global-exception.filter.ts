import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { DomainError } from '@domain/errors'

const DOMAIN_ERROR_STATUS: Record<string, number> = {
  USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  EMAIL_ALREADY_IN_USE: HttpStatus.CONFLICT,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  SERVICE_NOT_FOUND: HttpStatus.NOT_FOUND,
  SERVICE_INACTIVE: HttpStatus.BAD_REQUEST,
  PROFESSIONAL_NOT_FOUND: HttpStatus.NOT_FOUND,
  SLOT_UNAVAILABLE: HttpStatus.CONFLICT,
  APPOINTMENT_CONFLICT: HttpStatus.CONFLICT,
  PAST_DATE: HttpStatus.BAD_REQUEST,
  MANUAL_BLOCK_CONFLICT: HttpStatus.CONFLICT,
  MANUAL_BLOCK_NOT_FOUND: HttpStatus.NOT_FOUND,
  UNAUTHORIZED: HttpStatus.FORBIDDEN,
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HTTP')

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const res = ctx.getResponse<Response>()
    const req = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Erro interno do servidor'
    let code: string | undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const body = exception.getResponse()
      message = typeof body === 'string' ? body : ((body as Record<string, unknown>).message as string) ?? message
    } else if (exception instanceof DomainError) {
      status = DOMAIN_ERROR_STATUS[exception.code] ?? HttpStatus.UNPROCESSABLE_ENTITY
      message = exception.message
      code = exception.code
    }

    const isServerError = status >= 500
    const logPayload = {
      method: req.method,
      path: req.url,
      status,
      code,
      message,
    }

    if (isServerError) {
      this.logger.error(logPayload, exception instanceof Error ? exception.stack : undefined)
    } else {
      this.logger.warn(logPayload)
    }

    res.status(status).json({
      statusCode: status,
      message,
      ...(code ? { code } : {}),
      timestamp: new Date().toISOString(),
      path: req.url,
    })
  }
}
