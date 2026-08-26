import {
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  useForgotPassword,
} from '../hooks/useAuth'

import {
  ApiError,
} from '../services/api'

export function ForgotPasswordPage() {
  const navigate =
    useNavigate()

  const forgotPasswordMutation =
    useForgotPassword()

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    formError,
    setFormError,
  ] =
    useState<
      string | null
    >(null)

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setFormError(null)

    try {
      await forgotPasswordMutation.mutateAsync({
        email:
          email.trim(),
      })

      navigate(
        '/verify-reset-code',
        {
          state: {
            email:
              email.trim(),
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
        'Não foi possível solicitar a recuperação de senha.',
      )
    }
  }

  return (
    <main
      className="auth-page"
      data-testid="forgot-password-page"
    >
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <Link
            to="/"
            className="brand"
            data-testid="forgot-password-logo-link"
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
              Recuperação de acesso
            </span>

            <h1>
              Esqueceu sua senha?
              <span>
                {' '}
                Vamos resolver.
              </span>
            </h1>

            <p>
              Informe o e-mail
              cadastrado na sua conta.
              Enviaremos um código de
              segurança para continuar.
            </p>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-heading">
              <h2
                data-testid="forgot-password-title"
              >
                Recuperar senha
              </h2>

              <p>
                Informe seu e-mail para
                receber o código.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              data-testid="forgot-password-form"
            >
              <div className="form-field">
                <label htmlFor="email">
                  E-mail
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  autoComplete="email"
                  required
                  value={email}
                  disabled={
                    forgotPasswordMutation.isPending
                  }
                  data-testid="forgot-password-email-input"
                  onChange={(
                    event,
                  ) => {
                    setEmail(
                      event.target.value,
                    )
                  }}
                />
              </div>

              {formError ? (
                <div
                  className="form-error"
                  role="alert"
                  data-testid="forgot-password-error"
                >
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                className="button button-primary auth-submit"
                disabled={
                  forgotPasswordMutation.isPending
                }
                data-testid="forgot-password-submit-button"
              >
                {forgotPasswordMutation.isPending
                  ? 'Enviando...'
                  : 'Enviar código'}
              </button>
            </form>

            <Link
              to="/login"
              className="auth-back-link"
              data-testid="forgot-password-back-login-link"
            >
              Voltar para o login
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}