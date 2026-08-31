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

export interface AuditUser {
  id: string
  name: string
  email: string
}

export type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditJsonValue[]
  | {
      [key: string]:
        AuditJsonValue
    }

export interface AuditLog {
  id: string

  gymId: string | null
  userId: string | null

  action:
    | AuditAction
    | string

  entity:
    | AuditEntity
    | string

  entityId: string | null

  oldValues:
    | AuditJsonValue
    | null

  newValues:
    | AuditJsonValue
    | null

  metadata:
    | AuditJsonValue
    | null

  ipAddress: string | null
  userAgent: string | null

  createdAt: string

  user:
    | AuditUser
    | null
}

export interface AuditPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface AuditLogsResponse {
  auditLogs: AuditLog[]
  pagination: AuditPagination
}

export interface ListAuditLogsParams {
  page?: number
  limit?: number

  action?: string
  entity?: string

  userId?: string

  startDate?: string
  endDate?: string
}