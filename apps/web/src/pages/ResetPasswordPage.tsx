import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  useResetPassword,
} from '../hooks/useAuth'

import {
  ApiError,
} from '../services/api'

interface ResetPasswordState {
  email?: string
  resetToken?: string
}

export function ResetPasswordPage() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const resetMutation =
    useResetPassword()

  const state =
    location.state as
      | ResetPasswordState
      | null

  const email =
    state?.email ?? ''

  const resetToken =
    state?.resetToken ?? ''

  const [
    password,
    setPassword,
  ] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] =
    useState('')

  const [
    formError,
    setFormError,
  ] =
    useState<
      string | null
    >(null)

  useEffect(() => {
    if (!resetToken) {
      navigate(
        '/forgot-password',
        {
          replace: true,
        },
      )
    }
  }, [
    navigate,
    resetToken,
  ])

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setFormError(null)

    if (
      password.length < 8
    ) {
      setFormError(
        'A nova senha deve possuir pelo menos 8 caracteres.',
      )

      return
    }

    if (
      password !==
      confirmPassword
    ) {
      setFormError(
        'As senhas informadas não são iguais.',
      )

      return
    }

    try {
      await resetMutation.mutateAsync({
        resetToken,
        newPassword:
          password,
      })

      navigate(
        '/login',
        {
          replace: true,

          state: {
            passwordReset:
              true,
          },
        },
      )
    } catch (error) {
      if (
        error instanceof ApiError
      ) {
        setFormError(
          error.message,
        )

        return
      }

      setFormError(
        'Não foi possível redefinir sua senha.',
      )
    }
  }

  if (!resetToken) {
    return null
  }

  return (
    <main
      className="auth-page"
      data-testid="reset-password-page"
    >
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <Link
            to="/"
            className="brand"
            data-testid="reset-password-logo-link"
          >
            <span className="brand-mark">
              FO
            </span>

            <span className="brand-text">
              FightOps
            </span>
          </Link>

          <div>
            <span className="eyebrow">
              Nova senha
            </span>

            <h1>
              Recupere seu acesso.
              <span>
                {' '}
                Com segurança.
              </span>
            </h1>

            <p>
              Defina uma nova senha
              para sua conta FightOps.
            </p>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-heading">
              <h2
                data-testid="reset-password-title"
              >
                Criar nova senha
              </h2>

              {email ? (
                <p>
                  Conta: {email}
                </p>
              ) : null}
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              data-testid="reset-password-form"
            >
              <div className="form-field">
                <label htmlFor="password">
                  Nova senha
                </label>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo de 8 caracteres"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={password}
                  disabled={
                    resetMutation.isPending
                  }
                  data-testid="reset-password-input"
                  onChange={(
                    event,
                  ) => {
                    setPassword(
                      event.target.value,
                    )
                  }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">
                  Confirmar nova senha
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={confirmPassword}
                  disabled={
                    resetMutation.isPending
                  }
                  data-testid="reset-password-confirm-input"
                  onChange={(
                    event,
                  ) => {
                    setConfirmPassword(
                      event.target.value,
                    )
                  }}
                />
              </div>

              {formError ? (
                <div
                  className="form-error"
                  role="alert"
                  data-testid="reset-password-error"
                >
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                className="button button-primary auth-submit"
                disabled={
                  resetMutation.isPending
                }
                data-testid="reset-password-submit-button"
              >
                {resetMutation.isPending
                  ? 'Alterando senha...'
                  : 'Alterar senha'}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}