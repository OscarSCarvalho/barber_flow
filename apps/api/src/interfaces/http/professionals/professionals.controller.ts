import {
  Body, Controller, Get, Param, Patch, Post, Put,
  UseGuards, Request, NotFoundException, ConflictException,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '@interfaces/guards/jwt-auth.guard'
import { RolesGuard } from '@interfaces/guards/roles.guard'
import { Roles } from '@interfaces/guards/roles.decorator'
import { CreateProfessionalDto, UpdateProfessionalDto, UpsertWorkScheduleDto } from '@interfaces/dtos/professional.dto'
import { CreateProfessionalUseCase } from '@application/professionals/CreateProfessionalUseCase'
import { UpdateProfessionalUseCase } from '@application/professionals/UpdateProfessionalUseCase'
import { SetWorkScheduleUseCase } from '@application/professionals/SetWorkScheduleUseCase'
import { PrismaProfessionalRepository } from '@infrastructure/database/PrismaProfessionalRepository'
import { PrismaWorkScheduleRepository } from '@infrastructure/database/PrismaWorkScheduleRepository'
import { EmailAlreadyInUseError, ProfessionalNotFoundError, DomainError } from '@domain/errors'

@ApiTags('professionals')
@Controller('professionals')
export class ProfessionalsController {
  constructor(
    private readonly createProfessional: CreateProfessionalUseCase,
    private readonly updateProfessional: UpdateProfessionalUseCase,
    private readonly setWorkSchedule: SetWorkScheduleUseCase,
    private readonly professionalRepo: PrismaProfessionalRepository,
    private readonly workScheduleRepo: PrismaWorkScheduleRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar profissionais ativos' })
  async list(@Request() req: { user?: { tenantId: string } }) {
    const tenantId = req.user?.tenantId ?? process.env.DEFAULT_TENANT_ID ?? ''
    return this.professionalRepo.findByTenant(tenantId)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o profissional vinculado ao usuário autenticado' })
  async me(@Request() req: { user: { sub: string } }) {
    const professional = await this.professionalRepo.findByUserId(req.user.sub)
    if (!professional) throw new NotFoundException('Profissional não encontrado para este usuário')
    return professional
  }

  @Get(':id/schedules')
  @ApiOperation({ summary: 'Obter jornada semanal de um profissional' })
  async getSchedules(@Param('id') id: string) {
    return this.workScheduleRepo.findByProfessional(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar profissional (admin)' })
  async create(@Request() req: { user: { tenantId: string } }, @Body() dto: CreateProfessionalDto) {
    try {
      return await this.createProfessional.execute({ tenantId: req.user.tenantId, ...dto })
    } catch (err) {
      if (err instanceof EmailAlreadyInUseError) throw new ConflictException(err.message)
      throw err
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'BARBER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar perfil de profissional' })
  async update(@Param('id') id: string, @Body() dto: UpdateProfessionalDto) {
    try {
      return await this.updateProfessional.execute({ id, ...dto })
    } catch (err) {
      if (err instanceof ProfessionalNotFoundError) throw new NotFoundException(err.message)
      throw err
    }
  }

  @Put(':id/schedules')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Configurar jornada de trabalho (upsert por dia)' })
  async upsertSchedule(@Param('id') id: string, @Body() dto: UpsertWorkScheduleDto) {
    try {
      return await this.setWorkSchedule.execute({ professionalId: id, ...dto })
    } catch (err) {
      if (err instanceof ProfessionalNotFoundError) throw new NotFoundException(err.message)
      if (err instanceof DomainError) throw new ConflictException(err.message)
      throw err
    }
  }
}
