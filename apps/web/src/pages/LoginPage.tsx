import {
  useState,
} from 'react'

import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import type {
  Location,
} from 'react-router-dom'

import {
  PasswordInput,
} from '../components/auth/PasswordInput'

import {
  useLogin,
} from '../hooks/useAuth'

import {
  ApiError,
} from '../services/api'

interface LoginLocationState {
  from?: Location
  accountCreated?: boolean
  passwordReset?: boolean
}

export function LoginPage() {
  const navigate =
    useNavigate()

  const location =
    useLocation()

  const loginMutation =
    useLogin()

  const state =
    location.state as
      | LoginLocationState
      | null

  const accountCreated =
    Boolean(
      state?.accountCreated,
    )

  const passwordReset =
    Boolean(
      state?.passwordReset,
    )

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    password,
    setPassword,
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
      await loginMutation.mutateAsync({
        email:
          email.trim(),
        password,
      })

      const destination =
        state?.from?.pathname ??
        '/dashboard'

      navigate(
        destination,
        {
          replace: true,
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
        'Não foi possível entrar. Tente novamente.',
      )
    }
  }

  return (
    <main
      className="auth-page"
      data-testid="login-page"
    >
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <Link
            to="/"
            className="brand"
            data-testid="login-logo-link"
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
              Bem-vindo de volta
            </span>

            <h1>
              Sua academia.
              <span>
                {' '}
                Sob controle.
              </span>
            </h1>

            <p>
              Acesse sua conta para
              acompanhar alunos,
              turmas e toda a operação
              do seu centro de
              treinamento.
            </p>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-heading">
              <h2
                data-testid="login-title"
              >
                Entrar
              </h2>

              <p>
                Informe seus dados
                para acessar o
                FightOps.
              </p>
            </div>

            {accountCreated ? (
              <div
                className="form-success"
                role="status"
                data-testid="login-account-created-success"
              >
                Conta criada com
                sucesso. Agora faça
                login para continuar.
              </div>
            ) : null}

            {passwordReset ? (
              <div
                className="form-success"
                role="status"
                data-testid="login-password-reset-success"
              >
                Senha alterada com
                sucesso. Entre com sua
                nova senha.
              </div>
            ) : null}

            <form
              onSubmit={
                handleSubmit
              }
              data-testid="login-form"
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
                    loginMutation.isPending
                  }
                  data-testid="login-email-input"
                  onChange={(
                    event,
                  ) => {
                    setEmail(
                      event.target.value,
                    )
                  }}
                />
              </div>

              <div className="form-field">
                <div className="field-heading">
                  <label htmlFor="password">
                    Senha
                  </label>

                  <Link
                    to="/forgot-password"
                    data-testid="login-forgot-password-link"
                  >
                    Esqueci minha senha
                  </Link>
                </div>

                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  required
                  value={password}
                  disabled={
                    loginMutation.isPending
                  }
                  inputTestId="login-password-input"
                  toggleTestId="login-password-toggle"
                  onChange={setPassword}
                />
              </div>

              {formError ? (
                <div
                  className="form-error"
                  role="alert"
                  data-testid="login-error"
                >
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                className="button button-primary auth-submit"
                disabled={
                  loginMutation.isPending
                }
                data-testid="login-submit-button"
              >
                {loginMutation.isPending
                  ? 'Entrando...'
                  : 'Entrar'}
              </button>
            </form>

            <p className="auth-footer-text">
              Ainda não possui conta?{' '}

              <Link
                to="/register"
                data-testid="login-register-link"
              >
                Criar conta
              </Link>
            </p>

            <Link
              to="/"
              className="auth-back-link"
              data-testid="login-back-home-link"
            >
              Voltar para o início
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}