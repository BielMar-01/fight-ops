import type {
  GymRole,
} from './gym'

export interface GymMemberUser {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  active: boolean
}

export interface GymMember {
  id: string
  role: GymRole
  active: boolean
  joinedAt: string
  createdAt: string
  updatedAt: string
  user: GymMemberUser
}

export interface GymMembersResponse {
  members: GymMember[]
}

export interface AddGymMemberInput {
  email: string

  role:
    | 'ADMIN'
    | 'RECEPTIONIST'
    | 'PROFESSOR'
    | 'STUDENT'
}

export interface AddGymMemberResponse {
  member: GymMember
}

export interface UpdateGymMemberRoleInput {
  role: GymRole
}

export interface UpdateGymMemberStatusInput {
  active: boolean
}

export interface UpdateGymMemberResponse {
  member: GymMember
}