import type {
  CreateGraduationInput,
  GraduationResponse,
  GraduationsResponse,
  ListGraduationsParams,
  UpdateGraduationInput,
  UpdateGraduationStatusInput,
} from '../types/graduation'

import {
  apiRequest,
} from './api'

function buildGraduationsQuery(
  params: ListGraduationsParams = {},
) {
  const searchParams =
    new URLSearchParams()

  if (
    params.page !==
    undefined
  ) {
    searchParams.set(
      'page',
      String(
        params.page,
      ),
    )
  }

  if (
    params.limit !==
    undefined
  ) {
    searchParams.set(
      'limit',
      String(
        params.limit,
      ),
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
      String(
        params.active,
      ),
    )
  }

  const query =
    searchParams.toString()

  return query
    ? `?${query}`
    : ''
}

export async function listGraduations(
  gymId: string,
  modalityId: string,
  params: ListGraduationsParams = {},
) {
  const query =
    buildGraduationsQuery(
      params,
    )

  return apiRequest<GraduationsResponse>(
    `/gyms/${gymId}/modalities/${modalityId}/graduations${query}`,
  )
}

export async function getGraduationById(
  gymId: string,
  modalityId: string,
  graduationId: string,
) {
  return apiRequest<GraduationResponse>(
    `/gyms/${gymId}/modalities/${modalityId}/graduations/${graduationId}`,
  )
}

export async function createGraduation(
  gymId: string,
  modalityId: string,
  input: CreateGraduationInput,
) {
  return apiRequest<GraduationResponse>(
    `/gyms/${gymId}/modalities/${modalityId}/graduations`,
    {
      method:
        'POST',

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

export async function updateGraduation(
  gymId: string,
  modalityId: string,
  graduationId: string,
  input: UpdateGraduationInput,
) {
  return apiRequest<GraduationResponse>(
    `/gyms/${gymId}/modalities/${modalityId}/graduations/${graduationId}`,
    {
      method:
        'PUT',

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

export async function updateGraduationStatus(
  gymId: string,
  modalityId: string,
  graduationId: string,
  input: UpdateGraduationStatusInput,
) {
  return apiRequest<GraduationResponse>(
    `/gyms/${gymId}/modalities/${modalityId}/graduations/${graduationId}/status`,
    {
      method:
        'PATCH',

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