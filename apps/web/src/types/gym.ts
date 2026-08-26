export type GymRole =
  | 'OWNER'
  | 'ADMIN'
  | 'RECEPTIONIST'
  | 'PROFESSOR'
  | 'STUDENT'

export interface Gym {
  id: string
  name: string
  slug: string
  description: string | null
  phone: string | null
  email: string | null
  logoUrl: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  role: GymRole
}

export interface GymsResponse {
  gyms: Gym[]
}

export interface CreateGymInput {
  name: string
  description?: string
  phone?: string
  email?: string
}

export interface CreateGymResponse {
  gym: Gym
}