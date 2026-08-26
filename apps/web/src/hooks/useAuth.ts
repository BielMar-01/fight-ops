import {
  useContext,
} from 'react'

import {
  useMutation,
} from '@tanstack/react-query'

import {
  AuthContext,
} from '../auth/AuthContext'

import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
  verifyPasswordReset,
} from '../services/auth.service'

import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyPasswordResetInput,
} from '../types/auth'

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    )

  if (!context) {
    throw new Error(
      'useAuth must be used inside AuthProvider.',
    )
  }

  return context
}

export function useLogin() {
  const {
    setAuthenticatedSession,
  } =
    useAuth()

  return useMutation({
    mutationFn: (
      input: LoginInput,
    ) =>
      login(input),

    onSuccess(data) {
      setAuthenticatedSession(
        data.accessToken,
        data.user,
      )
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (
      input: RegisterInput,
    ) =>
      register(input),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (
      input: ForgotPasswordInput,
    ) =>
      requestPasswordReset(
        input,
      ),
  })
}

export function useVerifyPasswordReset() {
  return useMutation({
    mutationFn: (
      input: VerifyPasswordResetInput,
    ) =>
      verifyPasswordReset(
        input,
      ),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (
      input: ResetPasswordInput,
    ) =>
      resetPassword(
        input,
      ),
  })
}