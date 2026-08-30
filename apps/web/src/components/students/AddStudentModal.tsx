import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  ApiError,
} from '../../services/api'

import {
  createStudent,
} from '../../services/student.service'

import type {
  CreateStudentInput,
} from '../../types/student'

interface AddStudentModalProps {
  gymId: string
  onClose: () => void
  onCreated: () => Promise<void>
}

function normalizeOptionalValue(
  value: string,
) {
  const normalized =
    value.trim()

  return normalized.length > 0
    ? normalized
    : null
}

export function AddStudentModal({
  gymId,
  onClose,
  onCreated,
}: AddStudentModalProps) {
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
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  )

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape' &&
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
  }, [
    isSubmitting,
    onClose,
  ])

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError(null)

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
      CreateStudentInput = {
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

        notes:
          normalizeOptionalValue(
            notes,
          ),

        joinedAt:
          normalizeOptionalValue(
            joinedAt,
          ),
      }

    setIsSubmitting(true)

    try {
      await createStudent(
        gymId,
        input,
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
        'Não foi possível cadastrar o aluno.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="student-modal-backdrop"
      role="presentation"
      data-testid="student-add-modal-backdrop"
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
        className="student-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-add-modal-title"
        data-testid="student-add-modal"
      >
        <header className="student-modal-header">
          <div>
            <span className="students-eyebrow">
              Gestão acadêmica
            </span>

            <h2
              id="student-add-modal-title"
            >
              Novo aluno
            </h2>

            <p>
              Cadastre os dados
              operacionais do aluno.
            </p>
          </div>

          <button
            type="button"
            className="student-modal-close"
            aria-label="Fechar"
            disabled={
              isSubmitting
            }
            data-testid="student-add-close-button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <form
          className="student-modal-form"
          data-testid="student-add-form"
          onSubmit={(
            event,
          ) => {
            void handleSubmit(
              event,
            )
          }}
        >
          <div className="student-form-grid">
            <label className="student-form-field student-form-field-full">
              <span>
                Nome *
              </span>

              <input
                type="text"
                value={name}
                disabled={
                  isSubmitting
                }
                required
                maxLength={
                  150
                }
                autoComplete="name"
                placeholder="Nome completo"
                data-testid="student-add-name-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  255
                }
                autoComplete="email"
                placeholder="aluno@email.com"
                data-testid="student-add-email-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  30
                }
                autoComplete="tel"
                placeholder="11999998888"
                data-testid="student-add-phone-input"
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
                  isSubmitting
                }
                data-testid="student-add-birth-date-input"
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
                  isSubmitting
                }
                data-testid="student-add-joined-at-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  150
                }
                placeholder="Nome do contato"
                data-testid="student-add-emergency-contact-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  30
                }
                placeholder="11988887777"
                data-testid="student-add-emergency-phone-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  5000
                }
                rows={4}
                placeholder="Informações adicionais sobre o aluno."
                data-testid="student-add-notes-input"
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

          {error ? (
            <div
              className="student-form-error"
              role="alert"
              data-testid="student-add-error"
            >
              {error}
            </div>
          ) : null}

          <footer className="student-modal-actions">
            <button
              type="button"
              className="students-button students-button-secondary"
              disabled={
                isSubmitting
              }
              data-testid="student-add-cancel-button"
              onClick={
                onClose
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="students-button students-button-primary"
              disabled={
                isSubmitting
              }
              data-testid="student-add-submit-button"
            >
              {isSubmitting
                ? 'Cadastrando...'
                : 'Cadastrar aluno'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}