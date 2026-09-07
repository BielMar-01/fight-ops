import { type FormEvent, useEffect, useState } from 'react'

import { ApiError } from '../../services/api'

import { createModality } from '../../services/modality.service'

import type { CreateModalityInput } from '../../types/modality'

interface AddModalityModalProps {
  gymId: string
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

export function AddModalityModal({ gymId, onClose, onCreated }: AddModalityModalProps) {
  const [name, setName] = useState('')

  const [description, setDescription] = useState('')

  const [color, setColor] = useState('#EF4444')

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

    if (normalizedName.length < 2) {
      setError('Informe o nome da modalidade com pelo menos 2 caracteres.')

      return
    }

    if (normalizedName.length > 100) {
      setError('O nome da modalidade deve ter no máximo 100 caracteres.')

      return
    }

    if (normalizedDescription && normalizedDescription.length > 1000) {
      setError('A descrição deve ter no máximo 1000 caracteres.')

      return
    }

    if (normalizedColor && !isValidHexColor(normalizedColor)) {
      setError('Informe uma cor hexadecimal válida no formato #RRGGBB.')

      return
    }

    const input: CreateModalityInput = {
      name: normalizedName,

      description: normalizedDescription,

      color: normalizedColor,
    }

    setIsSubmitting(true)

    try {
      await createModality(gymId, input)

      await onCreated()

      onClose()
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        if (caughtError.code === 'MODALITY_ALREADY_EXISTS') {
          setError('Já existe uma modalidade com este nome nesta academia.')

          return
        }

        setError(caughtError.message)

        return
      }

      setError('Não foi possível cadastrar a modalidade.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="modality-modal-backdrop"
      role="presentation"
      data-testid="modality-add-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose()
        }
      }}
    >
      <section
        className="modality-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modality-add-modal-title"
        data-testid="modality-add-modal"
      >
        <header className="modality-modal-header">
          <div>
            <span className="modalities-eyebrow">Gestão acadêmica</span>

            <h2 id="modality-add-modal-title">Nova modalidade</h2>

            <p>Cadastre uma modalidade disponível na academia.</p>
          </div>

          <button
            type="button"
            className="modality-modal-close"
            aria-label="Fechar"
            disabled={isSubmitting}
            data-testid="modality-add-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form
          className="modality-modal-form"
          data-testid="modality-add-form"
          onSubmit={(event) => {
            void handleSubmit(event)
          }}
        >
          <div className="modality-form-grid">
            <label className="modality-form-field modality-form-field-full">
              <span>Nome *</span>

              <input
                type="text"
                value={name}
                disabled={isSubmitting}
                required
                minLength={2}
                maxLength={100}
                autoFocus
                placeholder="Ex.: Jiu-Jitsu"
                data-testid="modality-add-name-input"
                onChange={(event) => {
                  setName(event.target.value)
                }}
              />
            </label>

            <label className="modality-form-field modality-form-field-full">
              <span>Descrição</span>

              <textarea
                value={description}
                disabled={isSubmitting}
                maxLength={1000}
                rows={4}
                placeholder="Descreva brevemente a modalidade."
                data-testid="modality-add-description-input"
                onChange={(event) => {
                  setDescription(event.target.value)
                }}
              />

              <small className="modality-form-counter">
                {description.length}
                /1000
              </small>
            </label>

            <div className="modality-color-section">
              <div className="modality-form-field">
                <span>Cor</span>

                <div className="modality-color-input-row">
                  <input
                    type="color"
                    value={color}
                    disabled={isSubmitting}
                    aria-label="Selecionar cor da modalidade"
                    data-testid="modality-add-color-picker"
                    onChange={(event) => {
                      setColor(event.target.value.toUpperCase())
                    }}
                  />

                  <input
                    type="text"
                    value={color}
                    disabled={isSubmitting}
                    maxLength={7}
                    placeholder="#EF4444"
                    data-testid="modality-add-color-input"
                    onChange={(event) => {
                      setColor(event.target.value.toUpperCase())
                    }}
                  />
                </div>
              </div>

              <div className="modality-color-preview" data-testid="modality-add-color-preview">
                <div
                  className="modality-color-preview-swatch"
                  style={{
                    backgroundColor: isValidHexColor(color) ? color : '#27272A',
                  }}
                />

                <div>
                  <span>Pré-visualização</span>

                  <strong>{name.trim() || 'Modalidade'}</strong>

                  <small>{isValidHexColor(color) ? color : 'Cor inválida'}</small>
                </div>
              </div>
            </div>
          </div>

          {error ? (
            <div className="modality-form-error" role="alert" data-testid="modality-add-error">
              {error}
            </div>
          ) : null}

          <footer className="modality-modal-actions">
            <button
              type="button"
              className="modalities-button modalities-button-secondary"
              disabled={isSubmitting}
              data-testid="modality-add-cancel-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="modalities-button modalities-button-primary"
              disabled={isSubmitting}
              data-testid="modality-add-submit-button"
            >
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar modalidade'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}
