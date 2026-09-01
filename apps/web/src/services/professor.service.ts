import type {
  CreateProfessorInput,
  ListProfessorsParams,
  ProfessorResponse,
  ProfessorsResponse,
  UpdateProfessorInput,
  UpdateProfessorStatusInput,
} from '../types/professor'

import {
  apiRequest,
} from './api'

export function getProfessors(
  gymId: string,
  params: ListProfessorsParams = {},
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
      ? `/gyms/${gymId}/professors?${query}`
      : `/gyms/${gymId}/professors`

  return apiRequest<ProfessorsResponse>(
    url,
    {
      method: 'GET',
    },
  )
}

export function getProfessorById(
  gymId: string,
  professorId: string,
) {
  return apiRequest<ProfessorResponse>(
    `/gyms/${gymId}/professors/${professorId}`,
    {
      method: 'GET',
    },
  )
}

export function createProfessor(
  gymId: string,
  input: CreateProfessorInput,
) {
  return apiRequest<ProfessorResponse>(
    `/gyms/${gymId}/professors`,
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

export function updateProfessor(
  gymId: string,
  professorId: string,
  input: UpdateProfessorInput,
) {
  return apiRequest<ProfessorResponse>(
    `/gyms/${gymId}/professors/${professorId}`,
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

export function updateProfessorStatus(
  gymId: string,
  professorId: string,
  input: UpdateProfessorStatusInput,
) {
  return apiRequest<ProfessorResponse>(
    `/gyms/${gymId}/professors/${professorId}/status`,
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