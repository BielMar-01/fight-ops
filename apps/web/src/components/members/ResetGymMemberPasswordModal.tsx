import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  PasswordInput,
} from '../auth/PasswordInput'

import {
  ApiError,
} from '../../services/api'

import {
  resetGymMemberPassword,
} from '../../services/gym-member.service'

import type {
  GymMember,
} from '../../types/gym-member'

interface ResetGymMemberPasswordModalProps {
  gymId: string
  member: GymMember
  onBack: () => void
  onCompleted: () => void
}

function validatePassword(
  password: string,
  confirmPassword: string,
) {
  if (
    password.length < 8
  ) {
    return 'A senha deve possuir pelo menos 8 caracteres.'
  }

  if (
    password.length > 128
  ) {
    return 'A senha deve possuir no máximo 128 caracteres.'
  }

  if (
    !/[a-z]/.test(
      password,
    )
  ) {
    return 'A senha deve possuir pelo menos uma letra minúscula.'
  }

  if (
    !/[A-Z]/.test(
      password,
    )
  ) {
    return 'A senha deve possuir pelo menos uma letra maiúscula.'
  }

  if (
    !/\d/.test(
      password,
    )
  ) {
    return 'A senha deve possuir pelo menos um número.'
  }

  if (
    password !==
    confirmPassword
  ) {
    return 'As senhas não coincidem.'
  }

  return null
}

