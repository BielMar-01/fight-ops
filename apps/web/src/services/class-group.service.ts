import type {
  ClassGroupProfessorResponse,
  ClassGroupProfessorsResponse,
  ClassGroupResponse,
  ClassGroupsResponse,
  CreateClassGroupInput,
  CreateClassGroupProfessorInput,
  ListClassGroupsParams,
  UpdateClassGroupInput,
  UpdateClassGroupStatusInput,
} from '../types/class-group'

import { apiRequest } from './api'

function buildClassGroupsQuery(
  params: ListClassGroupsParams = {},
) {
  const searchParams = new URLSearchParams()

  if (params.page !== undefined) {
    searchParams.set(
      'page',
      String(params.page),
    )
  }

  if (params.limit !== undefined) {
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

  if (params.active !== undefined) {
    searchParams.set(
      'active',
      String(params.active),
    )
  }

  if (params.modalityId) {
    searchParams.set(
      'modalityId',
      params.modalityId,
    )
  }

  if (params.level) {
    searchParams.set(
      'level',
      params.level,
    )
  }

  if (params.professorId) {
    searchParams.set(
      'professorId',
      params.professorId,
    )
  }

  const query = searchParams.toString()

  return query ? `?${query}` : ''
}

export async function getClassGroups(
  gymId: string,
  params: ListClassGroupsParams = {},
) {
  const query =
    buildClassGroupsQuery(params)

  return apiRequest<ClassGroupsResponse>(
    `/gyms/${gymId}/class-groups${query}`,
  )
}

export async function getClassGroupById(
  gymId: string,
  classGroupId: string,
) {
  return apiRequest<ClassGroupResponse>(
    `/gyms/${gymId}/class-groups/${classGroupId}`,
  )
}

export async function createClassGroup(
  gymId: string,
  input: CreateClassGroupInput,
) {
  return apiRequest<ClassGroupResponse>(
    `/gyms/${gymId}/class-groups`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(input),
    },
  )
}

export async function updateClassGroup(
  gymId: string,
  classGroupId: string,
  input: UpdateClassGroupInput,
) {
  return apiRequest<ClassGroupResponse>(
    `/gyms/${gymId}/class-groups/${classGroupId}`,
    {
      method: 'PUT',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(input),
    },
  )
}

export async function updateClassGroupStatus(
  gymId: string,
  classGroupId: string,
  input: UpdateClassGroupStatusInput,
) {
  return apiRequest<ClassGroupResponse>(
    `/gyms/${gymId}/class-groups/${classGroupId}/status`,
    {
      method: 'PATCH',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(input),
    },
  )
}

export async function getClassGroupProfessors(
  gymId: string,
  classGroupId: string,
) {
  return apiRequest<ClassGroupProfessorsResponse>(
    `/gyms/${gymId}/class-groups/${classGroupId}/professors`,
  )
}

export async function createClassGroupProfessor(
  gymId: string,
  classGroupId: string,
  input: CreateClassGroupProfessorInput,
) {
  return apiRequest<ClassGroupProfessorResponse>(
    `/gyms/${gymId}/class-groups/${classGroupId}/professors`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify(input),
    },
  )
}

export async function deleteClassGroupProfessor(
  gymId: string,
  classGroupId: string,
  professorId: string,
) {
  return apiRequest<void>(
    `/gyms/${gymId}/class-groups/${classGroupId}/professors/${professorId}`,
    {
      method: 'DELETE',
    },
  )
}