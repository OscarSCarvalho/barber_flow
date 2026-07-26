import { Module } from '@nestjs/common'
import { ServicesController } from './services.controller'
import { PrismaServiceRepository } from '@infrastructure/database/PrismaServiceRepository'
import { CreateServiceUseCase } from '@application/services/CreateServiceUseCase'
import { UpdateServiceUseCase } from '@application/services/UpdateServiceUseCase'
import { DeactivateServiceUseCase } from '@application/services/DeactivateServiceUseCase'
import { ListServicesUseCase } from '@application/services/ListServicesUseCase'

@Module({
  controllers: [ServicesController],
  providers: [
    PrismaServiceRepository,
    {
      provide: CreateServiceUseCase,
      useFactory: (r: PrismaServiceRepository) => new CreateServiceUseCase(r),
      inject: [PrismaServiceRepository],
    },
    {
      provide: UpdateServiceUseCase,
      useFactory: (r: PrismaServiceRepository) => new UpdateServiceUseCase(r),
      inject: [PrismaServiceRepository],
    },
    {
      provide: DeactivateServiceUseCase,
      useFactory: (r: PrismaServiceRepository) => new DeactivateServiceUseCase(r),
      inject: [PrismaServiceRepository],
    },
    {
      provide: ListServicesUseCase,
      useFactory: (r: PrismaServiceRepository) => new ListServicesUseCase(r),
      inject: [PrismaServiceRepository],
    },
  ],
  exports: [PrismaServiceRepository],
})
export class ServicesModule {}