export function ResetGymMemberPasswordModal({
  gymId,
  member,
  onBack,
  onCompleted,
}: ResetGymMemberPasswordModalProps) {
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
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    success,
    setSuccess,
  ] =
    useState(false)

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key !==
          'Escape' ||
        isSubmitting
      ) {
        return
      }

      if (success) {
        onCompleted()

        return
      }

      onBack()
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    isSubmitting,
    success,
    onBack,
    onCompleted,
  ])

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(
      null,
    )

    const validationError =
      validatePassword(
        password,
        confirmPassword,
      )

    if (
      validationError
    ) {
      setError(
        validationError,
      )

      return
    }

    setIsSubmitting(
      true,
    )

    try {
      await resetGymMemberPassword(
        gymId,
        member.id,
        {
          password,
          confirmPassword,
        },
      )

      setPassword(
        '',
      )

      setConfirmPassword(
        '',
      )

      setSuccess(
        true,
      )
    } catch (caughtError) {
      if (
        caughtError instanceof
        ApiError
      ) {
        setError(
          caughtError.message,
        )

        return
      }

      setError(
        'Não foi possível redefinir a senha do usuário.',
      )
    } finally {
      setIsSubmitting(
        false,
      )
    }
  }

  if (success) {
    return (
      <div
        className="member-modal-backdrop"
        role="presentation"
        data-testid="member-password-reset-modal-backdrop"
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
            onCompleted()
          }
        }}
      >
        <section
          className="member-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="member-password-reset-success-title"
          data-testid="member-password-reset-success"
        >
          <header className="member-modal-header">
            <div>
              <span className="eyebrow">
                Segurança da conta
              </span>

              <h2
                id="member-password-reset-success-title"
              >
                Senha redefinida
              </h2>

              <p>
                A nova senha foi
                configurada para{' '}
                {member.user.name}.
              </p>
            </div>

            <button
              type="button"
              className="member-modal-close"
              aria-label="Fechar"
              data-testid="member-password-reset-success-close-button"
              onClick={
                onCompleted
              }
            >
              ×
            </button>
          </header>

          <div className="member-password-success">
            <div
              className="member-password-success-icon"
              aria-hidden="true"
            >
              ✓
            </div>

            <div>
              <strong>
                Alteração concluída
              </strong>

              <p>
                As sessões anteriores
                desse usuário foram
                encerradas. Ele deverá
                utilizar a nova senha
                para entrar novamente
                no FightOps.
              </p>
            </div>
          </div>

          <div className="member-password-security-note">
            <strong>
              Registro de segurança
            </strong>

            <p>
              Essa operação foi
              registrada na Auditoria
              da academia. A senha não
              é armazenada no histórico.
            </p>
          </div>

          <footer className="member-modal-actions member-password-single-action">
            <button
              type="button"
              className="button button-primary"
              data-testid="member-password-reset-finish-button"
              onClick={
                onCompleted
              }
            >
              Concluir
            </button>
          </footer>
        </section>
      </div>
    )
  }

  return (
    <div
      className="member-modal-backdrop"
      role="presentation"
      data-testid="member-password-reset-modal-backdrop"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSubmitting
        ) {
          onBack()
        }
      }}
    >
      <section
        className="member-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-password-reset-title"
        data-testid="member-password-reset-modal"
      >
        <header className="member-modal-header">
          <div>
            <span className="eyebrow">
              Segurança da conta
            </span>

            <h2
              id="member-password-reset-title"
            >
              Redefinir senha
            </h2>

            <p>
              Defina uma nova senha
              para {member.user.name}.
            </p>
          </div>

          <button
            type="button"
            className="member-modal-close"
            aria-label="Voltar"
            disabled={
              isSubmitting
            }
            data-testid="member-password-reset-close-button"
            onClick={
              onBack
            }
          >
            ×
          </button>
        </header>

        <form
          className="member-modal-form"
          onSubmit={
            handleSubmit
          }
        >
          <div className="member-password-target">
            <div className="member-avatar">
              {member.user.name
                .split(' ')
                .filter(
                  Boolean,
                )
                .slice(
                  0,
                  2,
                )
                .map(
                  (part) =>
                    part.charAt(
                      0,
                    ),
                )
                .join('')
                .toUpperCase()}
            </div>

            <div>
              <strong>
                {
                  member.user
                    .name
                }
              </strong>

              <span>
                {
                  member.user
                    .email
                }
              </span>
            </div>
          </div>

          <div className="member-password-warning">
            <strong>
              Atenção
            </strong>

            <p>
              Após a redefinição,
              todas as sessões atuais
              deste usuário serão
              encerradas.
            </p>
          </div>

          <label className="member-form-field">
            <span>
              Nova senha
            </span>

            <PasswordInput
              id="member-new-password"
              name="password"
              value={
                password
              }
              placeholder="Digite a nova senha"
              autoComplete="new-password"
              inputTestId="member-password-reset-password-input"
              toggleTestId="member-password-reset-password-toggle"
              disabled={
                isSubmitting
              }
              required
              minLength={
                8
              }
              maxLength={
                128
              }
              onChange={
                setPassword
              }
            />
          </label>

          <label className="member-form-field">
            <span>
              Confirmar nova senha
            </span>

            <PasswordInput
              id="member-confirm-password"
              name="confirmPassword"
              value={
                confirmPassword
              }
              placeholder="Digite novamente a senha"
              autoComplete="new-password"
              inputTestId="member-password-reset-confirm-input"
              toggleTestId="member-password-reset-confirm-toggle"
              disabled={
                isSubmitting
              }
              required
              minLength={
                8
              }
              maxLength={
                128
              }
              onChange={
                setConfirmPassword
              }
            />
          </label>

          <div className="member-password-rules">
            <strong>
              A senha deve conter:
            </strong>

            <ul>
              <li>
                pelo menos 8
                caracteres;
              </li>

              <li>
                uma letra maiúscula;
              </li>

              <li>
                uma letra minúscula;
              </li>

              <li>
                pelo menos um número.
              </li>
            </ul>
          </div>

          {error ? (
            <div
              className="form-error"
              role="alert"
              data-testid="member-password-reset-error"
            >
              {error}
            </div>
          ) : null}

          <footer className="member-modal-actions">
            <button
              type="button"
              className="button button-secondary"
              disabled={
                isSubmitting
              }
              data-testid="member-password-reset-back-button"
              onClick={
                onBack
              }
            >
              Voltar
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={
                isSubmitting
              }
              data-testid="member-password-reset-submit-button"
            >
              {isSubmitting
                ? 'Redefinindo...'
                : 'Redefinir senha'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}