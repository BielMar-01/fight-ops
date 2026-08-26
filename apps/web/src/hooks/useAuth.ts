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
} from '../services/auth.service'

import type {
  LoginInput,
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
  } = useAuth()

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