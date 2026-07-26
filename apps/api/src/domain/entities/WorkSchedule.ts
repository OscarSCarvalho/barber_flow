export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

export interface WorkSchedule {
  id: string
  professionalId: string
  dayOfWeek: DayOfWeek
  startTime: string   // "09:00"
  endTime: string     // "19:00"
  breakStart?: string // "12:00"
  breakEnd?: string   // "13:00"
}

export interface UpsertWorkScheduleInput {
  professionalId: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  breakStart?: string
  breakEnd?: string
}
