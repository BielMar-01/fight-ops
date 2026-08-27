import {
  useEffect,
  useState,
} from 'react'

import {
  ApiError,
} from '../../services/api'

import {
  addGymMember,
} from '../../services/gym-member.service'

import type {
  GymRole,
} from '../../types/gym'

import type {
  AddGymMemberInput,
} from '../../types/gym-member'

interface AddGymMemberModalProps {
  gymId: string

  actorRole: GymRole

  onClose: () => void

  onCreated: () => Promise<void>
}

export function AddGymMemberModal({
  gymId,
  actorRole,
  onClose,
  onCreated,
}: AddGymMemberModalProps) {
  const [
    email,
    setEmail,
  ] =
    useState('')

  const [
    role,
    setRole,
  ] =
    useState<
      AddGymMemberInput['role']
    >(
      'PROFESSOR',
    )

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  const canAddAdmin =
    actorRole ===
    'OWNER'

  useEffect(
    () => {
      function handleKeyDown(
        event: KeyboardEvent,
      ) {
        if (
          event.key ===
          'Escape' &&
          !isSubmitting
        ) {
          onClose()
        }
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
    },
    [
      isSubmitting,
      onClose,
    ],
  )

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(
      null,
    )

    const normalizedEmail =
      email
        .trim()
        .toLowerCase()

    if (!normalizedEmail) {
      setError(
        'Informe o e-mail do usuário.',
      )

      return
    }

    if (
      role ===
        'ADMIN' &&
      !canAddAdmin
    ) {
      setError(
        'Somente o proprietário pode adicionar administradores.',
      )

      return
    }

    setIsSubmitting(
      true,
    )

    try {
      await addGymMember(
        gymId,
        {
          email:
            normalizedEmail,

          role,
        },
      )

      await onCreated()

      onClose()
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
        'Não foi possível adicionar o membro.',
      )
    } finally {
      setIsSubmitting(
        false,
      )
    }
  }

  return (
    <div
      className="member-modal-backdrop"
      role="presentation"
      data-testid="member-add-modal-backdrop"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSubmitting
        ) {
          onClose()
        }
      }}
    >
      <section
        className="member-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-add-modal-title"
        data-testid="member-add-modal"
      >
        <header className="member-modal-header">
          <div>
            <span className="eyebrow">
              Gestão de equipe
            </span>

            <h2
              id="member-add-modal-title"
            >
              Adicionar membro
            </h2>

            <p>
              O usuário precisa possuir
              uma conta cadastrada no
              FightOps.
            </p>
          </div>

          <button
            type="button"
            className="member-modal-close"
            aria-label="Fechar"
            disabled={
              isSubmitting
            }
            data-testid="member-add-close-button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <form
          className="member-modal-form"
          data-testid="member-add-form"
          onSubmit={(
            event,
          ) => {
            void handleSubmit(
              event,
            )
          }}
        >
          <label className="member-form-field">
            <span>
              E-mail
            </span>

            <input
              type="email"
              placeholder="usuario@exemplo.com"
              autoComplete="email"
              required
              value={email}
              disabled={
                isSubmitting
              }
              data-testid="member-add-email-input"
              onChange={(
                event,
              ) => {
                setEmail(
                  event.target.value,
                )
              }}
            />
          </label>

          <label className="member-form-field">
            <span>
              Papel na academia
            </span>

            <select
              value={role}
              disabled={
                isSubmitting
              }
              data-testid="member-add-role-select"
                onChange={(event) => {
                    const selectedRole =
                        event.target.value as AddGymMemberInput['role']

                    setRole(selectedRole)
                }}
            >
              {canAddAdmin ? (
                <option value="ADMIN">
                  Administrador
                </option>
              ) : null}

              <option value="RECEPTIONIST">
                Recepção
              </option>

              <option value="PROFESSOR">
                Professor
              </option>

              <option value="STUDENT">
                Aluno
              </option>
            </select>
          </label>

          <div className="member-role-help">
            {role ===
            'ADMIN' ? (
              <p>
                Administradores possuem
                acesso amplo à operação,
                mas não podem controlar
                propriedade da academia.
              </p>
            ) : null}

            {role ===
            'RECEPTIONIST' ? (
              <p>
                Recepção terá acesso às
                rotinas operacionais
                permitidas para esse
                perfil.
              </p>
            ) : null}

            {role ===
            'PROFESSOR' ? (
              <p>
                Professores terão acesso
                às funcionalidades
                relacionadas às suas
                atividades.
              </p>
            ) : null}

            {role ===
            'STUDENT' ? (
              <p>
                Alunos terão apenas o
                acesso destinado à
                experiência do aluno.
              </p>
            ) : null}
          </div>

          {error ? (
            <div
              className="form-error"
              role="alert"
              data-testid="member-add-error"
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
              data-testid="member-add-cancel-button"
              onClick={
                onClose
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={
                isSubmitting
              }
              data-testid="member-add-submit-button"
            >
              {isSubmitting
                ? 'Adicionando...'
                : 'Adicionar membro'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}