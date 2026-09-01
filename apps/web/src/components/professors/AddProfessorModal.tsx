import {
  type FormEvent,
  useEffect,
  useState,
} from 'react'

import {
  ApiError,
} from '../../services/api'

import {
  createProfessor,
} from '../../services/professor.service'

import type {
  CreateProfessorInput,
} from '../../types/professor'

interface AddProfessorModalProps {
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
    : undefined
}

export function AddProfessorModal({
  gymId,
  onClose,
  onCreated,
}: AddProfessorModalProps) {
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
        'Informe o nome do professor com pelo menos 2 caracteres.',
      )

      return
    }

    const input:
      CreateProfessorInput = {
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

    setIsSubmitting(true)

    try {
      await createProfessor(
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
        'Não foi possível cadastrar o professor.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="professor-modal-backdrop"
      role="presentation"
      data-testid="professor-add-modal-backdrop"
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
        aria-labelledby="professor-add-modal-title"
        data-testid="professor-add-modal"
      >
        <header className="professor-modal-header">
          <div>
            <span className="professors-eyebrow">
              Gestão acadêmica
            </span>

            <h2
              id="professor-add-modal-title"
            >
              Novo professor
            </h2>

            <p>
              Cadastre os dados
              profissionais e
              operacionais do
              professor.
            </p>
          </div>

          <button
            type="button"
            className="professor-modal-close"
            aria-label="Fechar"
            disabled={
              isSubmitting
            }
            data-testid="professor-add-close-button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <form
          className="professor-modal-form"
          data-testid="professor-add-form"
          onSubmit={(
            event,
          ) => {
            void handleSubmit(
              event,
            )
          }}
        >
          <div className="professor-form-grid">
            <label className="professor-form-field professor-form-field-full">
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
                data-testid="professor-add-name-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  255
                }
                autoComplete="email"
                placeholder="professor@email.com"
                data-testid="professor-add-email-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  30
                }
                autoComplete="tel"
                placeholder="11999998888"
                data-testid="professor-add-phone-input"
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
                  isSubmitting
                }
                data-testid="professor-add-birth-date-input"
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
                  isSubmitting
                }
                data-testid="professor-add-hire-date-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  5000
                }
                rows={4}
                placeholder="Experiência, especialidades, formação ou outras informações profissionais."
                data-testid="professor-add-bio-input"
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
                disabled={
                  isSubmitting
                }
                maxLength={
                  5000
                }
                rows={4}
                placeholder="Informações internas adicionais sobre o professor."
                data-testid="professor-add-notes-input"
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
              className="professor-form-error"
              role="alert"
              data-testid="professor-add-error"
            >
              {error}
            </div>
          ) : null}

          <footer className="professor-modal-actions">
            <button
              type="button"
              className="professors-button professors-button-secondary"
              disabled={
                isSubmitting
              }
              data-testid="professor-add-cancel-button"
              onClick={
                onClose
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="professors-button professors-button-primary"
              disabled={
                isSubmitting
              }
              data-testid="professor-add-submit-button"
            >
              {isSubmitting
                ? 'Cadastrando...'
                : 'Cadastrar professor'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}