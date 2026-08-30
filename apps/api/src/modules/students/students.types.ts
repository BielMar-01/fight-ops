export interface ListStudentsInput {
  page: number
  limit: number
  search?: string
  active?: boolean
}

export interface CreateStudentInput {
  name: string
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
  notes?: string | null
  joinedAt?: string | null
}

export interface UpdateStudentInput {
  name: string
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  emergencyContact?: string | null
  emergencyPhone?: string | null
  notes?: string | null
  joinedAt?: string | null
}

export interface UpdateStudentStatusInput {
  active: boolean
}