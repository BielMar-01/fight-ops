import type {
  AuditLogsResponse,
  ListAuditLogsParams,
} from '../types/audit'

import {
  apiRequest,
} from './api'

export function getAuditLogs(
  gymId: string,
  params: ListAuditLogsParams = {},
) {
  const searchParams =
    new URLSearchParams()

  if (params.page) {
    searchParams.set(
      'page',
      String(params.page),
    )
  }

  if (params.limit) {
    searchParams.set(
      'limit',
      String(params.limit),
    )
  }

  if (params.action) {
    searchParams.set(
      'action',
      params.action,
    )
  }

  if (params.entity) {
    searchParams.set(
      'entity',
      params.entity,
    )
  }

  if (params.userId) {
    searchParams.set(
      'userId',
      params.userId,
    )
  }

  if (params.startDate) {
    searchParams.set(
      'startDate',
      params.startDate,
    )
  }

  if (params.endDate) {
    searchParams.set(
      'endDate',
      params.endDate,
    )
  }

  const query =
    searchParams.toString()

  const url =
    query.length > 0
      ? `/gyms/${gymId}/audit-logs?${query}`
      : `/gyms/${gymId}/audit-logs`

  return apiRequest<AuditLogsResponse>(
    url,
    {
      method:
        'GET',
    },
  )
}