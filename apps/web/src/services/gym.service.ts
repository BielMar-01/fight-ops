import {
  apiRequest,
} from './api'

import type {
  CreateGymInput,
  CreateGymResponse,
  GymsResponse,
} from '../types/gym'

export function getMyGyms() {
  return apiRequest<GymsResponse>(
    '/gyms',
    {
      method: 'GET',
    },
  )
}

export function createGym(
  input: CreateGymInput,
) {
  return apiRequest<CreateGymResponse>(
    '/gyms',
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