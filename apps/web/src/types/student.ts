export interface Student {
  id: string
  gymId: string
  userId: string | null
  name: string
  email: string | null
  phone: string | null
  birthDate: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  notes: string | null
  active: boolean
  joinedAt: string
  createdAt: string
  updatedAt: string
}

export interface StudentPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface StudentsResponse {
  students: Student[]
  pagination: StudentPagination
}

export interface StudentResponse {
  student: Student
}

export interface ListStudentsParams {
  page?: number
  limit?: number
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