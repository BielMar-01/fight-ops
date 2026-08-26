export interface CreateGymInput {
  name: string
  description?: string
  phone?: string
  email?: string
}

export interface GymResponse {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  logoUrl: string | null
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UserGymResponse
  extends GymResponse {
  role:
    | 'OWNER'
    | 'ADMIN'
    | 'RECEPTIONIST'
    | 'PROFESSOR'
    | 'STUDENT'
}