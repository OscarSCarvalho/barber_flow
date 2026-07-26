import { ManualBlock, CreateManualBlockInput } from '../entities/ManualBlock'

export interface IManualBlockRepository {
  findById(id: string): Promise<ManualBlock | null>
  findByProfessionalAndRange(professionalId: string, from: Date, to: Date): Promise<ManualBlock[]>
  create(input: CreateManualBlockInput): Promise<ManualBlock>
  delete(id: string): Promise<void>
}
