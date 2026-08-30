import type {
  CreateStudentInput,
  ListStudentsParams,
  StudentResponse,
  StudentsResponse,
  UpdateStudentInput,
  UpdateStudentStatusInput,
} from '../types/student'

import {
  apiRequest,
} from './api'

export function getStudents(
  gymId: string,
  params: ListStudentsParams = {},
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

  if (params.search) {
    searchParams.set(
      'search',
      params.search,
    )
  }

  if (
    params.active !==
    undefined
  ) {
    searchParams.set(
      'active',
      String(params.active),
    )
  }

  const query =
    searchParams.toString()

  const url =
    query.length > 0
      ? `/gyms/${gymId}/students?${query}`
      : `/gyms/${gymId}/students`

  return apiRequest<StudentsResponse>(
    url,
    {
      method: 'GET',
    },
  )
}

export function getStudentById(
  gymId: string,
  studentId: string,
) {
  return apiRequest<StudentResponse>(
    `/gyms/${gymId}/students/${studentId}`,
    {
      method: 'GET',
    },
  )
}

export function createStudent(
  gymId: string,
  input: CreateStudentInput,
) {
  return apiRequest<StudentResponse>(
    `/gyms/${gymId}/students`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body:
        JSON.stringify(
          input,
        ),
    },
  )
}

export function updateStudent(
  gymId: string,
  studentId: string,
  input: UpdateStudentInput,
) {
  return apiRequest<StudentResponse>(
    `/gyms/${gymId}/students/${studentId}`,
    {
      method: 'PUT',

      headers: {
        'Content-Type':
          'application/json',
      },

      body:
        JSON.stringify(
          input,
        ),
    },
  )
}

export function updateStudentStatus(
  gymId: string,
  studentId: string,
  input: UpdateStudentStatusInput,
) {
  return apiRequest<StudentResponse>(
    `/gyms/${gymId}/students/${studentId}/status`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type':
          'application/json',
      },

      body:
        JSON.stringify(
          input,
        ),
    },
  )
}