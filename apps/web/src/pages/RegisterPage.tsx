import {
  useState,
} from 'react'

import {
  Link,
  useNavigate,
} from 'react-router-dom'

import {
  useRegister,
} from '../hooks/useAuth'

import {
  ApiError,
} from '../services/api'

export function RegisterPage() {
  const navigate =
    useNavigate()

  const registerMutation =
    useRegister()

  const [
    name,
    setName,
  ] =
    useState('')

  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    phone,
    setPhone,
  ] =
    useState('')

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

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setFormError(null)

    if (
      password !==
      confirmPassword
    ) {
      setFormError(
        'As senhas informadas não são iguais.',
      )

      return
    }

    if (
      password.length < 8
    ) {
      setFormError(
        'A senha deve possuir pelo menos 8 caracteres.',
      )

      return
    }

    try {
      await registerMutation.mutateAsync({
        name:
          name.trim(),

        email:
          email.trim(),

        password,

        phone:
          phone.trim()
            ? phone.trim()
            : undefined,
      })

      navigate(
        '/login',
        {
          replace: true,

          state: {
            accountCreated:
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
        'Não foi possível criar sua conta. Tente novamente.',
      )
    }
  }

  return (
    <main
      className="auth-page"
      data-testid="register-page"
    >
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <Link
            to="/"
            className="brand"
            data-testid="register-logo-link"
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
              Comece agora
            </span>

            <h1>
              Organize sua academia.
              <span>
                {' '}
                Evolua sua operação.
              </span>
            </h1>

            <p>
              Crie sua conta no
              FightOps e prepare sua
              academia para uma gestão
              mais simples, organizada e
              profissional.
            </p>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-heading">
              <h2
                data-testid="register-title"
              >
                Criar conta
              </h2>

              <p>
                Preencha seus dados para
                começar.
              </p>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              data-testid="register-form"
            >
              <div className="form-field">
                <label htmlFor="name">
                  Nome
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome"
                  autoComplete="name"
                  minLength={3}
                  maxLength={150}
                  required
                  value={name}
                  disabled={
                    registerMutation.isPending
                  }
                  data-testid="register-name-input"
                  onChange={(
                    event,
                  ) => {
                    setName(
                      event.target.value,
                    )
                  }}
                />
              </div>

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
                    registerMutation.isPending
                  }
                  data-testid="register-email-input"
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
                <label htmlFor="phone">
                  Telefone
                  <span className="field-optional">
                    {' '}
                    (opcional)
                  </span>
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  autoComplete="tel"
                  value={phone}
                  disabled={
                    registerMutation.isPending
                  }
                  data-testid="register-phone-input"
                  onChange={(
                    event,
                  ) => {
                    setPhone(
                      event.target.value,
                    )
                  }}
                />
              </div>

              <div className="form-field">
                <label htmlFor="password">
                  Senha
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
                    registerMutation.isPending
                  }
                  data-testid="register-password-input"
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
                  Confirmar senha
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repita sua senha"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                  value={confirmPassword}
                  disabled={
                    registerMutation.isPending
                  }
                  data-testid="register-confirm-password-input"
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
                  data-testid="register-error"
                >
                  {formError}
                </div>
              ) : null}

              <button
                type="submit"
                className="button button-primary auth-submit"
                disabled={
                  registerMutation.isPending
                }
                data-testid="register-submit-button"
              >
                {registerMutation.isPending
                  ? 'Criando conta...'
                  : 'Criar conta'}
              </button>
            </form>

            <p className="auth-footer-text">
              Já possui uma conta?{' '}

              <Link
                to="/login"
                data-testid="register-login-link"
              >
                Entrar
              </Link>
            </p>

            <Link
              to="/"
              className="auth-back-link"
              data-testid="register-back-home-link"
            >
              Voltar para o início
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}