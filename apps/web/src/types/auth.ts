export type GlobalRole =
  | 'USER'
  | 'SUPER_ADMIN'

export interface AuthUser {
  id: string
  name: string
  email: string
  globalRole: GlobalRole
}

export interface AuthenticatedUser {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  globalRole: GlobalRole
  active: boolean
  emailVerifiedAt: string | null
  createdAt: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface RefreshResponse {
  accessToken: string
  user: AuthUser
}

export interface MeResponse {
  user: AuthenticatedUser
}