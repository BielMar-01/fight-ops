import {
  Navigate,
  Outlet,
} from 'react-router-dom'

import {
  useAuth,
} from '../../hooks/useAuth'

export function GuestRoute() {
  const {
    isAuthenticated,
    isInitializing,
  } =
    useAuth()

  if (isInitializing) {
    return (
      <main
        className="page-state"
        data-testid="guest-route-loading"
      >
        <div className="loading-spinner" />

        <p>
          Verificando sua sessão...
        </p>
      </main>
    )
  }

  if (isAuthenticated) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    )
  }

  return <Outlet />
}