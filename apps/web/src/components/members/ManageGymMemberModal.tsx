import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ApiError,
} from '../../services/api'

import {
  updateGymMemberRole,
  updateGymMemberStatus,
} from '../../services/gym-member.service'

import type {
  GymRole,
} from '../../types/gym'

import type {
  GymMember,
} from '../../types/gym-member'

interface ManageGymMemberModalProps {
  gymId: string
  actorRole: GymRole
  member: GymMember
  onClose: () => void
  onUpdated: () => Promise<void>
}

export function ManageGymMemberModal({
  gymId,
  actorRole,
  member,
  onClose,
  onUpdated,
}: ManageGymMemberModalProps) {
  const [
    role,
    setRole,
  ] =
    useState<GymRole>(
      member.role,
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
    useState<string | null>(
      null,
    )

  const canManageRole =
    useMemo(
      () => {
        if (
          member.role ===
          'OWNER'
        ) {
          return false
        }

        if (
          actorRole ===
          'OWNER'
        ) {
          return true
        }

        if (
          actorRole ===
          'ADMIN'
        ) {
          return (
            member.role !==
            'ADMIN'
          )
        }

        return false
      },
      [
        actorRole,
        member.role,
      ],
    )

  const availableRoles =
    useMemo(
      () => {
        if (
          actorRole ===
          'OWNER'
        ) {
          return [
            'ADMIN',
            'RECEPTIONIST',
            'PROFESSOR',
            'STUDENT',
          ] as GymRole[]
        }

        return [
          'RECEPTIONIST',
          'PROFESSOR',
          'STUDENT',
        ] as GymRole[]
      },
      [
        actorRole,
      ],
    )

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

  async function handleSaveRole() {
    setError(
      null,
    )

    if (
      !canManageRole
    ) {
      setError(
        'Você não possui permissão para alterar este papel.',
      )

      return
    }

    if (
      role ===
      member.role
    ) {
      onClose()

      return
    }

    setIsSubmitting(
      true,
    )

    try {
      await updateGymMemberRole(
        gymId,
        member.id,
        {
          role,
        },
      )

      await onUpdated()

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
        'Não foi possível alterar o papel do membro.',
      )
    } finally {
      setIsSubmitting(
        false,
      )
    }
  }

  async function handleStatusChange() {
    setError(
      null,
    )

    setIsSubmitting(
      true,
    )

    try {
      await updateGymMemberStatus(
        gymId,
        member.id,
        {
          active:
            !member.active,
        },
      )

      await onUpdated()

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
        'Não foi possível alterar o status do membro.',
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
      data-testid="member-manage-modal-backdrop"
      onMouseDown={(event) => {
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
        aria-labelledby="member-manage-title"
        data-testid="member-manage-modal"
      >
        <header className="member-modal-header">
          <div>
            <span className="eyebrow">
              Gestão de membro
            </span>

            <h2
              id="member-manage-title"
            >
              {member.user.name}
            </h2>

            <p>
              {member.user.email}
            </p>
          </div>

          <button
            type="button"
            className="member-modal-close"
            aria-label="Fechar"
            disabled={
              isSubmitting
            }
            data-testid="member-manage-close-button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <div className="member-modal-form">
          <label className="member-form-field">
            <span>
              Papel na academia
            </span>

            <select
              value={role}
              disabled={
                isSubmitting ||
                !canManageRole
              }
              data-testid="member-manage-role-select"
              onChange={(event) => {
                const selectedRole =
                  event.target.value as GymRole

                setRole(
                  selectedRole,
                )
              }}
            >
              {availableRoles.map(
                (
                  availableRole,
                ) => (
                  <option
                    key={
                      availableRole
                    }
                    value={
                      availableRole
                    }
                  >
                    {
                      availableRole ===
                      'ADMIN'
                        ? 'Administrador'
                        : availableRole ===
                          'RECEPTIONIST'
                          ? 'Recepção'
                          : availableRole ===
                            'PROFESSOR'
                            ? 'Professor'
                            : 'Aluno'
                    }
                  </option>
                ),
              )}

              {member.role ===
              'OWNER' ? (
                <option value="OWNER">
                  Proprietário
                </option>
              ) : null}
            </select>
          </label>

          {!canManageRole ? (
            <div className="member-role-help">
              <p>
                Este papel não pode ser
                alterado por sua conta.
              </p>
            </div>
          ) : null}

          <div className="member-management-status">
            <div>
              <span>
                Status atual
              </span>

              <strong>
                {member.active
                  ? 'Ativo'
                  : 'Inativo'}
              </strong>
            </div>

            {member.role !==
            'OWNER' ? (
              <button
                type="button"
                className={
                  member.active
                    ? 'button member-danger-button'
                    : 'button button-secondary'
                }
                disabled={
                  isSubmitting
                }
                data-testid="member-manage-status-button"
                onClick={() => {
                  void handleStatusChange()
                }}
              >
                {member.active
                  ? 'Inativar vínculo'
                  : 'Reativar vínculo'}
              </button>
            ) : null}
          </div>

          {error ? (
            <div
              className="form-error"
              role="alert"
              data-testid="member-manage-error"
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
              data-testid="member-manage-cancel-button"
              onClick={
                onClose
              }
            >
              Cancelar
            </button>

            <button
              type="button"
              className="button button-primary"
              disabled={
                isSubmitting ||
                !canManageRole ||
                role ===
                  member.role
              }
              data-testid="member-manage-save-role-button"
              onClick={() => {
                void handleSaveRole()
              }}
            >
              {isSubmitting
                ? 'Salvando...'
                : 'Salvar papel'}
            </button>
          </footer>
        </div>
      </section>
    </div>
  )
}