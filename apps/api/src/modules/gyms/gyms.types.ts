export type GymRole =
  | 'OWNER'
  | 'ADMIN'
  | 'RECEPTIONIST'
  | 'PROFESSOR'
  | 'STUDENT'

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
  role: GymRole
}

export interface AddGymMemberInput {
  email: string
  role: Exclude<
    GymRole,
    'OWNER'
  >
}

export interface UpdateGymMemberRoleInput {
  role: GymRole
}

export interface UpdateGymMemberStatusInput {
  active: boolean
}