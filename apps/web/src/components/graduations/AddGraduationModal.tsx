import { type FormEvent, useEffect, useState } from 'react'

import { ApiError } from '../../services/api'

import { createGraduation } from '../../services/graduation.service'

import type { CreateGraduationInput } from '../../types/graduation'

interface AddGraduationModalProps {
  gymId: string
  modalityId: string
  modalityName: string
  onClose: () => void
  onCreated: () => Promise<void>
}

function normalizeOptionalValue(value: string) {
  const normalized = value.trim()

  return normalized.length > 0 ? normalized : undefined
}

function isValidHexColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}

export function AddGraduationModal({
  gymId,
  modalityId,
  modalityName,
  onClose,
  onCreated,
}: AddGraduationModalProps) {
  const [name, setName] = useState('')

  const [description, setDescription] = useState('')

  const [color, setColor] = useState('#FFFFFF')

  const [textColor, setTextColor] = useState('#111111')

  const [order, setOrder] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSubmitting, onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)

    const normalizedName = name.trim()

    const normalizedDescription = normalizeOptionalValue(description)

    const normalizedColor = normalizeOptionalValue(color)

    const normalizedTextColor = normalizeOptionalValue(textColor)

    const parsedOrder = Number(order)

    if (normalizedName.length < 2) {
      setError('Informe o nome da graduação com pelo menos 2 caracteres.')

      return
    }

    if (normalizedName.length > 100) {
      setError('O nome da graduação deve ter no máximo 100 caracteres.')

      return
    }

    if (normalizedDescription && normalizedDescription.length > 1000) {
      setError('A descrição deve ter no máximo 1000 caracteres.')

      return
    }

    if (!Number.isInteger(parsedOrder) || parsedOrder < 1) {
      setError('Informe uma ordem válida maior ou igual a 1.')

      return
    }

    if (normalizedColor && !isValidHexColor(normalizedColor)) {
      setError('Informe uma cor válida no formato #RRGGBB.')

      return
    }

    if (normalizedTextColor && !isValidHexColor(normalizedTextColor)) {
      setError('Informe uma cor de texto válida no formato #RRGGBB.')

      return
    }

    const input: CreateGraduationInput = {
      name: normalizedName,

      description: normalizedDescription,

      color: normalizedColor?.toUpperCase(),

      textColor: normalizedTextColor?.toUpperCase(),

      order: parsedOrder,
    }

    setIsSubmitting(true)

    try {
      await createGraduation(gymId, modalityId, input)

      await onCreated()

      onClose()
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        if (caughtError.code === 'GRADUATION_ALREADY_EXISTS') {
          setError('Já existe uma graduação com este nome nesta modalidade.')

          return
        }

        if (caughtError.code === 'GRADUATION_ORDER_ALREADY_EXISTS') {
          setError('Já existe uma graduação utilizando esta ordem nesta modalidade.')

          return
        }

        setError(caughtError.message)

        return
      }

      setError('Não foi possível cadastrar a graduação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewBackground = isValidHexColor(color) ? color : '#27272a'

  const previewTextColor = isValidHexColor(textColor) ? textColor : '#FAFAFA'

  return (
    <div
      className="graduation-modal-backdrop"
      role="presentation"
      data-testid="graduation-add-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <section
        className="graduation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="graduation-add-modal-title"
        data-testid="graduation-add-modal"
      >
        <header className="graduation-modal-header">
          <div>
            <span className="graduations-eyebrow">Gestão acadêmica</span>

            <h2 id="graduation-add-modal-title">Nova graduação</h2>

            <p>
              Cadastre uma nova graduação para <strong>{modalityName}</strong>.
            </p>
          </div>

          <button
            type="button"
            className="graduation-modal-close"
            aria-label="Fechar"
            disabled={isSubmitting}
            data-testid="graduation-add-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form
          className="graduation-modal-form"
          data-testid="graduation-add-form"
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <div className="graduation-form-grid">
            <label className="graduation-form-field graduation-form-field-full">
              <span>Nome *</span>

              <input
                type="text"
                value={name}
                required
                minLength={2}
                maxLength={100}
                placeholder="Ex.: Faixa Azul"
                disabled={isSubmitting}
                data-testid="graduation-add-name-input"
                onChange={(event) => {
                  setName(event.target.value)
                }}
              />
            </label>

            <label className="graduation-form-field">
              <span>Ordem *</span>

              <input
                type="number"
                min={1}
                step={1}
                value={order}
                required
                placeholder="Ex.: 2"
                disabled={isSubmitting}
                data-testid="graduation-add-order-input"
                onChange={(event) => {
                  setOrder(event.target.value)
                }}
              />
            </label>

            <div className="graduation-form-field">
              <span>Modalidade</span>

              <input
                type="text"
                value={modalityName}
                disabled
                data-testid="graduation-add-modality-input"
              />
            </div>

            <label className="graduation-form-field graduation-form-field-full">
              <span>Descrição</span>

              <textarea
                value={description}
                maxLength={1000}
                rows={4}
                placeholder="Descrição opcional da graduação"
                disabled={isSubmitting}
                data-testid="graduation-add-description-input"
                onChange={(event) => {
                  setDescription(event.target.value)
                }}
              />

              <small className="graduation-form-counter">
                {description.length}
                /1000
              </small>
            </label>

            <div className="graduation-color-section">
              <div className="graduation-form-field">
                <span>Cor da faixa</span>

                <div className="graduation-color-input-row">
                  <input
                    type="color"
                    value={isValidHexColor(color) ? color : '#FFFFFF'}
                    disabled={isSubmitting}
                    aria-label="Selecionar cor da faixa"
                    data-testid="graduation-add-color-picker"
                    onChange={(event) => {
                      setColor(event.target.value.toUpperCase())
                    }}
                  />

                  <input
                    type="text"
                    value={color}
                    maxLength={7}
                    placeholder="#FFFFFF"
                    disabled={isSubmitting}
                    data-testid="graduation-add-color-input"
                    onChange={(event) => {
                      setColor(event.target.value)
                    }}
                  />
                </div>
              </div>

              <div className="graduation-form-field">
                <span>Cor do texto</span>

                <div className="graduation-color-input-row">
                  <input
                    type="color"
                    value={isValidHexColor(textColor) ? textColor : '#111111'}
                    disabled={isSubmitting}
                    aria-label="Selecionar cor do texto"
                    data-testid="graduation-add-text-color-picker"
                    onChange={(event) => {
                      setTextColor(event.target.value.toUpperCase())
                    }}
                  />

                  <input
                    type="text"
                    value={textColor}
                    maxLength={7}
                    placeholder="#111111"
                    disabled={isSubmitting}
                    data-testid="graduation-add-text-color-input"
                    onChange={(event) => {
                      setTextColor(event.target.value)
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="graduation-preview" data-testid="graduation-add-preview">
              <span>Pré-visualização</span>

              <div className="graduation-preview-content">
                <div
                  className="graduation-preview-belt"
                  style={{
                    backgroundColor: previewBackground,

                    color: previewTextColor,
                  }}
                >
                  {order || '1'}
                </div>

                <div>
                  <strong>{name.trim() || 'Nome da graduação'}</strong>

                  <small>Ordem {order || '1'}</small>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="graduation-form-error" role="alert" data-testid="graduation-add-error">
              {error}
            </div>
          ) : null}

          <div className="graduation-modal-actions">
            <button
              type="button"
              className="graduations-button graduations-button-secondary"
              disabled={isSubmitting}
              data-testid="graduation-add-cancel-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="graduations-button graduations-button-primary"
              disabled={isSubmitting}
              data-testid="graduation-add-submit-button"
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar graduação'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
