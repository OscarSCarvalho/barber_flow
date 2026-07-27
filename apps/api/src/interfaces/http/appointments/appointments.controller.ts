import {
  Body, Controller, Get, Param, Patch, Post,
  UseGuards, Request, HttpCode, HttpStatus,
  NotFoundException, ConflictException, BadRequestException,
  Query,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'
import { Throttle } from '@nestjs/throttler'
import { JwtAuthGuard } from '@interfaces/guards/jwt-auth.guard'
import { RolesGuard } from '@interfaces/guards/roles.guard'
import { Roles } from '@interfaces/guards/roles.decorator'
import { CreateAppointmentDto, CancelAppointmentDto, ListAppointmentsDto } from '@interfaces/dtos/appointment.dto'
import { CreateAppointmentUseCase } from '@application/appointments/CreateAppointmentUseCase'
import { CancelAppointmentUseCase, AppointmentNotFoundError, AppointmentAlreadyCancelledError } from '@application/appointments/CancelAppointmentUseCase'
import { ListAppointmentsUseCase } from '@application/appointments/ListAppointmentsUseCase'
import { AddAppointmentNoteUseCase } from '@application/appointments/AddAppointmentNoteUseCase'
import { CompleteAppointmentUseCase } from '@application/appointments/CompleteAppointmentUseCase'
import { AvailabilityCacheService } from '@infrastructure/cache/availability-cache.service'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import {
  AppointmentConflictError, PastDateError,
  ServiceNotFoundError, ServiceInactiveError,
  AppointmentNotFoundError as DomainAppointmentNotFoundError,
} from '@domain/errors'

class AddNoteDto {
  @IsString() barberNotes!: string
}

const DEFAULT_TENANT_ID = process.env.DEFAULT_TENANT_ID ?? ''

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly createAppointment: CreateAppointmentUseCase,
    private readonly cancelAppointment: CancelAppointmentUseCase,
    private readonly listAppointments: ListAppointmentsUseCase,
    private readonly addNote: AddAppointmentNoteUseCase,
    private readonly completeAppointment: CompleteAppointmentUseCase,
    private readonly availabilityCache: AvailabilityCacheService,
    private readonly professionalRepo: PrismaProfessionalRepository,
  ) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Criar agendamento (público)' })
  async create(
    @Body() dto: CreateAppointmentDto,
    @Request() req: { user?: { tenantId: string } },
  ) {
    const tenantId = req.user?.tenantId ?? DEFAULT_TENANT_ID
    try {
      const appointment = await this.createAppointment.execute({
        tenantId,
        professionalId: dto.professionalId,
        clientId: dto.clientId,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone,
        serviceIds: dto.serviceIds,
        startsAt: new Date(dto.startsAt),
      })

      await this.availabilityCache.invalidateForProfessional(
        dto.professionalId,
        new Date(dto.startsAt),
      )

      return appointment
    } catch (err) {
      if (err instanceof PastDateError) throw new BadRequestException(err.message)
      if (err instanceof AppointmentConflictError) throw new ConflictException(err.message)
      if (err instanceof ServiceNotFoundError) throw new NotFoundException(err.message)
      if (err instanceof ServiceInactiveError) throw new BadRequestException(err.message)
      throw err
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BARBER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar agendamentos (admin/barber)' })
  async list(
    @Query() dto: ListAppointmentsDto,
    @Request() req: { user: { tenantId: string; role: string; id: string } },
  ) {
    let professionalId = dto.professionalId

    if (req.user.role === 'BARBER') {
      const professional = await this.professionalRepo.findByUserId(req.user.id)
      professionalId = professional?.id
    }

    return this.listAppointments.execute({
      tenantId: req.user.tenantId,
      professionalId,
      dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
      dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
      status: dto.status,
    })
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar agendamento' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    try {
      const appointment = await this.cancelAppointment.execute({ id, reason: dto.reason })

      await this.availabilityCache.invalidateForProfessional(
        appointment.professionalId,
        appointment.startsAt,
      )

      return appointment
    } catch (err) {
      if (err instanceof AppointmentNotFoundError) throw new NotFoundException(err.message)
      if (err instanceof AppointmentAlreadyCancelledError) throw new ConflictException(err.message)
      throw err
    }
  }

  @Patch(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BARBER')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marcar agendamento como concluído' })
  async complete(@Param('id') id: string) {
    try {
      return await this.completeAppointment.execute({ appointmentId: id })
    } catch (err) {
      if (err instanceof DomainAppointmentNotFoundError) throw new NotFoundException(err.message)
      throw err
    }
  }

  @Patch(':id/note')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BARBER')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Adicionar nota do barbeiro ao agendamento' })
  async note(@Param('id') id: string, @Body() dto: AddNoteDto) {
    try {
      return await this.addNote.execute({ appointmentId: id, barberNotes: dto.barberNotes })
    } catch (err) {
      if (err instanceof DomainAppointmentNotFoundError) throw new NotFoundException(err.message)
      throw err
    }
  }
}
