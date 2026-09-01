export interface Professor {
  id: string
  gymId: string
  userId: string | null

  name: string
  email: string | null
  phone: string | null
  birthDate: string | null

  bio: string | null
  notes: string | null
  hireDate: string | null

  active: boolean

  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProfessorsResponse {
  professors: Professor[]

  pagination: Pagination
}

export interface ProfessorResponse {
  professor: Professor
}

export interface ListProfessorsParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
}

export interface CreateProfessorInput {
  name: string

  email?: string
  phone?: string
  birthDate?: string

  bio?: string
  notes?: string
  hireDate?: string
}

export interface UpdateProfessorInput {
  name: string

  email?: string
  phone?: string
  birthDate?: string

  bio?: string
  notes?: string
  hireDate?: string
}

export interface UpdateProfessorStatusInput {
  active: boolean
}