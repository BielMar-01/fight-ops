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
  useVerifyPasswordReset,
} from '../hooks/useAuth'

import {
  ApiError,
} from '../services/api'

interface VerifyResetCodeState {
  email?: string
}

export function VerifyResetCodePage() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const verifyMutation =
    useVerifyPasswordReset()

  const state =
    location.state as
      | VerifyResetCodeState
      | null

  const email =
    state?.email ?? ''

  const [
    code,
    setCode,
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
    if (!email) {
      navigate(
        '/forgot-password',
        {
          replace: true,
        },
      )
    }
  }, [
    email,
    navigate,
  ])

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setFormError(null)

    if (
      code.length !== 6
    ) {
      setFormError(
        'Informe o código de 6 dígitos.',
      )

      return
    }

    try {
      const result =
        await verifyMutation.mutateAsync({
          email,
          code,
        })

      navigate(
        '/reset-password',
        {
          replace: true,

          state: {
            email,
            resetToken:
              result.resetToken,
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
        'Não foi possível validar o código informado.',
      )
    }
  }

  if (!email) {
    return null
  }

  return (
    <main
      className="auth-page"
      data-testid="verify-reset-code-page"
    >
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <Link
            to="/"
            className="brand"
            data-testid="verify-reset-code-logo-link"
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
              Código de segurança
            </span>

            <h1>
              Confira seu e-mail.
              <span>
                {' '}
                Falta pouco.
              </span>
            </h1>

            <p>
              Enviamos um código de
              6 dígitos para o e-mail
              informado.
            </p>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-heading">
              <h2
                data-testid="verify-reset-code-title"
              >
                Digite o código
              </h2>

              <p>
                Código enviado para:
              </p>

              <strong
                className="auth-email-highlight"
                data-testid="verify-reset-code-email"
              >
                {email}
              </strong>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              data-testid="verify-reset-code-form"
            >
              <div className="form-field">
                <label htmlFor="code">
                  Código
                </label>

                <input
                  id="code"
                  name="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  maxLength={6}
                  required
                  value={code}
                  disabled={
                    verifyMutation.isPending
                  }
                  className="reset-code-input"
                  data-testid="verify-reset-code-input"
                  onChange={(
                    event,
                  ) => {
                    const value =
                      event.target.value.replace(
                        /\D/g,
                        '',
                      )

                    setCode(
                      value,
                    )
                  }}
                />
              </div>

              {formError ? (
                <div
                  className="form-error"
                  role="alert"
                  data-testid="verify-reset-code-error"
                >
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                className="button button-primary auth-submit"
                disabled={
                  verifyMutation.isPending ||
                  code.length !== 6
                }
                data-testid="verify-reset-code-submit-button"
              >
                {verifyMutation.isPending
                  ? 'Validando...'
                  : 'Validar código'}
              </button>
            </form>

            <Link
              to="/forgot-password"
              className="auth-back-link"
              data-testid="verify-reset-code-back-link"
            >
              Solicitar outro código
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}