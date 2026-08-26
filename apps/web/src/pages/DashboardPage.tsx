import {
  useState,
} from 'react'

import {
  useNavigate,
} from 'react-router-dom'

import {
  useAuth,
} from '../hooks/useAuth'

export function DashboardPage() {
  const navigate =
    useNavigate()

  const {
    user,
    isLoggingOut,
    logout,
  } =
    useAuth()

  const [
    logoutError,
    setLogoutError,
  ] =
    useState<
      string | null
    >(null)

  async function handleLogout() {
    setLogoutError(null)

    try {
      await logout()

      navigate(
        '/login',
        {
          replace: true,
        },
      )
    } catch {
      setLogoutError(
        'Não foi possível encerrar a sessão corretamente.',
      )
    }
  }

  if (!user) {
    return null
  }

  return (
    <main
      className="dashboard-placeholder-page"
      data-testid="dashboard-page"
    >
      <span className="eyebrow">
        FightOps
      </span>

      <h1>
        Olá, {user.name}.
      </h1>

      <p>
        Sua sessão está autenticada
        e protegida.
      </p>

      <div
        className="session-debug-card"
        data-testid="dashboard-session-user"
      >
        <div>
          <span>Nome</span>

          <strong>
            {user.name}
          </strong>
        </div>

        <div>
          <span>E-mail</span>

          <strong>
            {user.email}
          </strong>
        </div>

        <div>
          <span>
            Perfil global
          </span>

          <strong>
            {user.globalRole}
          </strong>
        </div>
      </div>

      {logoutError ? (
        <div
          className="form-error"
          role="alert"
          data-testid="dashboard-logout-error"
        >
          {logoutError}
        </div>
      ) : null}

      <button
        type="button"
        className="button button-secondary"
        disabled={
          isLoggingOut
        }
        data-testid="dashboard-logout-button"
        onClick={() => {
          void handleLogout()
        }}
      >
        {isLoggingOut
          ? 'Saindo...'
          : 'Sair'}
      </button>
    </main>
  )
}