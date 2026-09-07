import { apiRequest } from './api'

import type {
  CreateModalityInput,
  ListModalitiesParams,
  ModalitiesResponse,
  ModalityResponse,
  UpdateModalityInput,
  UpdateModalityStatusInput,
} from '../types/modality'

function buildModalitiesQuery(params: ListModalitiesParams = {}) {
  const searchParams = new URLSearchParams()

  if (params.page !== undefined) {
    searchParams.set('page', String(params.page))
  }

  if (params.limit !== undefined) {
    searchParams.set('limit', String(params.limit))
  }

  if (params.search) {
    searchParams.set('search', params.search)
  }

  if (params.active !== undefined) {
    searchParams.set('active', String(params.active))
  }

  const query = searchParams.toString()

  return query ? `?${query}` : ''
}

export async function getModalities(gymId: string, params: ListModalitiesParams = {}) {
  const query = buildModalitiesQuery(params)

  return apiRequest<ModalitiesResponse>(`/gyms/${gymId}/modalities${query}`)
}

export async function getModalityById(gymId: string, modalityId: string) {
  return apiRequest<ModalityResponse>(`/gyms/${gymId}/modalities/${modalityId}`)
}

export async function createModality(gymId: string, input: CreateModalityInput) {
  return apiRequest<ModalityResponse>(`/gyms/${gymId}/modalities`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(input),
  })
}

export async function updateModality(
  gymId: string,
  modalityId: string,
  input: UpdateModalityInput,
) {
  return apiRequest<ModalityResponse>(`/gyms/${gymId}/modalities/${modalityId}`, {
    method: 'PUT',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(input),
  })
}

export async function updateModalityStatus(
  gymId: string,
  modalityId: string,
  input: UpdateModalityStatusInput,
) {
  return apiRequest<ModalityResponse>(`/gyms/${gymId}/modalities/${modalityId}/status`, {
    method: 'PATCH',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify(input),
  })
}
