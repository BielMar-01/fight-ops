import { useCallback, useEffect, useState } from 'react'

import { ApiError } from '../../services/api'

import { listProfessorModalities } from '../../services/professor-modality.service'

import type { ProfessorModality } from '../../types/professor-modality'

interface ProfessorModalitiesSectionProps {
  gymId: string
  professorId: string
}

export function ProfessorModalitiesSection({
  gymId,
  professorId,
}: ProfessorModalitiesSectionProps) {
  const [professorModalities, setProfessorModalities] = useState<
    ProfessorModality[]
  >([])

  const [isLoading, setIsLoading] = useState(true)

  const [error, setError] = useState<string | null>(null)

  const loadProfessorModalities = useCallback(async () => {
    try {
      setIsLoading(true)

      setError(null)

      const response = await listProfessorModalities(gymId, professorId)

      setProfessorModalities(response.professorModalities)
    } catch (caughtError) {
      setProfessorModalities([])

      if (caughtError instanceof ApiError) {
        setError(caughtError.message)

        return
      }

      setError('Não foi possível carregar as modalidades do professor.')
    } finally {
      setIsLoading(false)
    }
  }, [gymId, professorId])

  useEffect(() => {
    void loadProfessorModalities()
  }, [loadProfessorModalities])

  return (
    <section
      className="professor-modalities-section"
      aria-labelledby="professor-modalities-title"
      data-testid="professor-modalities-section"
    >
      <header className="professor-modalities-header">
        <div>
          <span className="professors-eyebrow">Atuação</span>

          <h3 id="professor-modalities-title">Modalidades ministradas</h3>

          <p>
            Modalidades atualmente vinculadas a este professor.
          </p>
        </div>

        {!isLoading && !error ? (
          <span
            className="professor-modalities-count"
            data-testid="professor-modalities-count"
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
      ) : professorModalities.length === 0 ? (
        <div
          className="professor-modalities-empty"
          data-testid="professor-modalities-empty"
        >
          <strong>Nenhuma modalidade vinculada</strong>

          <span>
            Este professor ainda não possui modalidades cadastradas.
          </span>
        </div>
      ) : (
        <div
          className="professor-modalities-list"
          data-testid="professor-modalities-list"
        >
          {professorModalities.map((professorModality) => (
            <article
              key={professorModality.id}
              className="professor-modality-card"
              data-testid={`professor-modality-${professorModality.modalityId}`}
            >
              <span
                className="professor-modality-color"
                style={{
                  backgroundColor:
                    professorModality.modality.color ?? '#71717a',
                }}
                aria-hidden="true"
              />

              <div className="professor-modality-info">
                <strong>{professorModality.modality.name}</strong>

                {professorModality.modality.description ? (
                  <span>{professorModality.modality.description}</span>
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
                {professorModality.modality.active ? 'Ativa' : 'Inativa'}
              </span>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}