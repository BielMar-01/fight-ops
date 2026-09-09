export type ClassGroupLevel =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'MIXED'

export type ClassGroupProfessorRole =
  | 'PRIMARY'
  | 'ASSISTANT'

export interface ClassGroupModality {
  id: string
  name: string
  color: string | null
  active: boolean
}

export interface ClassGroupProfessorSummary {
  relationId: string
  assignedAt: string
  id: string
  name: string
  email: string | null
  phone: string | null
  active: boolean
}

export interface ClassGroup {
  id: string
  gymId: string
  modalityId: string
  name: string
  description: string | null
  level: ClassGroupLevel
  minimumAge: number | null
  maximumAge: number | null
  maxStudents: number | null
  durationMinutes: number
  active: boolean
  createdAt: string
  updatedAt: string
  modality: ClassGroupModality
  primaryProfessor:
    | ClassGroupProfessorSummary
    | null
  assistantProfessors:
    ClassGroupProfessorSummary[]
  totalProfessors: number
}

export interface ClassGroupProfessor {
  id: string
  gymId: string
  classGroupId: string
  professorId: string
  role: ClassGroupProfessorRole
  createdAt: string
  updatedAt: string

  professor: {
    id: string
    name: string
    email: string | null
    phone: string | null
    active: boolean
  }
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ClassGroupsResponse {
  classGroups: ClassGroup[]
  pagination: Pagination
}

export interface ClassGroupResponse {
  classGroup: ClassGroup
}

export interface ClassGroupProfessorsResponse {
  professors: ClassGroupProfessor[]
}

export interface ClassGroupProfessorResponse {
  classGroupProfessor: ClassGroupProfessor
}

export interface ListClassGroupsParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
  modalityId?: string
  level?: ClassGroupLevel
  professorId?: string
}

export interface CreateClassGroupInput {
  modalityId: string
  name: string
  description?: string
  level: ClassGroupLevel
  minimumAge?: number
  maximumAge?: number
  maxStudents?: number
  durationMinutes: number
}

export interface UpdateClassGroupInput {
  modalityId: string
  name: string
  description?: string
  level: ClassGroupLevel
  minimumAge?: number
  maximumAge?: number
  maxStudents?: number
  durationMinutes: number
}

export interface UpdateClassGroupStatusInput {
  active: boolean
}

export interface CreateClassGroupProfessorInput {
  professorId: string
  role: ClassGroupProfessorRole
}