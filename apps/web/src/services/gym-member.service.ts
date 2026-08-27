import {
  apiRequest,
} from './api'

import type {
  AddGymMemberInput,
  AddGymMemberResponse,
  GymMembersResponse,
  UpdateGymMemberResponse,
  UpdateGymMemberRoleInput,
  UpdateGymMemberStatusInput,
} from '../types/gym-member'

export function getGymMembers(
  gymId: string,
) {
  return apiRequest<GymMembersResponse>(
    `/gyms/${gymId}/members`,
    {
      method: 'GET',
    },
  )
}

export function addGymMember(
  gymId: string,
  input: AddGymMemberInput,
) {
  return apiRequest<AddGymMemberResponse>(
    `/gyms/${gymId}/members`,
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

export function updateGymMemberRole(
  gymId: string,
  memberId: string,
  input: UpdateGymMemberRoleInput,
) {
  return apiRequest<UpdateGymMemberResponse>(
    `/gyms/${gymId}/members/${memberId}/role`,
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

export function updateGymMemberStatus(
  gymId: string,
  memberId: string,
  input: UpdateGymMemberStatusInput,
) {
  return apiRequest<UpdateGymMemberResponse>(
    `/gyms/${gymId}/members/${memberId}/status`,
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