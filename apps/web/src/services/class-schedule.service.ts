import { apiRequest } from './api'

import type {
  CreateClassScheduleInput,
  GetClassGroupSchedulesResponse,
  GetClassScheduleResponse,
  GetClassSchedulesFilters,
  GetClassSchedulesResponse,
  UpdateClassScheduleInput,
  UpdateClassScheduleStatusInput,
} from '../types/class-schedule'

function buildClassScheduleQuery(
  filters: GetClassSchedulesFilters,
) {
  const searchParams =
    new URLSearchParams()

  if (filters.page !== undefined) {
    searchParams.set(
      'page',
      String(filters.page),
    )
  }

  if (filters.limit !== undefined) {
    searchParams.set(
      'limit',
      String(filters.limit),
    )
  }

  if (filters.search) {
    searchParams.set(
      'search',
      filters.search,
    )
  }

  if (filters.active !== undefined) {
    searchParams.set(
      'active',
      String(filters.active),
    )
  }

  if (filters.weekday) {
    searchParams.set(
      'weekday',
      filters.weekday,
    )
  }

  if (filters.classGroupId) {
    searchParams.set(
      'classGroupId',
      filters.classGroupId,
    )
  }

  if (filters.modalityId) {
    searchParams.set(
      'modalityId',
      filters.modalityId,
    )
  }

  if (filters.professorId) {
    searchParams.set(
      'professorId',
      filters.professorId,
    )
  }

  if (filters.validOn) {
    searchParams.set(
      'validOn',
      filters.validOn,
    )
  }

  const query =
    searchParams.toString()

  return query
    ? `?${query}`
    : ''
}

export async function getClassSchedules(
  gymId: string,
  filters: GetClassSchedulesFilters = {},
) {
  const query =
    buildClassScheduleQuery(filters)

  return apiRequest<GetClassSchedulesResponse>(
    `/gyms/${gymId}/class-schedules${query}`,
  )
}

export async function getClassGroupSchedules(
  gymId: string,
  classGroupId: string,
) {
  return apiRequest<GetClassGroupSchedulesResponse>(
    `/gyms/${gymId}/class-groups/${classGroupId}/schedules`,
  )
}

export async function getClassScheduleById(
  gymId: string,
  classScheduleId: string,
) {
  return apiRequest<GetClassScheduleResponse>(
    `/gyms/${gymId}/class-schedules/${classScheduleId}`,
  )
}

export async function createClassSchedule(
  gymId: string,
  input: CreateClassScheduleInput,
) {
  return apiRequest<GetClassScheduleResponse>(
    `/gyms/${gymId}/class-schedules`,
    {
      method: 'POST',

      body: JSON.stringify(input),
    },
  )
}

export async function updateClassSchedule(
  gymId: string,
  classScheduleId: string,
  input: UpdateClassScheduleInput,
) {
  return apiRequest<GetClassScheduleResponse>(
    `/gyms/${gymId}/class-schedules/${classScheduleId}`,
    {
      method: 'PUT',

      body: JSON.stringify(input),
    },
  )
}

export async function updateClassScheduleStatus(
  gymId: string,
  classScheduleId: string,
  input: UpdateClassScheduleStatusInput,
) {
  return apiRequest<GetClassScheduleResponse>(
    `/gyms/${gymId}/class-schedules/${classScheduleId}/status`,
    {
      method: 'PATCH',

      body: JSON.stringify(input),
    },
  )
}