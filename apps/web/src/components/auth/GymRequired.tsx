import type {
  ReactNode,
} from 'react'

import {
  GymOnboardingPage,
} from '../../pages/GymOnboardingPage'

import {
  useGym,
} from '../../contexts/GymContext'

import '../../styles/gym-onboarding.css'

interface GymRequiredProps {
  children: ReactNode
}

export function GymRequired({
  children,
}: GymRequiredProps) {
  const {
    gyms,
    activeGym,
    isLoadingGyms,
    gymError,
    refreshGyms,
  } = useGym()

  if (isLoadingGyms) {
    return (
      <main
        className="app-state-page"
        data-testid="gym-loading"
      >
        <div className="app-state-card">
          <span
            className="app-loading-spinner"
            aria-hidden="true"
          />

          <h1>
            Carregando academia
          </h1>

          <p>
            Estamos preparando seu ambiente.
          </p>
        </div>
      </main>
    )
  }

  if (gymError) {
    return (
      <main
        className="app-state-page"
        data-testid="gym-error"
      >
        <div className="app-state-card">
          <h1>
            Não foi possível carregar sua academia
          </h1>

          <p>
            {gymError}
          </p>

          <button
            type="button"
            className="button button-primary"
            data-testid="gym-retry-button"
            onClick={() => {
              void refreshGyms()
            }}
          >
            Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  if (
    gyms.length === 0 ||
    !activeGym
  ) {
    return (
      <GymOnboardingPage />
    )
  }

  return children
}