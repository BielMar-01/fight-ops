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
  getStudentById,
  updateStudent,
  updateStudentStatus,
} from '../../services/student.service'

import type {
  Student,
  UpdateStudentInput,
} from '../../types/student'

interface ManageStudentModalProps {
  gymId: string
  studentId: string
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
    : null
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

export function ManageStudentModal({
  gymId,
  studentId,
  canEdit,
  onClose,
  onUpdated,
}: ManageStudentModalProps) {
  const [
    student,
    setStudent,
  ] =
    useState<Student | null>(
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
    emergencyContact,
    setEmergencyContact,
  ] = useState('')

  const [
    emergencyPhone,
    setEmergencyPhone,
  ] = useState('')

  const [
    joinedAt,
    setJoinedAt,
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
    isChangingStatus,
    setIsChangingStatus,
  ] = useState(false)

  const [
    isConfirmingStatus,
    setIsConfirmingStatus,
  ] = useState(false)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  function applyStudentValues(
    loadedStudent: Student,
  ) {
    setName(
      loadedStudent.name,
    )

    setEmail(
      loadedStudent.email ??
        '',
    )

    setPhone(
      loadedStudent.phone ??
        '',
    )

    setBirthDate(
      formatDateInput(
        loadedStudent.birthDate,
      ),
    )

    setEmergencyContact(
      loadedStudent
        .emergencyContact ??
        '',
    )

    setEmergencyPhone(
      loadedStudent
        .emergencyPhone ??
        '',
    )

    setJoinedAt(
      formatDateInput(
        loadedStudent.joinedAt,
      ),
    )

    setNotes(
      loadedStudent.notes ??
        '',
    )
  }

  useEffect(() => {
    let cancelled = false

    async function loadStudent() {
      try {
        setIsLoading(
          true,
        )

        setError(
          null,
        )

        const response =
          await getStudentById(
            gymId,
            studentId,
          )

        if (cancelled) {
          return
        }

        setStudent(
          response.student,
        )

        applyStudentValues(
          response.student,
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
          'Não foi possível carregar os dados do aluno.',
        )
      } finally {
        if (!cancelled) {
          setIsLoading(
            false,
          )
        }
      }
    }

    void loadStudent()

    return () => {
      cancelled = true
    }
  }, [
    gymId,
    studentId,
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

      if (
        isSubmitting ||
        isChangingStatus
      ) {
        return
      }

      if (
        isConfirmingStatus
      ) {
        setIsConfirmingStatus(
          false,
        )

        return
      }

      if (
        mode === 'edit' &&
        student
      ) {
        applyStudentValues(
          student,
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
    isChangingStatus,
    isConfirmingStatus,
    mode,
    student,
    onClose,
  ])

  const hasChanges =
    useMemo(() => {
      if (!student) {
        return false
      }

      return (
        name.trim() !==
          student.name.trim() ||
        email.trim() !==
          normalizeComparableValue(
            student.email,
          ) ||
        phone.trim() !==
          normalizeComparableValue(
            student.phone,
          ) ||
        birthDate !==
          formatDateInput(
            student.birthDate,
          ) ||
        emergencyContact.trim() !==
          normalizeComparableValue(
            student.emergencyContact,
          ) ||
        emergencyPhone.trim() !==
          normalizeComparableValue(
            student.emergencyPhone,
          ) ||
        joinedAt !==
          formatDateInput(
            student.joinedAt,
          ) ||
        notes.trim() !==
          normalizeComparableValue(
            student.notes,
          )
      )
    }, [
      student,
      name,
      email,
      phone,
      birthDate,
      emergencyContact,
      emergencyPhone,
      joinedAt,
      notes,
    ])

  function handleStartEdit() {
    if (
      !canEdit ||
      isSubmitting ||
      isChangingStatus
    ) {
      return
    }

    setError(
      null,
    )

    setIsConfirmingStatus(
      false,
    )

    setMode(
      'edit',
    )
  }

  function handleCancelEdit() {
    if (!student) {
      return
    }

    applyStudentValues(
      student,
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
      !student ||
      isSubmitting ||
      isChangingStatus ||
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
        'Informe o nome do aluno com pelo menos 2 caracteres.',
      )

      return
    }

    const input:
      UpdateStudentInput = {
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

        emergencyContact:
          normalizeOptionalValue(
            emergencyContact,
          ),

        emergencyPhone:
          normalizeOptionalValue(
            emergencyPhone,
          ),

        joinedAt:
          normalizeOptionalValue(
            joinedAt,
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
        await updateStudent(
          gymId,
          studentId,
          input,
        )

      setStudent(
        response.student,
      )

      applyStudentValues(
        response.student,
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
        'Não foi possível atualizar o aluno.',
      )
    } finally {
      setIsSubmitting(
        false,
      )
    }
  }

  async function handleConfirmStatusChange() {
    if (
      !student ||
      !canEdit ||
      isChangingStatus ||
      isSubmitting
    ) {
      return
    }

    setError(
      null,
    )

    setIsChangingStatus(
      true,
    )

    try {
      const response =
        await updateStudentStatus(
          gymId,
          studentId,
          {
            active:
              !student.active,
          },
        )

      setStudent(
        response.student,
      )

      applyStudentValues(
        response.student,
      )

      setIsConfirmingStatus(
        false,
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
        'Não foi possível alterar o status do aluno.',
      )
    } finally {
      setIsChangingStatus(
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
      className="student-modal-backdrop"
      role="presentation"
      data-testid="student-manage-modal-backdrop"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSubmitting &&
          !isChangingStatus
        ) {
          onClose()
        }
      }}
    >
      <section
        className="student-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-manage-modal-title"
        data-testid="student-manage-modal"
      >
        <header className="student-modal-header">
          <div>
            <span className="students-eyebrow">
              Gestão acadêmica
            </span>

            <h2
              id="student-manage-modal-title"
            >
              {isEditing
                ? 'Editar aluno'
                : 'Detalhes do aluno'}
            </h2>

            <p>
              {isEditing
                ? 'Atualize os dados cadastrais e operacionais do aluno.'
                : 'Consulte os dados cadastrais e informações operacionais.'}
            </p>
          </div>

          <button
            type="button"
            className="student-modal-close"
            aria-label="Fechar"
            disabled={
              isSubmitting ||
              isChangingStatus
            }
            data-testid="student-manage-close-button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        {isLoading ? (
          <div
            className="student-modal-state"
            data-testid="student-manage-loading"
          >
            Carregando dados do aluno...
          </div>
        ) : !student ? (
          <div
            className="student-modal-state student-modal-state-error"
            data-testid="student-manage-load-error"
          >
            {error ??
              'Aluno não encontrado.'}
          </div>
        ) : (
          <form
            className="student-modal-form"
            data-testid="student-manage-form"
            onSubmit={(
              event,
            ) => {
              void handleSubmit(
                event,
              )
            }}
          >
            <div className="student-detail-summary">
              <div className="student-detail-avatar">
                {student.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {student.name}
                </strong>

                <span
                  className={
                    student.active
                      ? 'student-status student-status-active'
                      : 'student-status student-status-inactive'
                  }
                  data-testid="student-manage-status"
                >
                  {student.active
                    ? 'Ativo'
                    : 'Inativo'}
                </span>
              </div>
            </div>

            <div className="student-form-grid">
              <label className="student-form-field student-form-field-full">
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
                  data-testid="student-manage-name-input"
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

              <label className="student-form-field">
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
                  data-testid="student-manage-email-input"
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

              <label className="student-form-field">
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
                  data-testid="student-manage-phone-input"
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

              <label className="student-form-field">
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
                  data-testid="student-manage-birth-date-input"
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

              <label className="student-form-field">
                <span>
                  Data de entrada
                </span>

                <input
                  type="date"
                  value={
                    joinedAt
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="student-manage-joined-at-input"
                  onChange={(
                    event,
                  ) => {
                    setJoinedAt(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="student-form-field">
                <span>
                  Contato de emergência
                </span>

                <input
                  type="text"
                  value={
                    emergencyContact
                  }
                  maxLength={
                    150
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="student-manage-emergency-contact-input"
                  onChange={(
                    event,
                  ) => {
                    setEmergencyContact(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="student-form-field">
                <span>
                  Telefone de emergência
                </span>

                <input
                  type="tel"
                  value={
                    emergencyPhone
                  }
                  maxLength={
                    30
                  }
                  disabled={
                    fieldsDisabled
                  }
                  data-testid="student-manage-emergency-phone-input"
                  onChange={(
                    event,
                  ) => {
                    setEmergencyPhone(
                      event.target
                        .value,
                    )
                  }}
                />
              </label>

              <label className="student-form-field student-form-field-full">
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
                  data-testid="student-manage-notes-input"
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

            <div className="student-detail-metadata">
              <div>
                <span>
                  ID do aluno
                </span>

                <strong>
                  {student.id}
                </strong>
              </div>

              <div>
                <span>
                  Criado em
                </span>

                <strong>
                  {new Date(
                    student.createdAt,
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
                    student.updatedAt,
                  ).toLocaleString(
                    'pt-BR',
                  )}
                </strong>
              </div>
            </div>

            {isConfirmingStatus ? (
              <div
                className="student-status-confirmation"
                data-testid="student-status-confirmation"
              >
                <div>
                  <strong>
                    {student.active
                      ? 'Inativar aluno?'
                      : 'Ativar aluno?'}
                  </strong>

                  <p>
                    {student.active
                      ? 'O aluno ficará inativo, mas continuará armazenado no histórico da academia.'
                      : 'O aluno voltará a aparecer como ativo nas operações da academia.'}
                  </p>
                </div>

                <div className="student-status-confirmation-actions">
                  <button
                    type="button"
                    className="students-button students-button-secondary"
                    disabled={
                      isChangingStatus
                    }
                    data-testid="student-status-cancel-button"
                    onClick={() => {
                      setIsConfirmingStatus(
                        false,
                      )
                    }}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className={
                      student.active
                        ? 'students-button students-button-danger'
                        : 'students-button students-button-success'
                    }
                    disabled={
                      isChangingStatus
                    }
                    data-testid="student-status-confirm-button"
                    onClick={() => {
                      void handleConfirmStatusChange()
                    }}
                  >
                    {isChangingStatus
                      ? 'Alterando...'
                      : student.active
                        ? 'Confirmar inativação'
                        : 'Confirmar ativação'}
                  </button>
                </div>
              </div>
            ) : null}

            {error ? (
              <div
                className="student-form-error"
                role="alert"
                data-testid="student-manage-error"
              >
                {error}
              </div>
            ) : null}

            <footer className="student-modal-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="students-button students-button-secondary"
                    disabled={
                      isSubmitting
                    }
                    data-testid="student-manage-cancel-edit-button"
                    onClick={
                      handleCancelEdit
                    }
                  >
                    Cancelar edição
                  </button>

                  <button
                    type="submit"
                    className="students-button students-button-primary"
                    disabled={
                      isSubmitting ||
                      !hasChanges
                    }
                    data-testid="student-manage-save-button"
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
                    className="students-button students-button-secondary"
                    disabled={
                      isChangingStatus
                    }
                    data-testid="student-manage-close-footer-button"
                    onClick={
                      onClose
                    }
                  >
                    Fechar
                  </button>

                  {canEdit ? (
                    <>
                      <button
                        type="button"
                        className={
                          student.active
                            ? 'students-button students-button-danger-outline'
                            : 'students-button students-button-success-outline'
                        }
                        disabled={
                          isChangingStatus
                        }
                        data-testid="student-manage-status-button"
                        onClick={() => {
                          setError(
                            null,
                          )

                          setIsConfirmingStatus(
                            true,
                          )
                        }}
                      >
                        {student.active
                          ? 'Inativar aluno'
                          : 'Ativar aluno'}
                      </button>

                      <button
                        type="button"
                        className="students-button students-button-primary"
                        disabled={
                          isChangingStatus
                        }
                        data-testid="student-manage-edit-button"
                        onClick={
                          handleStartEdit
                        }
                      >
                        Editar aluno
                      </button>
                    </>
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