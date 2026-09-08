import type {
  CreateProfessorModalityInput,
  ProfessorModalitiesResponse,
  ProfessorModalityResponse,
} from '../types/professor-modality'

import { apiRequest } from './api'

export function listProfessorModalities(gymId: string, professorId: string) {
  return apiRequest<ProfessorModalitiesResponse>(
    `/gyms/${gymId}/professors/${professorId}/modalities`,
    {
      method: 'GET',
    },
  )
}

export function createProfessorModality(
  gymId: string,
  professorId: string,
  input: CreateProfessorModalityInput,
) {
  return apiRequest<ProfessorModalityResponse>(
    `/gyms/${gymId}/professors/${professorId}/modalities`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(input),
    },
  )
}

export function deleteProfessorModality(
  gymId: string,
  professorId: string,
  modalityId: string,
) {
  return apiRequest<void>(
    `/gyms/${gymId}/professors/${professorId}/modalities/${modalityId}`,
    {
      method: 'DELETE',
    },
  )
}