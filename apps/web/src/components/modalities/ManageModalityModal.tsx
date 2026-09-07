import { type FormEvent, useCallback, useEffect, useState } from 'react'

import { ApiError } from '../../services/api'

import {
  getModalityById,
  updateModality,
  updateModalityStatus,
} from '../../services/modality.service'

import type { Modality, UpdateModalityInput } from '../../types/modality'

interface ManageModalityModalProps {
  gymId: string
  modalityId: string
  canEdit: boolean
  onClose: () => void
  onUpdated: () => Promise<void>
}

function normalizeOptionalValue(value: string) {
  const normalized = value.trim()

  return normalized.length > 0 ? normalized : undefined
}

function isValidHexColor(value: string) {
  return /^#[0-9A-Fa-f]{6}$/.test(value)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function ManageModalityModal({
  gymId,
  modalityId,
  canEdit,
  onClose,
  onUpdated,
}: ManageModalityModalProps) {
  const [modality, setModality] = useState<Modality | null>(null)

  const [name, setName] = useState('')

  const [description, setDescription] = useState('')

  const [color, setColor] = useState('')

  const [loading, setLoading] = useState(true)

  const [isEditing, setIsEditing] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isChangingStatus, setIsChangingStatus] = useState(false)

  const [isStatusConfirmationOpen, setIsStatusConfirmationOpen] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const populateForm = useCallback((currentModality: Modality) => {
    setName(currentModality.name)

    setDescription(currentModality.description ?? '')

    setColor(currentModality.color ?? '')
  }, [])

  const loadModality = useCallback(async () => {
    try {
      setLoading(true)

      setError(null)

      const response = await getModalityById(gymId, modalityId)

      setModality(response.modality)

      populateForm(response.modality)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)

        return
      }

      setError('Não foi possível carregar a modalidade.')
    } finally {
      setLoading(false)
    }
  }, [gymId, modalityId, populateForm])

  useEffect(() => {
    void loadModality()
  }, [loadModality])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') {
        return
      }

      if (isSubmitting || isChangingStatus) {
        return
      }

      if (isStatusConfirmationOpen) {
        setIsStatusConfirmationOpen(false)

        return
      }

      onClose()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSubmitting, isChangingStatus, isStatusConfirmationOpen, onClose])

  function handleStartEditing() {
    if (!canEdit || !modality) {
      return
    }

    populateForm(modality)

    setError(null)

    setIsEditing(true)
  }

  function handleCancelEditing() {
    if (!modality) {
      return
    }

    populateForm(modality)

    setError(null)

    setIsEditing(false)
  }

  function handleOpenStatusConfirmation() {
    if (!canEdit || !modality || isEditing) {
      return
    }

    setError(null)

    setIsStatusConfirmationOpen(true)
  }

  function handleCloseStatusConfirmation() {
    if (isChangingStatus) {
      return
    }

    setIsStatusConfirmationOpen(false)
  }

  async function handleStatusChange() {
    if (!canEdit || !modality) {
      return
    }

    const nextActiveStatus = !modality.active

    setError(null)

    setIsChangingStatus(true)

    try {
      const response = await updateModalityStatus(gymId, modalityId, {
        active: nextActiveStatus,
      })

      setModality(response.modality)

      populateForm(response.modality)

      setIsStatusConfirmationOpen(false)

      await onUpdated()
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)

        return
      }

      setError(
        nextActiveStatus
          ? 'Não foi possível reativar a modalidade.'
          : 'Não foi possível inativar a modalidade.',
      )
    } finally {
      setIsChangingStatus(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canEdit || !modality) {
      return
    }

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

    const input: UpdateModalityInput = {
      name: normalizedName,

      description: normalizedDescription,

      color: normalizedColor,
    }

    setIsSubmitting(true)

    try {
      const response = await updateModality(gymId, modalityId, input)

      setModality(response.modality)

      populateForm(response.modality)

      setIsEditing(false)

      await onUpdated()
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        if (caughtError.code === 'MODALITY_ALREADY_EXISTS') {
          setError('Já existe uma modalidade com este nome nesta academia.')

          return
        }

        setError(caughtError.message)

        return
      }

      setError('Não foi possível atualizar a modalidade.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const normalizedName = name.trim()

  const normalizedDescription = description.trim()

  const normalizedColor = color.trim().toUpperCase()

  const originalDescription = modality?.description ?? ''

  const originalColor = modality?.color?.toUpperCase() ?? ''

  const hasChanges =
    Boolean(modality) &&
    (normalizedName !== modality?.name ||
      normalizedDescription !== originalDescription ||
      normalizedColor !== originalColor)

  const isBusy = isSubmitting || isChangingStatus

  return (
    <div
      className="modality-modal-backdrop"
      role="presentation"
      data-testid="modality-manage-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy && !isStatusConfirmationOpen) {
          onClose()
        }
      }}
    >
      <section
        className="modality-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modality-manage-modal-title"
        data-testid="modality-manage-modal"
      >
        <header className="modality-modal-header">
          <div>
            <span className="modalities-eyebrow">Gestão acadêmica</span>

            <h2 id="modality-manage-modal-title">Detalhes da modalidade</h2>

            <p>Consulte as informações da modalidade selecionada.</p>
          </div>

          <button
            type="button"
            className="modality-modal-close"
            aria-label="Fechar"
            disabled={isBusy}
            data-testid="modality-manage-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {loading ? (
          <div className="modality-modal-state" data-testid="modality-manage-loading">
            <div className="modalities-loading-spinner" aria-hidden="true" />
            Carregando modalidade...
          </div>
        ) : error && !modality ? (
          <div
            className="modality-modal-state modality-modal-state-error"
            data-testid="modality-manage-load-error"
          >
            <strong>{error}</strong>

            <button
              type="button"
              className="modalities-button modalities-button-secondary"
              data-testid="modality-manage-retry-button"
              onClick={() => {
                void loadModality()
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : modality ? (
          <form
            className="modality-modal-form"
            data-testid="modality-manage-form"
            onSubmit={(event) => {
              void handleSubmit(event)
            }}
          >
            <div className="modality-detail-summary">
              <div
                className="modality-detail-color"
                data-testid="modality-manage-color-preview"
                style={
                  modality.color
                    ? {
                        backgroundColor: modality.color,
                      }
                    : undefined
                }
              >
                {!modality.color ? modality.name.charAt(0).toUpperCase() : null}
              </div>

              <div>
                <strong>{modality.name}</strong>

                <span
                  className={
                    modality.active
                      ? 'modality-status modality-status-active'
                      : 'modality-status modality-status-inactive'
                  }
                  data-testid="modality-manage-status"
                >
                  {modality.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>

            <div className="modality-form-grid">
              <label className="modality-form-field modality-form-field-full">
                <span>Nome *</span>

                <input
                  type="text"
                  value={name}
                  required
                  minLength={2}
                  maxLength={100}
                  disabled={!isEditing || isBusy}
                  data-testid="modality-manage-name-input"
                  onChange={(event) => {
                    setName(event.target.value)
                  }}
                />
              </label>

              <label className="modality-form-field modality-form-field-full">
                <span>Descrição</span>

                <textarea
                  value={description}
                  maxLength={1000}
                  rows={4}
                  disabled={!isEditing || isBusy}
                  data-testid="modality-manage-description-input"
                  onChange={(event) => {
                    setDescription(event.target.value)
                  }}
                />

                {isEditing ? (
                  <small className="modality-form-counter">
                    {description.length}
                    /1000
                  </small>
                ) : null}
              </label>

              <div className="modality-color-section">
                <div className="modality-form-field">
                  <span>Cor</span>

                  <div className="modality-color-input-row">
                    <input
                      type="color"
                      value={isValidHexColor(color) ? color : '#27272A'}
                      disabled={!isEditing || isBusy}
                      aria-label="Selecionar cor da modalidade"
                      data-testid="modality-manage-color-picker"
                      onChange={(event) => {
                        setColor(event.target.value.toUpperCase())
                      }}
                    />

                    <input
                      type="text"
                      value={color}
                      maxLength={7}
                      disabled={!isEditing || isBusy}
                      placeholder="#EF4444"
                      data-testid="modality-manage-color-input"
                      onChange={(event) => {
                        setColor(event.target.value.toUpperCase())
                      }}
                    />
                  </div>
                </div>

                <div className="modality-color-preview">
                  <div
                    className="modality-color-preview-swatch"
                    style={{
                      backgroundColor: isValidHexColor(color) ? color : '#27272A',
                    }}
                  />

                  <div>
                    <span>Pré-visualização</span>

                    <strong>{name.trim() || 'Modalidade'}</strong>

                    <small>{color || 'Sem cor'}</small>
                  </div>
                </div>
              </div>
            </div>

            <div className="modality-detail-metadata" data-testid="modality-manage-metadata">
              <div>
                <span>ID</span>

                <strong>{modality.id}</strong>
              </div>

              <div>
                <span>Criada em</span>

                <strong>{formatDateTime(modality.createdAt)}</strong>
              </div>

              <div>
                <span>Atualizada em</span>

                <strong>{formatDateTime(modality.updatedAt)}</strong>
              </div>
            </div>

            {error ? (
              <div className="modality-form-error" role="alert" data-testid="modality-manage-error">
                {error}
              </div>
            ) : null}

            {isStatusConfirmationOpen ? (
              <div
                className="modality-status-confirmation"
                data-testid="modality-status-confirmation"
              >
                <div className="modality-status-confirmation-content">
                  <strong>
                    {modality.active ? 'Inativar modalidade?' : 'Reativar modalidade?'}
                  </strong>

                  <p>
                    {modality.active
                      ? `A modalidade "${modality.name}" ficará inativa, mas seus dados e histórico serão preservados.`
                      : `A modalidade "${modality.name}" voltará a ficar disponível como modalidade ativa.`}
                  </p>
                </div>

                <div className="modality-status-confirmation-actions">
                  <button
                    type="button"
                    className="modalities-button modalities-button-secondary"
                    disabled={isChangingStatus}
                    data-testid="modality-status-cancel-button"
                    onClick={handleCloseStatusConfirmation}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className={
                      modality.active
                        ? 'modalities-button modality-status-action-danger'
                        : 'modalities-button modality-status-action-success'
                    }
                    disabled={isChangingStatus}
                    data-testid="modality-status-confirm-button"
                    onClick={() => {
                      void handleStatusChange()
                    }}
                  >
                    {isChangingStatus
                      ? modality.active
                        ? 'Inativando...'
                        : 'Reativando...'
                      : modality.active
                        ? 'Confirmar inativação'
                        : 'Confirmar reativação'}
                  </button>
                </div>
              </div>
            ) : null}

            <footer className="modality-modal-actions">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className="modalities-button modalities-button-secondary"
                    disabled={isBusy}
                    data-testid="modality-manage-cancel-edit-button"
                    onClick={handleCancelEditing}
                  >
                    Cancelar edição
                  </button>

                  <button
                    type="submit"
                    className="modalities-button modalities-button-primary"
                    disabled={isBusy || !hasChanges}
                    data-testid="modality-manage-save-button"
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="modalities-button modalities-button-secondary"
                    disabled={isBusy}
                    data-testid="modality-manage-close-footer-button"
                    onClick={onClose}
                  >
                    Fechar
                  </button>

                  {canEdit && !isStatusConfirmationOpen ? (
                    <>
                      <button
                        type="button"
                        className={
                          modality.active
                            ? 'modalities-button modality-status-action-danger'
                            : 'modalities-button modality-status-action-success'
                        }
                        disabled={isBusy}
                        data-testid={
                          modality.active
                            ? 'modality-manage-inactivate-button'
                            : 'modality-manage-reactivate-button'
                        }
                        onClick={handleOpenStatusConfirmation}
                      >
                        {modality.active ? 'Inativar modalidade' : 'Reativar modalidade'}
                      </button>

                      <button
                        type="button"
                        className="modalities-button modalities-button-primary"
                        disabled={isBusy}
                        data-testid="modality-manage-edit-button"
                        onClick={handleStartEditing}
                      >
                        Editar modalidade
                      </button>
                    </>
                  ) : null}
                </>
              )}
            </footer>
          </form>
        ) : null}
      </section>
    </div>
  )
}
