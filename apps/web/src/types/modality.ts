export interface Modality {
  id: string
  gymId: string
  name: string
  description: string | null
  color: string | null
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

export interface ModalitiesResponse {
  modalities: Modality[]
  pagination: Pagination
}

export interface ModalityResponse {
  modality: Modality
}

export interface ListModalitiesParams {
  page?: number
  limit?: number
  search?: string
  active?: boolean
}

export interface CreateModalityInput {
  name: string
  description?: string
  color?: string
}

export interface UpdateModalityInput {
  name: string
  description?: string
  color?: string
}

export interface UpdateModalityStatusInput {
  active: boolean
}