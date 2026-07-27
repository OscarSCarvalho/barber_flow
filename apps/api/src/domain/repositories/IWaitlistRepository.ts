import { WaitlistEntry, CreateWaitlistEntryInput, WaitlistStatus } from '../entities/WaitlistEntry'

export interface IWaitlistRepository {
  create(input: CreateWaitlistEntryInput): Promise<WaitlistEntry>
  findByProfessional(professionalId: string, tenantId: string): Promise<WaitlistEntry[]>
  updateStatus(id: string, status: WaitlistStatus, notifiedAt?: Date): Promise<WaitlistEntry>
  expireOldEntries(): Promise<number>
}
