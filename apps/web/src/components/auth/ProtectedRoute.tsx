import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import {
  useAuth,
} from '../../hooks/useAuth'

export function ProtectedRoute() {
  const location =
    useLocation()

  const {
    isAuthenticated,
    isInitializing,
  } =
    useAuth()

  if (isInitializing) {
    return (
      <main
        className="page-state"
        data-testid="protected-route-loading"
      >
        <div className="loading-spinner" />

        <p>
          Verificando sua sessão...
        </p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    )
  }

  return <Outlet />
}