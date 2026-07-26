export type SlotStatus = 'AVAILABLE' | 'BLOCKED'

export type BlockReason = 'APPOINTMENT' | 'MANUAL_BLOCK' | 'OUTSIDE_HOURS' | 'LUNCH'

export interface TimeSlot {
  readonly startsAt: Date
  readonly endsAt: Date
  readonly status: SlotStatus
  readonly blockReason?: BlockReason
}

export function createAvailableSlot(startsAt: Date, endsAt: Date): TimeSlot {
  return { startsAt, endsAt, status: 'AVAILABLE' }
}

export function createBlockedSlot(startsAt: Date, endsAt: Date, reason: BlockReason): TimeSlot {
  return { startsAt, endsAt, status: 'BLOCKED', blockReason: reason }
}
