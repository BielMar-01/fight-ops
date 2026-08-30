import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import {
  clearAccessToken,
  setAccessToken,
} from './auth-token'

import {
  subscribeToSessionExpired,
} from './auth-session-events'

import {
  getAuthenticatedUser,
  logoutSession,
  refreshSession,
} from '../services/auth.service'

import type {
  AuthenticatedUser,
  AuthUser,
} from '../types/auth'

interface AuthContextValue {
  user:
    | AuthenticatedUser
    | AuthUser
    | null

  isAuthenticated: boolean

  isInitializing: boolean

  isLoggingOut: boolean

  setAuthenticatedSession: (
    accessToken: string,
    user: AuthUser,
  ) => void

  clearAuthenticatedSession:
    () => void

  restoreSession:
    () => Promise<void>

  logout:
    () => Promise<void>
}

export const AuthContext =
  createContext<
    AuthContextValue
    | undefined
  >(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] =
    useState<
      | AuthenticatedUser
      | AuthUser
      | null
    >(null)

  const [
    isInitializing,
    setIsInitializing,
  ] =
    useState(true)

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] =
    useState(false)

  const initializationStartedRef =
    useRef(false)

  const clearAuthenticatedSession =
    useCallback(() => {
      clearAccessToken()

      setUser(null)
    }, [])

  const setAuthenticatedSession =
    useCallback(
      (
        accessToken: string,
        authenticatedUser:
          AuthUser,
      ) => {
        setAccessToken(
          accessToken,
        )

        setUser(
          authenticatedUser,
        )
      },
      [],
    )

  const restoreSession =
    useCallback(
      async () => {
        try {
          const refreshResult =
            await refreshSession()

          setAccessToken(
            refreshResult.accessToken,
          )

          const meResult =
            await getAuthenticatedUser()

          setUser(
            meResult.user,
          )
        } catch {
          clearAuthenticatedSession()
        }
      },
      [
        clearAuthenticatedSession,
      ],
    )

  const logout =
    useCallback(
      async () => {
        setIsLoggingOut(
          true,
        )

        try {
          await logoutSession()
        } finally {
          clearAuthenticatedSession()

          setIsLoggingOut(
            false,
          )
        }
      },
      [
        clearAuthenticatedSession,
      ],
    )

  useEffect(() => {
    if (
      initializationStartedRef.current
    ) {
      return
    }

    initializationStartedRef.current =
      true

    async function initializeSession() {
      try {
        await restoreSession()
      } finally {
        setIsInitializing(
          false,
        )
      }
    }

    void initializeSession()
  }, [
    restoreSession,
  ])

  useEffect(() => {
    return subscribeToSessionExpired(
      () => {
        clearAuthenticatedSession()
      },
    )
  }, [
    clearAuthenticatedSession,
  ])

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,

        isAuthenticated:
          Boolean(user),

        isInitializing,

        isLoggingOut,

        setAuthenticatedSession,

        clearAuthenticatedSession,

        restoreSession,

        logout,
      }),
      [
        user,
        isInitializing,
        isLoggingOut,
        setAuthenticatedSession,
        clearAuthenticatedSession,
        restoreSession,
        logout,
      ],
    )

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}