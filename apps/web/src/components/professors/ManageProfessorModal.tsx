import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ApiError,
} from '../../services/api'

import {
  getProfessorById,
  updateProfessor,
} from '../../services/professor.service'

import type {
  Professor,
  UpdateProfessorInput,
} from '../../types/professor'

interface ManageProfessorModalProps {
  gymId: string
  professorId: string
  canEdit: boolean
  onClose: () => void
  onUpdated: () => Promise<void>
}

type ModalMode =
  | 'view'
  | 'edit'

function normalizeOptionalValue(
  value: string,
) {
  const normalized =
    value.trim()

  return normalized.length > 0
    ? normalized
    : undefined
}

function normalizeComparableValue(
  value: string | null,
) {
  return value?.trim() ?? ''
}

function formatDateInput(
  value: string | null,
) {
  if (!value) {
    return ''
  }

  return value.slice(
    0,
    10,
  )
}

export function ManageProfessorModal({
  gymId,
  professorId,
  canEdit,
  onClose,
  onUpdated,
}: ManageProfessorModalProps) {
  const [
    professor,
    setProfessor,
  ] =
    useState<Professor | null>(
      null,
    )

  const [
    mode,
    setMode,
  ] =
    useState<ModalMode>(
      'view',
    )

  const [
    name,
    setName,
  ] = useState('')

  const [
    email,
    setEmail,
  ] = useState('')

  const [
    phone,
    setPhone,
  ] = useState('')

  const [
    birthDate,
    setBirthDate,
  ] = useState('')

  const [
    hireDate,
    setHireDate,
  ] = useState('')

  const [
    bio,
    setBio,
  ] = useState('')

  const [
    notes,
    setNotes,
  ] = useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  function applyProfessorValues(
    loadedProfessor: Professor,
  ) {
    setName(
      loadedProfessor.name,
    )

    setEmail(
      loadedProfessor.email ??
        '',
    )

    setPhone(
      loadedProfessor.phone ??
        '',
    )

    setBirthDate(
      formatDateInput(
        loadedProfessor.birthDate,
      ),
    )

    setHireDate(
      formatDateInput(
        loadedProfessor.hireDate,
      ),
    )

    setBio(
      loadedProfessor.bio ??
        '',
    )

    setNotes(
      loadedProfessor.notes ??
        '',
    )
  }

  useEffect(() => {
    let cancelled = false

    async function loadProfessor() {
      try {
        setIsLoading(
          true,
        )

        setError(
          null,
        )

        const response =
          await getProfessorById(
            gymId,
            professorId,
          )

        if (cancelled) {
          return
        }

        setProfessor(
          response.professor,
        )

        applyProfessorValues(
          response.professor,
        )
      } catch (caughtError) {
        if (cancelled) {
          return
        }

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
          'Não foi possível carregar os dados do professor.',
        )
      } finally {
        if (!cancelled) {
          setIsLoading(
            false,
          )
        }
      }
    }

    void loadProfessor()

    return () => {
      cancelled = true
    }
  }, [
    gymId,
    professorId,
  ])

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key !==
        'Escape'
      ) {
        return
      }

      if (isSubmitting) {
        return
      }

      if (
        mode === 'edit' &&
        professor
      ) {
        applyProfessorValues(
          professor,
        )

        setError(
          null,
        )

        setMode(
          'view',
        )

        return
      }

      onClose()
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
    mode,
    professor,
    onClose,
  ])

  const hasChanges =
    useMemo(() => {
      if (!professor) {
        return false
      }

      return (
        name.trim() !==
          professor.name.trim() ||
        email.trim() !==
          normalizeComparableValue(
            professor.email,
          ) ||
        phone.trim() !==
          normalizeComparableValue(
            professor.phone,
          ) ||
        birthDate !==
          formatDateInput(
            professor.birthDate,
          ) ||
        hireDate !==
          formatDateInput(
            professor.hireDate,
          ) ||
        bio.trim() !==
          normalizeComparableValue(
            professor.bio,
          ) ||
        notes.trim() !==
          normalizeComparableValue(
            professor.notes,
          )
      )
    }, [
      professor,
      name,
      email,
      phone,
      birthDate,
      hireDate,
      bio,
      notes,
    ])

  function handleStartEdit() {
    if (
      !canEdit ||
      isSubmitting
    ) {
      return
    }

    setError(
      null,
    )

    setMode(
      'edit',
    )
  }

  function handleCancelEdit() {
    if (!professor) {
      return
    }

    applyProfessorValues(
      professor,
    )

    setError(
      null,
    )

    setMode(
      'view',
    )
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      mode !== 'edit' ||
      !canEdit ||
      !professor ||
      isSubmitting ||
      !hasChanges
    ) {
      return
    }

    setError(
      null,
    )

    const normalizedName =
      name.trim()

    if (
      normalizedName.length <
      2
    ) {
      setError(
        'Informe o nome do professor com pelo menos 2 caracteres.',
      )

      return
    }

    const input:
      UpdateProfessorInput = {
        name:
          normalizedName,

        email:
          normalizeOptionalValue(
            email,
          ),

        phone:
          normalizeOptionalValue(
            phone,
          ),

        birthDate:
          normalizeOptionalValue(
            birthDate,
          ),

        hireDate:
          normalizeOptionalValue(
            hireDate,
          ),

        bio:
          normalizeOptionalValue(
            bio,
          ),

        notes:
          normalizeOptionalValue(
            notes,
          ),
      }

    setIsSubmitting(
      true,
    )

    try {
      const response =
        await updateProfessor(
          gymId,
          professorId,
          input,
        )

      setProfessor(
        response.professor,
      )

      applyProfessorValues(
        response.professor,
      )

      setMode(
        'view',
      )

      await onUpdated()
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
        'Não foi possível atualizar o professor.',
      )
    } finally {
      setIsSubmitting(
        false,
      )
    }
  }

  const isEditing =
    mode === 'edit'

  const fieldsDisabled =
    !isEditing ||
    isSubmitting

  return (
    <div
      className="professor-modal-backdrop"
      role="presentation"
      data-testid="professor-manage-modal-backdrop"
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
        className="professor-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="professor-manage-modal-title"
        data-testid="professor-manage-modal"
      >
        <header className="professor-modal-header">
          <div>
            <span className="professors-eyebrow">
              Gestão acadêmica
            </span>

            <h2
              id="professor-manage-modal-title"
            >
              {isEditing
                ? 'Editar professor'
                : 'Detalhes do professor'}
            </h2>

            <p>
              {isEditing
                ? 'Atualize os dados profissionais e operacionais do professor.'
                : 'Consulte os dados cadastrais e profissionais.'}
            </p>
          </div>

          <button
            type="button"
            className="professor-modal-close"
            aria-label="Fechar"
            disabled={
              isSubmitting
            }
            data-testid="professor-manage-close-button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        {isLoading ? (
          <div
            className="professor-modal-state"
            data-testid="professor-manage-loading"
          >
            Carregando dados do professor...
          </div>
        ) : !professor ? (
          <div
            className="professor-modal-state professor-modal-state-error"
            data-testid="professor-manage-load-error"
          >
            {error ??
              'Professor não encontrado.'}
          </div>
        ) : (
          <form
            className="professor-modal-form"
            data-testid="professor-manage-form"
            onSubmit={(
              event,
            ) => {
              void handleSubmit(
                event,
              )
            }}
          >
            <div className="professor-detail-summary">
              <div className="professor-detail-avatar">
                {professor.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {professor.name}
                </strong>

                <span
                  className={
                    professor.active
                      ? 'professor-status professor-status-active'
                      : 'professor-status professor-status-inactive'
                  }
                  data-testid="professor-manage-status"
                >
                  {professor.active
                    ? 'Ativo'
                    : 'Inativo'}
                </span>
              </div>
            </div>

            <div className="professor-form-grid">
              <label className="professor-form-field professor-form-field-full">
                <span>
                  Nome *
                </span>

                <input
                  type="text"
                  value={name}
                  maxLength={
                    150
                  }
                  required
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="professor-manage-name-input"
                  onChange={(
                    event,
                  ) => {
                    setName(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="professor-form-field">
                <span>
                  E-mail
                </span>

                <input
                  type="email"
                  value={email}
                  maxLength={
                    255
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="professor-manage-email-input"
                  onChange={(
                    event,
                  ) => {
                    setEmail(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="professor-form-field">
                <span>
                  Telefone
                </span>

                <input
                  type="tel"
                  value={phone}
                  maxLength={
                    30
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="professor-manage-phone-input"
                  onChange={(
                    event,
                  ) => {
                    setPhone(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="professor-form-field">
                <span>
                  Data de nascimento
                </span>

                <input
                  type="date"
                  value={
                    birthDate
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="professor-manage-birth-date-input"
                  onChange={(
                    event,
                  ) => {
                    setBirthDate(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="professor-form-field">
                <span>
                  Data de contratação
                </span>

                <input
                  type="date"
                  value={
                    hireDate
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="professor-manage-hire-date-input"
                  onChange={(
                    event,
                  ) => {
                    setHireDate(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="professor-form-field professor-form-field-full">
                <span>
                  Bio
                </span>

                <textarea
                  value={bio}
                  rows={4}
                  maxLength={
                    5000
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="professor-manage-bio-input"
                  onChange={(
                    event,
                  ) => {
                    setBio(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="professor-form-field professor-form-field-full">
                <span>
                  Observações
                </span>

                <textarea
                  value={notes}
                  rows={4}
                  maxLength={
                    5000
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="professor-manage-notes-input"
                  onChange={(
                    event,
                  ) => {
                    setNotes(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>
            </div>

            <div className="professor-detail-metadata">
              <div>
                <span>
                  ID do professor
                </span>

                <strong>
                  {professor.id}
                </strong>
              </div>

              <div>
                <span>
                  Criado em
                </span>

                <strong>
                  {new Date(
                    professor.createdAt,
                  ).toLocaleString(
                    'pt-BR',
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Última atualização
                </span>

                <strong>
                  {new Date(
                    professor.updatedAt,
                  ).toLocaleString(
                    'pt-BR',
                  )}
                </strong>
              </div>
            </div>

            {error ? (
              <div
                className="professor-form-error"
                role="alert"
                data-testid="professor-manage-error"
              >
                {error}
              </div>
            ) : null}

            <footer className="professor-modal-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="professors-button professors-button-secondary"
                    disabled={
                      isSubmitting
                    }
                    data-testid="professor-manage-cancel-edit-button"
                    onClick={
                      handleCancelEdit
                    }
                  >
                    Cancelar edição
                  </button>

                  <button
                    type="submit"
                    className="professors-button professors-button-primary"
                    disabled={
                      isSubmitting ||
                      !hasChanges
                    }
                    data-testid="professor-manage-save-button"
                  >
                    {isSubmitting
                      ? 'Salvando...'
                      : 'Salvar alterações'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="professors-button professors-button-secondary"
                    data-testid="professor-manage-close-footer-button"
                    onClick={
                      onClose
                    }
                  >
                    Fechar
                  </button>

                  {canEdit ? (
                    <button
                      type="button"
                      className="professors-button professors-button-primary"
                      data-testid="professor-manage-edit-button"
                      onClick={
                        handleStartEdit
                      }
                    >
                      Editar professor
                    </button>
                  ) : null}
                </>
              )}
            </footer>
          </form>
        )}
      </section>
    </div>
  )
}