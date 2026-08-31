export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'STATUS_CHANGE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'PASSWORD_RESET_REQUESTED_BY_ADMIN'

export type AuditEntity =
  | 'USER'
  | 'GYM'
  | 'GYM_MEMBERSHIP'
  | 'STUDENT'
  | 'AUTH'
  | 'SYSTEM'

export type AuditMetadata =
  Record<string, unknown>

export interface CreateAuditLogInput {
  gymId?: string | null
  userId?: string | null

  action:
    | AuditAction
    | string

  entity:
    | AuditEntity
    | string

  entityId?: string | null

  oldValues?: unknown
  newValues?: unknown

  metadata?:
    | AuditMetadata
    | null

  ipAddress?: string | null
  userAgent?: string | null
}

export interface ListAuditLogsInput {
  page: number
  limit: number

  action?: string
  entity?: string
  userId?: string

  startDate?: string
  endDate?: string
}