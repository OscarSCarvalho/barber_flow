import {
  Body, Controller, Delete, Get, Param, Patch, Post,
  UseGuards, Request, HttpCode, HttpStatus, NotFoundException, ConflictException,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '@interfaces/guards/jwt-auth.guard'
import { RolesGuard } from '@interfaces/guards/roles.guard'
import { Roles } from '@interfaces/guards/roles.decorator'
import { CreateServiceDto, UpdateServiceDto } from '@interfaces/dtos/service.dto'
import { CreateServiceUseCase, ServiceNameAlreadyExistsError } from '@application/services/CreateServiceUseCase'
import { UpdateServiceUseCase } from '@application/services/UpdateServiceUseCase'
import { DeactivateServiceUseCase } from '@application/services/DeactivateServiceUseCase'
import { ListServicesUseCase } from '@application/services/ListServicesUseCase'
import { ServiceNotFoundError, DomainError } from '@domain/errors'

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(
    private readonly createService: CreateServiceUseCase,
    private readonly updateService: UpdateServiceUseCase,
    private readonly deactivateService: DeactivateServiceUseCase,
    private readonly listServices: ListServicesUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar serviços ativos (público)' })
  async list(@Request() req: { user?: { tenantId: string } }) {
    const tenantId = req.user?.tenantId ?? process.env.DEFAULT_TENANT_ID ?? ''
    return this.listServices.execute(tenantId, true)
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar serviço (admin)' })
  async create(@Request() req: { user: { tenantId: string } }, @Body() dto: CreateServiceDto) {
    try {
      return await this.createService.execute({ tenantId: req.user.tenantId, ...dto })
    } catch (err) {
      if (err instanceof ServiceNameAlreadyExistsError) throw new ConflictException(err.message)
      if (err instanceof DomainError) throw new ConflictException(err.message)
      throw err
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar serviço (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    try {
      return await this.updateService.execute({ id, ...dto })
    } catch (err) {
      if (err instanceof ServiceNotFoundError) throw new NotFoundException(err.message)
      if (err instanceof DomainError) throw new ConflictException(err.message)
      throw err
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar serviço — soft delete (admin)' })
  async deactivate(@Param('id') id: string) {
    try {
      await this.deactivateService.execute(id)
    } catch (err) {
      if (err instanceof ServiceNotFoundError) throw new NotFoundException(err.message)
      throw err
    }
  }
}
