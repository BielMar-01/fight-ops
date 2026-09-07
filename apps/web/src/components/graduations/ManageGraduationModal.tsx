import { type FormEvent, useEffect, useState } from 'react'

import { ApiError } from '../../services/api'

import {
  getGraduationById,
  updateGraduation,
  updateGraduationStatus,
} from '../../services/graduation.service'

import type { Graduation, UpdateGraduationInput } from '../../types/graduation'

interface ManageGraduationModalProps {
  gymId: string
  modalityId: string
  modalityName: string
  graduationId: string
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function ManageGraduationModal({
  gymId,
  modalityId,
  modalityName,
  graduationId,
  canEdit,
  onClose,
  onUpdated,
}: ManageGraduationModalProps) {
  const [graduation, setGraduation] = useState<Graduation | null>(null)

  const [name, setName] = useState('')

  const [description, setDescription] = useState('')

  const [color, setColor] = useState('')

  const [textColor, setTextColor] = useState('')

  const [order, setOrder] = useState('')

  const [isEditing, setIsEditing] = useState(false)

  const [isStatusConfirmationOpen, setIsStatusConfirmationOpen] = useState(false)

  const [loading, setLoading] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [error, setError] = useState<string | null>(null)

  function fillForm(currentGraduation: Graduation) {
    setName(currentGraduation.name)

    setDescription(currentGraduation.description ?? '')

    setColor(currentGraduation.color ?? '')

    setTextColor(currentGraduation.textColor ?? '')

    setOrder(String(currentGraduation.order))
  }

  async function loadGraduation() {
    try {
      setLoading(true)

      setError(null)

      const response = await getGraduationById(gymId, modalityId, graduationId)

      setGraduation(response.graduation)

      fillForm(response.graduation)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)

        return
      }

      setError('Não foi possível carregar os dados da graduação.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadGraduation()
  }, [gymId, modalityId, graduationId])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting && !isUpdatingStatus) {
        if (isStatusConfirmationOpen) {
          setIsStatusConfirmationOpen(false)

          return
        }

        if (isEditing) {
          setIsEditing(false)

          if (graduation) {
            fillForm(graduation)
          }

          setError(null)

          return
        }

        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [graduation, isEditing, isStatusConfirmationOpen, isSubmitting, isUpdatingStatus, onClose])

  function handleStartEditing() {
    if (!graduation || !canEdit) {
      return
    }

    fillForm(graduation)

    setError(null)

    setIsStatusConfirmationOpen(false)

    setIsEditing(true)
  }

  function handleCancelEditing() {
    if (graduation) {
      fillForm(graduation)
    }

    setError(null)

    setIsEditing(false)
  }

  function handleOpenStatusConfirmation() {
    if (!graduation || !canEdit) {
      return
    }

    setError(null)

    setIsStatusConfirmationOpen(true)
  }

  function handleCancelStatusConfirmation() {
    if (isUpdatingStatus) {
      return
    }

    setError(null)

    setIsStatusConfirmationOpen(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!graduation) {
      return
    }

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

    const input: UpdateGraduationInput = {
      name: normalizedName,
      description: normalizedDescription,
      color: normalizedColor?.toUpperCase(),
      textColor: normalizedTextColor?.toUpperCase(),
      order: parsedOrder,
    }

    setIsSubmitting(true)

    try {
      const response = await updateGraduation(gymId, modalityId, graduationId, input)

      setGraduation(response.graduation)

      fillForm(response.graduation)

      setIsEditing(false)

      await onUpdated()
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

      setError('Não foi possível atualizar a graduação.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateStatus() {
    if (!graduation || !canEdit) {
      return
    }

    const newStatus = !graduation.active

    setError(null)

    setIsUpdatingStatus(true)

    try {
      const response = await updateGraduationStatus(gymId, modalityId, graduationId, {
        active: newStatus,
      })

      setGraduation(response.graduation)

      fillForm(response.graduation)

      setIsStatusConfirmationOpen(false)

      await onUpdated()
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setError(caughtError.message)

        return
      }

      setError(
        graduation.active
          ? 'Não foi possível inativar a graduação.'
          : 'Não foi possível ativar a graduação.',
      )
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const previewBackground = isValidHexColor(color) ? color : '#27272A'

  const previewTextColor = isValidHexColor(textColor) ? textColor : '#FAFAFA'

  const isBusy = isSubmitting || isUpdatingStatus

  return (
    <div
      className="graduation-modal-backdrop"
      role="presentation"
      data-testid="graduation-manage-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) {
          onClose()
        }
      }}
    >
      <section
        className="graduation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="graduation-manage-modal-title"
        data-testid="graduation-manage-modal"
      >
        <header className="graduation-modal-header">
          <div>
            <span className="graduations-eyebrow">Gestão acadêmica</span>

            <h2 id="graduation-manage-modal-title">
              {isEditing ? 'Editar graduação' : 'Detalhes da graduação'}
            </h2>

            <p>
              Modalidade: <strong>{modalityName}</strong>
            </p>
          </div>

          <button
            type="button"
            className="graduation-modal-close"
            aria-label="Fechar"
            disabled={isBusy}
            data-testid="graduation-manage-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {loading ? (
          <div className="graduation-modal-state" data-testid="graduation-manage-loading">
            <div className="graduations-loading-spinner" aria-hidden="true" />

            <span>Carregando graduação...</span>
          </div>
        ) : !graduation ? (
          <div
            className="graduation-modal-state graduation-modal-state-error"
            data-testid="graduation-manage-error"
          >
            <strong>Não foi possível carregar a graduação.</strong>

            {error ? <span>{error}</span> : null}

            <button
              type="button"
              className="graduations-button graduations-button-secondary"
              data-testid="graduation-manage-retry-button"
              onClick={() => {
                void loadGraduation()
              }}
            >
              Tentar novamente
            </button>
          </div>
        ) : isEditing ? (
          <form
            className="graduation-modal-form"
            data-testid="graduation-edit-form"
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
                  disabled={isSubmitting}
                  data-testid="graduation-edit-name-input"
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
                  disabled={isSubmitting}
                  data-testid="graduation-edit-order-input"
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
                  data-testid="graduation-edit-modality-input"
                />
              </div>

              <label className="graduation-form-field graduation-form-field-full">
                <span>Descrição</span>

                <textarea
                  value={description}
                  maxLength={1000}
                  rows={4}
                  disabled={isSubmitting}
                  data-testid="graduation-edit-description-input"
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
                      data-testid="graduation-edit-color-picker"
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
                      data-testid="graduation-edit-color-input"
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
                      data-testid="graduation-edit-text-color-picker"
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
                      data-testid="graduation-edit-text-color-input"
                      onChange={(event) => {
                        setTextColor(event.target.value)
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="graduation-preview" data-testid="graduation-edit-preview">
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
              <div
                className="graduation-form-error"
                role="alert"
                data-testid="graduation-edit-error"
              >
                {error}
              </div>
            ) : null}

            <div className="graduation-modal-actions">
              <button
                type="button"
                className="graduations-button graduations-button-secondary"
                disabled={isSubmitting}
                data-testid="graduation-edit-cancel-button"
                onClick={handleCancelEditing}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="graduations-button graduations-button-primary"
                disabled={isSubmitting}
                data-testid="graduation-edit-submit-button"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        ) : (
          <div className="graduation-modal-form" data-testid="graduation-details-content">
            <div className="graduation-detail-summary">
              <div
                className="graduation-detail-belt"
                style={{
                  backgroundColor: graduation.color ?? '#27272A',
                  color: graduation.textColor ?? '#FAFAFA',
                }}
                data-testid="graduation-detail-color"
              >
                {graduation.order}
              </div>

              <div>
                <strong>{graduation.name}</strong>

                <span
                  className={
                    graduation.active
                      ? 'graduation-status graduation-status-active'
                      : 'graduation-status graduation-status-inactive'
                  }
                  data-testid="graduation-detail-status"
                >
                  {graduation.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>

            <div className="graduation-detail-description">
              <span>Descrição</span>

              <p>{graduation.description ?? 'Descrição não informada.'}</p>
            </div>

            <div className="graduation-detail-metadata">
              <div>
                <span>Modalidade</span>

                <strong>{modalityName}</strong>
              </div>

              <div>
                <span>Ordem</span>

                <strong>{graduation.order}</strong>
              </div>

              <div>
                <span>Cor da faixa</span>

                <strong>{graduation.color ?? 'Não informada'}</strong>
              </div>

              <div>
                <span>Cor do texto</span>

                <strong>{graduation.textColor ?? 'Não informada'}</strong>
              </div>

              <div>
                <span>Criada em</span>

                <strong>{formatDate(graduation.createdAt)}</strong>
              </div>

              <div>
                <span>Atualizada em</span>

                <strong>{formatDate(graduation.updatedAt)}</strong>
              </div>
            </div>

            {isStatusConfirmationOpen ? (
              <div
                className={
                  graduation.active
                    ? 'graduation-status-confirmation graduation-status-confirmation-danger'
                    : 'graduation-status-confirmation graduation-status-confirmation-success'
                }
                data-testid="graduation-status-confirmation"
              >
                <div>
                  <strong>{graduation.active ? 'Inativar graduação?' : 'Ativar graduação?'}</strong>

                  <p>
                    {graduation.active
                      ? 'A graduação continuará preservada no histórico, mas não deverá ser utilizada em novas atribuições.'
                      : 'A graduação voltará a ficar disponível para utilização na academia.'}
                  </p>
                </div>

                <div className="graduation-status-confirmation-actions">
                  <button
                    type="button"
                    className="graduations-button graduations-button-secondary"
                    disabled={isUpdatingStatus}
                    data-testid="graduation-status-cancel-button"
                    onClick={handleCancelStatusConfirmation}
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    className={
                      graduation.active
                        ? 'graduations-button graduation-button-danger'
                        : 'graduations-button graduation-button-success'
                    }
                    disabled={isUpdatingStatus}
                    data-testid="graduation-status-confirm-button"
                    onClick={() => {
                      void handleUpdateStatus()
                    }}
                  >
                    {isUpdatingStatus
                      ? 'Atualizando...'
                      : graduation.active
                        ? 'Confirmar inativação'
                        : 'Confirmar ativação'}
                  </button>
                </div>
              </div>
            ) : null}

            {error ? (
              <div
                className="graduation-form-error"
                role="alert"
                data-testid="graduation-manage-action-error"
              >
                {error}
              </div>
            ) : null}

            <div className="graduation-modal-actions graduation-manage-actions">
              <button
                type="button"
                className="graduations-button graduations-button-secondary"
                disabled={isUpdatingStatus}
                data-testid="graduation-details-close-button"
                onClick={onClose}
              >
                Fechar
              </button>

              {canEdit ? (
                <>
                  <button
                    type="button"
                    className={
                      graduation.active
                        ? 'graduations-button graduation-button-danger-secondary'
                        : 'graduations-button graduation-button-success-secondary'
                    }
                    disabled={isUpdatingStatus || isStatusConfirmationOpen}
                    data-testid="graduation-status-button"
                    onClick={handleOpenStatusConfirmation}
                  >
                    {graduation.active ? 'Inativar graduação' : 'Ativar graduação'}
                  </button>

                  <button
                    type="button"
                    className="graduations-button graduations-button-primary"
                    disabled={isUpdatingStatus || isStatusConfirmationOpen}
                    data-testid="graduation-edit-button"
                    onClick={handleStartEditing}
                  >
                    Editar graduação
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
