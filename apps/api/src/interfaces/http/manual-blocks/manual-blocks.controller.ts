import {
  Controller, Post, Get, Delete, Param, Body, Req,
  UseGuards, HttpCode, HttpStatus, Query,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '@interfaces/guards/jwt-auth.guard'
import { RolesGuard } from '@interfaces/guards/roles.guard'
import { Roles } from '@interfaces/guards/roles.decorator'
import { CreateManualBlockUseCase } from '@application/barber/CreateManualBlockUseCase'
import { DeleteManualBlockUseCase } from '@application/barber/DeleteManualBlockUseCase'
import { GetBarberDayScheduleUseCase } from '@application/barber/GetBarberDayScheduleUseCase'
import { CreateManualBlockDto } from './manual-block.dto'

@ApiTags('manual-blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('BARBER', 'ADMIN')
@Controller('manual-blocks')
export class ManualBlocksController {
  constructor(
    private readonly createManualBlock: CreateManualBlockUseCase,
    private readonly deleteManualBlock: DeleteManualBlockUseCase,
    private readonly getBarberDaySchedule: GetBarberDayScheduleUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cria um bloqueio manual no calendário do barbeiro' })
  async create(@Req() req: any, @Body() dto: CreateManualBlockDto) {
    return this.createManualBlock.execute({
      userId: req.user.sub,
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
      reason: dto.reason,
    })
  }

  @Get('schedule')
  @ApiOperation({ summary: 'Retorna agendamentos e bloqueios do barbeiro em uma data' })
  async daySchedule(@Req() req: any, @Query('date') date: string) {
    return this.getBarberDaySchedule.execute({
      userId: req.user.sub,
      date: date ? new Date(date) : new Date(),
    })
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um bloqueio manual futuro' })
  async remove(@Req() req: any, @Param('id') id: string) {
    await this.deleteManualBlock.execute({ userId: req.user.sub, blockId: id })
  }
}
