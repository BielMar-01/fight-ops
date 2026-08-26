import {
  apiRequest,
} from './api'

import type {
  ForgotPasswordInput,
  ForgotPasswordResponse,
  LoginInput,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  VerifyPasswordResetInput,
  VerifyPasswordResetResponse,
} from '../types/auth'

export function login(
  input: LoginInput,
) {
  return apiRequest<LoginResponse>(
    '/auth/login',
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

export function register(
  input: RegisterInput,
) {
  return apiRequest<RegisterResponse>(
    '/auth/register',
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

export function refreshSession() {
  return apiRequest<RefreshResponse>(
    '/auth/refresh',
    {
      method: 'POST',
    },
  )
}

export function getAuthenticatedUser() {
  return apiRequest<MeResponse>(
    '/auth/me',
    {
      method: 'GET',
    },
  )
}

export function logoutSession() {
  return apiRequest<void>(
    '/auth/logout',
    {
      method: 'POST',
    },
  )
}

export function requestPasswordReset(
  input: ForgotPasswordInput,
) {
  return apiRequest<ForgotPasswordResponse>(
    '/auth/password/forgot',
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

export function verifyPasswordReset(
  input: VerifyPasswordResetInput,
) {
  return apiRequest<VerifyPasswordResetResponse>(
    '/auth/password/verify',
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

export function resetPassword(
  input: ResetPasswordInput,
) {
  return apiRequest<void>(
    '/auth/password/reset',
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