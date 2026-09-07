export interface Graduation {
  id: string
  gymId: string
  modalityId: string
  name: string
  description: string | null
  color: string | null
  textColor: string | null
  order: number
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

export interface GraduationsResponse {
  graduations: Graduation[]
  pagination: Pagination
}

export interface GraduationResponse {
  graduation: Graduation
}

export interface ListGraduationsParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
}

export interface CreateGraduationInput {
  name: string
  description?: string
  color?: string
  textColor?: string
  order: number
}

export interface UpdateGraduationInput {
  name: string
  description?: string
  color?: string
  textColor?: string
  order: number
}

export interface UpdateGraduationStatusInput {
  active: boolean
}
