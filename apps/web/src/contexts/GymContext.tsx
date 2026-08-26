import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import type {
  ReactNode,
} from 'react'

import {
  getMyGyms,
} from '../services/gym.service'

import type {
  Gym,
} from '../types/gym'

const ACTIVE_GYM_STORAGE_KEY =
  'fightops.activeGymId'

interface GymContextValue {
  gyms: Gym[]

  activeGym: Gym | null

  isLoadingGyms: boolean

  gymError: string | null

  selectGym: (
    gymId: string,
  ) => void

  refreshGyms:
    () => Promise<void>
}

const GymContext =
  createContext<
    GymContextValue | undefined
  >(undefined)

interface GymProviderProps {
  children: ReactNode
}

export function GymProvider({
  children,
}: GymProviderProps) {
  const [
    gyms,
    setGyms,
  ] =
    useState<Gym[]>([])

  const [
    activeGym,
    setActiveGym,
  ] =
    useState<Gym | null>(
      null,
    )

  const [
    isLoadingGyms,
    setIsLoadingGyms,
  ] =
    useState(true)

  const [
    gymError,
    setGymError,
  ] =
    useState<string | null>(
      null,
    )

  const selectGym =
    useCallback(
      (
        gymId: string,
      ) => {
        const gym =
          gyms.find(
            (item) =>
              item.id ===
              gymId,
          )

        if (!gym) {
          return
        }

        setActiveGym(
          gym,
        )

        localStorage.setItem(
          ACTIVE_GYM_STORAGE_KEY,
          gym.id,
        )
      },
      [
        gyms,
      ],
    )

  const refreshGyms =
    useCallback(
      async () => {
        setIsLoadingGyms(
          true,
        )

        setGymError(
          null,
        )

        try {
          const response =
            await getMyGyms()

          const loadedGyms =
            response.gyms

          setGyms(
            loadedGyms,
          )

          if (
            loadedGyms.length ===
            0
          ) {
            setActiveGym(
              null,
            )

            localStorage.removeItem(
              ACTIVE_GYM_STORAGE_KEY,
            )

            return
          }

          const storedGymId =
            localStorage.getItem(
              ACTIVE_GYM_STORAGE_KEY,
            )

          const storedGym =
            storedGymId
              ? loadedGyms.find(
                  (gym) =>
                    gym.id ===
                    storedGymId,
                )
              : undefined

          const nextActiveGym =
            storedGym ??
            loadedGyms[0]

          if (!nextActiveGym) {
            setActiveGym(
              null,
            )

            localStorage.removeItem(
              ACTIVE_GYM_STORAGE_KEY,
            )

            return
          }

          setActiveGym(
            nextActiveGym,
          )

          localStorage.setItem(
            ACTIVE_GYM_STORAGE_KEY,
            nextActiveGym.id,
          )
        } catch {
          setGyms(
            [],
          )

          setActiveGym(
            null,
          )

          localStorage.removeItem(
            ACTIVE_GYM_STORAGE_KEY,
          )

          setGymError(
            'Não foi possível carregar suas academias.',
          )
        } finally {
          setIsLoadingGyms(
            false,
          )
        }
      },
      [],
    )

  useEffect(
    () => {
      void refreshGyms()
    },
    [
      refreshGyms,
    ],
  )

  const value =
    useMemo<GymContextValue>(
      () => ({
        gyms,
        activeGym,
        isLoadingGyms,
        gymError,
        selectGym,
        refreshGyms,
      }),
      [
        gyms,
        activeGym,
        isLoadingGyms,
        gymError,
        selectGym,
        refreshGyms,
      ],
    )

  return (
    <GymContext.Provider
      value={value}
    >
      {children}
    </GymContext.Provider>
  )
}

export function useGym() {
  const context =
    useContext(
      GymContext,
    )

  if (!context) {
    throw new Error(
      'useGym deve ser utilizado dentro de GymProvider.',
    )
  }

  return context
}