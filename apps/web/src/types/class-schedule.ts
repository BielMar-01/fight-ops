export type Weekday =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'

export type ClassGroupLevel =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'MIXED'

export interface ClassScheduleModality {
  id: string
  name: string
  color: string | null
  active: boolean
}

export interface ClassScheduleProfessor {
  relationId: string
  assignedAt: string
  id: string
  name: string
  email: string | null
  phone: string | null
  active: boolean
}

export interface ClassScheduleClassGroup {
  id: string
  modalityId: string
  name: string
  level: ClassGroupLevel
  durationMinutes: number
  active: boolean
  modality: ClassScheduleModality
  primaryProfessor:
    | ClassScheduleProfessor
    | null
  assistantProfessors:
    ClassScheduleProfessor[]
  totalProfessors: number
}

export interface ClassSchedule {
  id: string
  gymId: string
  classGroupId: string
  weekday: Weekday
  startTime: string
  endTime: string
  room: string | null
  notes: string | null
  validFrom: string | null
  validUntil: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  classGroup: ClassScheduleClassGroup
}

export interface ClassSchedulePagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface GetClassSchedulesFilters {
  page?: number
  limit?: number
  search?: string
  active?: boolean
  weekday?: Weekday
  classGroupId?: string
  modalityId?: string
  professorId?: string
  validOn?: string
}

export interface GetClassSchedulesResponse {
  classSchedules: ClassSchedule[]
  pagination: ClassSchedulePagination
}

export interface GetClassScheduleResponse {
  classSchedule: ClassSchedule
}

export interface GetClassGroupSchedulesResponse {
  classSchedules: ClassSchedule[]
}

export interface CreateClassScheduleInput {
  classGroupId: string
  weekday: Weekday
  startTime: string
  endTime: string
  room?: string
  notes?: string
  validFrom?: string
  validUntil?: string
}

export interface UpdateClassScheduleInput {
  classGroupId: string
  weekday: Weekday
  startTime: string
  endTime: string
  room?: string
  notes?: string
  validFrom?: string
  validUntil?: string
}

export interface UpdateClassScheduleStatusInput {
  active: boolean
}