export interface ListProfessorsQuery {
  page: number
  limit: number
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