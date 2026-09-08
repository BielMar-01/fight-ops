import { useCallback, useEffect, useMemo, useState } from 'react'

import { ApiError } from '../../services/api'

import { getModalities } from '../../services/modality.service'

import {
  createProfessorModality,
  deleteProfessorModality,
  listProfessorModalities,
} from '../../services/professor-modality.service'

import type { Modality } from '../../types/modality'

import type { ProfessorModality } from '../../types/professor-modality'

interface ProfessorModalitiesSectionProps {
  gymId: string
  professorId: string
  canEdit: boolean
}

export function ProfessorModalitiesSection({
  gymId,
  professorId,
  canEdit,
}: ProfessorModalitiesSectionProps) {
  const [professorModalities, setProfessorModalities] = useState<
    ProfessorModality[]
  >([])

  const [activeModalities, setActiveModalities] = useState<Modality[]>([])

  const [selectedModalityId, setSelectedModalityId] = useState('')

  const [pendingRemoval, setPendingRemoval] =
    useState<ProfessorModality | null>(null)

  const [isLoading, setIsLoading] = useState(true)

  const [isAdding, setIsAdding] = useState(false)

  const [isRemoving, setIsRemoving] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const [actionError, setActionError] = useState<string | null>(null)

  const availableModalities = useMemo(() => {
    const linkedModalityIds = new Set(
      professorModalities.map(
        (professorModality) => professorModality.modalityId,
      ),
    )

    return activeModalities.filter(
      (modality) => !linkedModalityIds.has(modality.id),
    )
  }, [activeModalities, professorModalities])

  const loadProfessorModalities = useCallback(async () => {
    try {
      setIsLoading(true)

      setError(null)

      setActionError(null)

      setPendingRemoval(null)

      if (canEdit) {
        const [professorModalitiesResponse, modalitiesResponse] =
          await Promise.all([
            listProfessorModalities(gymId, professorId),

            getModalities(gymId, {
              page: 1,

              limit: 100,

              active: true,
            }),
          ])

        setProfessorModalities(
          professorModalitiesResponse.professorModalities,
        )

        setActiveModalities(modalitiesResponse.modalities)

        return
      }

      const professorModalitiesResponse =
        await listProfessorModalities(gymId, professorId)

      setProfessorModalities(
        professorModalitiesResponse.professorModalities,
      )

      setActiveModalities([])
    } catch (caughtError) {
      setProfessorModalities([])

      setActiveModalities([])

      if (caughtError instanceof ApiError) {
        setError(caughtError.message)

        return
      }

      setError('Não foi possível carregar as modalidades do professor.')
    } finally {
      setIsLoading(false)
    }
  }, [gymId, professorId, canEdit])

  useEffect(() => {
    setSelectedModalityId('')

    void loadProfessorModalities()
  }, [loadProfessorModalities])

  useEffect(() => {
    if (
      selectedModalityId &&
      !availableModalities.some(
        (modality) => modality.id === selectedModalityId,
      )
    ) {
      setSelectedModalityId('')
    }
  }, [availableModalities, selectedModalityId])

  async function handleAddModality() {
    if (
      !canEdit ||
      !selectedModalityId ||
      isAdding ||
      isRemoving
    ) {
      return
    }

    setIsAdding(true)

    setActionError(null)

    setPendingRemoval(null)

    try {
      const response = await createProfessorModality(
        gymId,
        professorId,
        {
          modalityId: selectedModalityId,
        },
      )

      setProfessorModalities((currentProfessorModalities) =>
        [...currentProfessorModalities, response.professorModality].sort(
          (firstProfessorModality, secondProfessorModality) =>
            firstProfessorModality.modality.name.localeCompare(
              secondProfessorModality.modality.name,
              'pt-BR',
            ),
        ),
      )

      setSelectedModalityId('')
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setActionError(caughtError.message)

        return
      }

      setActionError('Não foi possível vincular a modalidade.')
    } finally {
      setIsAdding(false)
    }
  }

  function handleStartRemoval(
    professorModality: ProfessorModality,
  ) {
    if (!canEdit || isAdding || isRemoving) {
      return
    }

    setActionError(null)

    setPendingRemoval(professorModality)
  }

  function handleCancelRemoval() {
    if (isRemoving) {
      return
    }

    setPendingRemoval(null)

    setActionError(null)
  }

  async function handleConfirmRemoval() {
    if (
      !canEdit ||
      !pendingRemoval ||
      isRemoving ||
      isAdding
    ) {
      return
    }

    setIsRemoving(true)

    setActionError(null)

    try {
      await deleteProfessorModality(
        gymId,
        professorId,
        pendingRemoval.modalityId,
      )

      setProfessorModalities((currentProfessorModalities) =>
        currentProfessorModalities.filter(
          (professorModality) =>
            professorModality.id !== pendingRemoval.id,
        ),
      )

      setPendingRemoval(null)
    } catch (caughtError) {
      if (caughtError instanceof ApiError) {
        setActionError(caughtError.message)

        return
      }

      setActionError('Não foi possível remover a modalidade.')
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <section
      className="professor-modalities-section"
      aria-labelledby="professor-modalities-title"
      data-testid="professor-modalities-section"
    >
      <header className="professor-modalities-header">
        <div>
          <span className="professors-eyebrow">Atuação</span>

          <h3 id="professor-modalities-title">
            Modalidades ministradas
          </h3>

          <p>
            Modalidades atualmente vinculadas a este professor.
          </p>
        </div>

        {!isLoading && !error ? (
          <span
            className="professor-modalities-count"
            data-testid="professor-modalities-count"
            aria-label={`${professorModalities.length} modalidades vinculadas`}
          >
            {professorModalities.length}
          </span>
        ) : null}
      </header>

      {isLoading ? (
        <div
          className="professor-modalities-state"
          data-testid="professor-modalities-loading"
        >
          <div
            className="professor-modalities-loading-spinner"
            aria-hidden="true"
          />

          <span>Carregando modalidades...</span>
        </div>
      ) : error ? (
        <div
          className="professor-modalities-state professor-modalities-state-error"
          data-testid="professor-modalities-error"
        >
          <span>{error}</span>

          <button
            type="button"
            className="professors-button professors-button-secondary"
            data-testid="professor-modalities-retry-button"
            onClick={() => {
              void loadProfessorModalities()
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <>
          {canEdit ? (
            <div
              className="professor-modalities-add"
              data-testid="professor-modalities-add"
            >
              <label
                className="professor-modalities-select-field"
                htmlFor="professor-modality-select"
              >
                <span>Adicionar modalidade</span>

                <select
                  id="professor-modality-select"
                  value={selectedModalityId}
                  disabled={
                    isAdding ||
                    isRemoving ||
                    availableModalities.length === 0
                  }
                  data-testid="professor-modality-select"
                  onChange={(event) => {
                    setSelectedModalityId(event.target.value)

                    setActionError(null)

                    setPendingRemoval(null)
                  }}
                >
                  <option value="">
                    {availableModalities.length === 0
                      ? 'Nenhuma modalidade disponível'
                      : 'Selecione uma modalidade'}
                  </option>

                  {availableModalities.map((modality) => (
                    <option key={modality.id} value={modality.id}>
                      {modality.name}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                className="professors-button professors-button-primary"
                disabled={
                  !selectedModalityId ||
                  isAdding ||
                  isRemoving
                }
                data-testid="professor-modality-add-button"
                onClick={() => {
                  void handleAddModality()
                }}
              >
                {isAdding ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          ) : null}

          {actionError ? (
            <div
              className="professor-modalities-action-error"
              role="alert"
              data-testid="professor-modalities-action-error"
            >
              {actionError}
            </div>
          ) : null}

          {professorModalities.length === 0 ? (
            <div
              className="professor-modalities-empty"
              data-testid="professor-modalities-empty"
            >
              <strong>Nenhuma modalidade vinculada</strong>

              <span>
                {canEdit
                  ? 'Selecione uma modalidade acima para criar o primeiro vínculo.'
                  : 'Este professor ainda não possui modalidades cadastradas.'}
              </span>
            </div>
          ) : (
            <div
              className="professor-modalities-list"
              data-testid="professor-modalities-list"
            >
              {professorModalities.map((professorModality) => {
                const isConfirmingRemoval =
                  pendingRemoval?.id === professorModality.id

                return (
                  <div
                    key={professorModality.id}
                    className="professor-modality-item"
                  >
                    <article
                      className="professor-modality-card"
                      data-testid={`professor-modality-${professorModality.modalityId}`}
                    >
                      <span
                        className="professor-modality-color"
                        style={{
                          backgroundColor:
                            professorModality.modality.color ??
                            '#71717a',
                        }}
                        aria-hidden="true"
                      />

                      <div className="professor-modality-info">
                        <strong>
                          {professorModality.modality.name}
                        </strong>

                        {professorModality.modality.description ? (
                          <span>
                            {professorModality.modality.description}
                          </span>
                        ) : (
                          <span>Sem descrição cadastrada.</span>
                        )}
                      </div>

                      <span
                        className={
                          professorModality.modality.active
                            ? 'professor-modality-status professor-modality-status-active'
                            : 'professor-modality-status professor-modality-status-inactive'
                        }
                      >
                        {professorModality.modality.active
                          ? 'Ativa'
                          : 'Inativa'}
                      </span>

                      {canEdit ? (
                        <button
                          type="button"
                          className="professor-modality-remove-button"
                          aria-label={`Remover ${professorModality.modality.name}`}
                          disabled={isAdding || isRemoving}
                          data-testid={`professor-modality-remove-${professorModality.modalityId}`}
                          onClick={() => {
                            handleStartRemoval(professorModality)
                          }}
                        >
                          Remover
                        </button>
                      ) : null}
                    </article>

                    {isConfirmingRemoval ? (
                      <div
                        className="professor-modality-removal-confirmation"
                        data-testid="professor-modality-removal-confirmation"
                      >
                        <div>
                          <strong>Remover modalidade?</strong>

                          <p>
                            O vínculo com{' '}
                            <strong>
                              {professorModality.modality.name}
                            </strong>{' '}
                            será removido deste professor.
                          </p>
                        </div>

                        <div className="professor-modality-removal-actions">
                          <button
                            type="button"
                            className="professors-button professors-button-secondary"
                            disabled={isRemoving}
                            data-testid="professor-modality-removal-cancel"
                            onClick={handleCancelRemoval}
                          >
                            Cancelar
                          </button>

                          <button
                            type="button"
                            className="professors-button professors-button-danger"
                            disabled={isRemoving}
                            data-testid="professor-modality-removal-confirm"
                            onClick={() => {
                              void handleConfirmRemoval()
                            }}
                          >
                            {isRemoving
                              ? 'Removendo...'
                              : 'Confirmar remoção'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}