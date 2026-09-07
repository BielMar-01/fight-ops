import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  useGym,
} from '../contexts/GymContext'

import {
  listGraduations,
} from '../services/graduation.service'

import {
  getModalities,
} from '../services/modality.service'

import type {
  Graduation,
  Pagination,
} from '../types/graduation'

import type {
  Modality,
} from '../types/modality'

import '../styles/graduations.css'

const PAGE_LIMIT = 10

const initialPagination: Pagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
}

type StatusFilter =
  | 'all'
  | 'active'
  | 'inactive'

interface GraduationSummary {
  total: number
  active: number
  inactive: number
}

const initialSummary: GraduationSummary = {
  total: 0,
  active: 0,
  inactive: 0,
}

function getActiveFilter(
  status: StatusFilter,
) {
  if (status === 'active') {
    return true
  }

  if (status === 'inactive') {
    return false
  }

  return undefined
}

function getGraduationInitial(
  name: string,
) {
  return name
    .charAt(0)
    .toUpperCase()
}

export function GraduationsPage() {
  const {
    activeGym,
  } = useGym()

  const [
    modalities,
    setModalities,
  ] = useState<Modality[]>(
    [],
  )

  const [
    selectedModalityId,
    setSelectedModalityId,
  ] = useState('')

  const [
    graduations,
    setGraduations,
  ] = useState<Graduation[]>(
    [],
  )

  const [
    pagination,
    setPagination,
  ] =
    useState<Pagination>(
      initialPagination,
    )

  const [
    summary,
    setSummary,
  ] =
    useState<GraduationSummary>(
      initialSummary,
    )

  const [
    page,
    setPage,
  ] = useState(1)

  const [
    searchInput,
    setSearchInput,
  ] = useState('')

  const [
    appliedSearch,
    setAppliedSearch,
  ] = useState('')

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      'all',
    )

  const [
    modalitiesLoading,
    setModalitiesLoading,
  ] = useState(true)

  const [
    modalitiesError,
    setModalitiesError,
  ] = useState<string | null>(
    null,
  )

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  )

  const canViewGraduations =
    activeGym?.role ===
      'OWNER' ||
    activeGym?.role ===
      'ADMIN' ||
    activeGym?.role ===
      'RECEPTIONIST' ||
    activeGym?.role ===
      'PROFESSOR'

  const selectedModality =
    modalities.find(
      (modality) =>
        modality.id ===
        selectedModalityId,
    ) ?? null

  const loadModalities =
    useCallback(
      async () => {
        if (!activeGym) {
          setModalities([])

          setSelectedModalityId(
            '',
          )

          setModalitiesLoading(
            false,
          )

          return
        }

        if (
          activeGym.role ===
          'STUDENT'
        ) {
          setModalities([])

          setSelectedModalityId(
            '',
          )

          setModalitiesError(
            null,
          )

          setModalitiesLoading(
            false,
          )

          return
        }

        try {
          setModalitiesLoading(
            true,
          )

          setModalitiesError(
            null,
          )

          const response =
            await getModalities(
              activeGym.id,
              {
                page: 1,
                limit: 100,
              },
            )

          setModalities(
            response.modalities,
          )

          setSelectedModalityId(
            (
              currentModalityId,
            ) => {
              const currentExists =
                response.modalities.some(
                  (modality) =>
                    modality.id ===
                    currentModalityId,
                )

              if (
                currentModalityId &&
                currentExists
              ) {
                return currentModalityId
              }

              const firstActive =
                response.modalities.find(
                  (modality) =>
                    modality.active,
                )

              return (
                firstActive?.id ??
                response
                  .modalities[0]
                  ?.id ??
                ''
              )
            },
          )
        } catch {
          setModalities([])

          setSelectedModalityId(
            '',
          )

          setModalitiesError(
            'Não foi possível carregar as modalidades.',
          )
        } finally {
          setModalitiesLoading(
            false,
          )
        }
      },
      [
        activeGym,
      ],
    )

  const loadSummary =
    useCallback(
      async () => {
        if (
          !activeGym ||
          !selectedModalityId ||
          !canViewGraduations
        ) {
          setSummary(
            initialSummary,
          )

          return
        }

        try {
          const [
            activeResponse,
            inactiveResponse,
          ] =
            await Promise.all([
              listGraduations(
                activeGym.id,
                selectedModalityId,
                {
                  page: 1,
                  limit: 1,
                  active:
                    true,
                },
              ),

              listGraduations(
                activeGym.id,
                selectedModalityId,
                {
                  page: 1,
                  limit: 1,
                  active:
                    false,
                },
              ),
            ])

          const activeTotal =
            activeResponse
              .pagination
              .total

          const inactiveTotal =
            inactiveResponse
              .pagination
              .total

          setSummary({
            total:
              activeTotal +
              inactiveTotal,

            active:
              activeTotal,

            inactive:
              inactiveTotal,
          })
        } catch {
          setSummary(
            initialSummary,
          )
        }
      },
      [
        activeGym,
        selectedModalityId,
        canViewGraduations,
      ],
    )

  const loadGraduations =
    useCallback(
      async () => {
        if (
          !activeGym ||
          !selectedModalityId
        ) {
          setGraduations([])

          setPagination(
            initialPagination,
          )

          setLoading(false)

          return
        }

        if (
          !canViewGraduations
        ) {
          setGraduations([])

          setPagination(
            initialPagination,
          )

          setSummary(
            initialSummary,
          )

          setError(null)

          setLoading(false)

          return
        }

        const active =
          getActiveFilter(
            statusFilter,
          )

        try {
          setLoading(true)

          setError(null)

          const response =
            await listGraduations(
              activeGym.id,
              selectedModalityId,
              {
                page,

                limit:
                  PAGE_LIMIT,

                search:
                  appliedSearch ||
                  undefined,

                active,
              },
            )

          setGraduations(
            response.graduations,
          )

          setPagination(
            response.pagination,
          )
        } catch {
          setGraduations([])

          setPagination(
            initialPagination,
          )

          setError(
            'Não foi possível carregar as graduações.',
          )
        } finally {
          setLoading(false)
        }
      },
      [
        activeGym,
        selectedModalityId,
        page,
        appliedSearch,
        statusFilter,
        canViewGraduations,
      ],
    )

  useEffect(() => {
    void loadModalities()
  }, [
    loadModalities,
  ])

  useEffect(() => {
    void loadGraduations()
  }, [
    loadGraduations,
  ])

  useEffect(() => {
    void loadSummary()
  }, [
    loadSummary,
  ])

  useEffect(() => {
    setSelectedModalityId(
      '',
    )

    setGraduations([])

    setPagination(
      initialPagination,
    )

    setSummary(
      initialSummary,
    )

    setPage(1)

    setSearchInput('')

    setAppliedSearch('')

    setStatusFilter(
      'all',
    )

    setError(null)
  }, [
    activeGym?.id,
  ])

  function handleSearch(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setPage(1)

    setAppliedSearch(
      searchInput.trim(),
    )
  }

  function handleClearFilters() {
    setSearchInput('')

    setAppliedSearch('')

    setStatusFilter(
      'all',
    )

    setPage(1)
  }

  function handleModalityChange(
    modalityId: string,
  ) {
    setSelectedModalityId(
      modalityId,
    )

    setGraduations([])

    setPagination(
      initialPagination,
    )

    setSummary(
      initialSummary,
    )

    setSearchInput('')

    setAppliedSearch('')

    setStatusFilter(
      'all',
    )

    setPage(1)

    setError(null)
  }

  function handlePreviousPage() {
    setPage(
      (currentPage) =>
        Math.max(
          1,
          currentPage - 1,
        ),
    )
  }

  function handleNextPage() {
    setPage(
      (currentPage) =>
        Math.min(
          pagination.totalPages,
          currentPage + 1,
        ),
    )
  }

  const hasFilters =
    appliedSearch.length > 0 ||
    statusFilter !== 'all'

  const hasPreviousPage =
    pagination.page > 1

  const hasNextPage =
    pagination.page <
    pagination.totalPages

  if (
    activeGym &&
    !canViewGraduations
  ) {
    return (
      <section
        className="graduations-page"
        data-testid="graduations-page"
      >
        <div
          className="graduations-access-denied"
          data-testid="graduations-access-denied"
        >
          <div className="graduations-access-denied-icon">
            !
          </div>

          <span className="graduations-eyebrow">
            Acesso restrito
          </span>

          <h1>
            Área não disponível
          </h1>

          <p>
            Seu perfil nesta academia
            não possui acesso à gestão
            de graduações.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="graduations-page"
      data-testid="graduations-page"
    >
      <header className="graduations-header">
        <div>
          <span className="graduations-eyebrow">
            Gestão acadêmica
          </span>

          <h1>
            Graduações
          </h1>

          <p>
            Consulte as faixas e
            graduações configuradas
            para cada modalidade da
            academia.
          </p>
        </div>
      </header>

      {modalitiesLoading ? (
        <div
          className="graduations-state"
          data-testid="graduations-modalities-loading"
        >
          <div
            className="graduations-loading-spinner"
            aria-hidden="true"
          />

          <span>
            Carregando modalidades...
          </span>
        </div>
      ) : modalitiesError ? (
        <div
          className="graduations-state graduations-state-error"
          data-testid="graduations-modalities-error"
        >
          <strong>
            Não foi possível carregar as modalidades
          </strong>

          <span>
            {modalitiesError}
          </span>

          <button
            type="button"
            className="graduations-button graduations-button-secondary"
            data-testid="graduations-modalities-retry-button"
            onClick={() => {
              void loadModalities()
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : modalities.length ===
        0 ? (
        <div
          className="graduations-empty"
          data-testid="graduations-no-modalities"
        >
          <h2>
            Nenhuma modalidade cadastrada
          </h2>

          <p>
            Cadastre uma modalidade
            antes de configurar suas
            graduações.
          </p>
        </div>
      ) : (
        <>
          <div
            className="graduations-modality-panel"
            data-testid="graduations-modality-panel"
          >
            <div className="graduations-field">
              <label
                htmlFor="graduations-modality"
              >
                Modalidade
              </label>

              <select
                id="graduations-modality"
                value={
                  selectedModalityId
                }
                data-testid="graduations-modality-select"
                onChange={(
                  event,
                ) => {
                  handleModalityChange(
                    event.target
                      .value,
                  )
                }}
              >
                {modalities.map(
                  (
                    modality,
                  ) => (
                    <option
                      key={
                        modality.id
                      }
                      value={
                        modality.id
                      }
                    >
                      {
                        modality.name
                      }
                      {!modality.active
                        ? ' — Inativa'
                        : ''}
                    </option>
                  ),
                )}
              </select>
            </div>

            {selectedModality ? (
              <div
                className="graduations-selected-modality"
                data-testid="graduations-selected-modality"
              >
                <div
                  className="graduations-modality-color"
                  style={
                    selectedModality.color
                      ? {
                          backgroundColor:
                            selectedModality.color,
                        }
                      : undefined
                  }
                  data-testid="graduations-selected-modality-color"
                >
                  {!selectedModality.color
                    ? selectedModality.name
                        .charAt(0)
                        .toUpperCase()
                    : null}
                </div>

                <div>
                  <span>
                    Modalidade selecionada
                  </span>

                  <strong>
                    {
                      selectedModality.name
                    }
                  </strong>

                  <small>
                    {selectedModality.active
                      ? 'Ativa'
                      : 'Inativa'}
                  </small>
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="graduations-summary"
            data-testid="graduations-summary"
          >
            <div
              className="graduations-summary-card"
              data-testid="graduations-summary-total"
            >
              <span>
                Total
              </span>

              <strong>
                {summary.total}
              </strong>

              <small>
                Graduações cadastradas
              </small>
            </div>

            <div
              className="graduations-summary-card"
              data-testid="graduations-summary-active"
            >
              <span>
                Ativas
              </span>

              <strong>
                {summary.active}
              </strong>

              <small>
                Graduações ativas
              </small>
            </div>

            <div
              className="graduations-summary-card"
              data-testid="graduations-summary-inactive"
            >
              <span>
                Inativas
              </span>

              <strong>
                {summary.inactive}
              </strong>

              <small>
                Graduações inativas
              </small>
            </div>
          </div>

          <div
            className="graduations-filters"
            data-testid="graduations-filters"
          >
            <form
              className="graduations-search-form"
              onSubmit={
                handleSearch
              }
            >
              <div className="graduations-field">
                <label
                  htmlFor="graduations-search"
                >
                  Buscar graduação
                </label>

                <input
                  id="graduations-search"
                  type="search"
                  value={
                    searchInput
                  }
                  placeholder="Nome da graduação"
                  data-testid="graduations-search-input"
                  onChange={(
                    event,
                  ) => {
                    setSearchInput(
                      event.target
                        .value,
                    )
                  }}
                />
              </div>

              <button
                type="submit"
                className="graduations-button graduations-button-primary"
                data-testid="graduations-search-button"
              >
                Buscar
              </button>
            </form>

            <div className="graduations-filter-actions">
              <div className="graduations-field">
                <label
                  htmlFor="graduations-status"
                >
                  Status
                </label>

                <select
                  id="graduations-status"
                  value={
                    statusFilter
                  }
                  data-testid="graduations-status-filter"
                  onChange={(
                    event,
                  ) => {
                    setStatusFilter(
                      event.target
                        .value as StatusFilter,
                    )

                    setPage(1)
                  }}
                >
                  <option value="all">
                    Todas
                  </option>

                  <option value="active">
                    Ativas
                  </option>

                  <option value="inactive">
                    Inativas
                  </option>
                </select>
              </div>

              {hasFilters ? (
                <button
                  type="button"
                  className="graduations-button graduations-button-secondary"
                  data-testid="graduations-clear-filters-button"
                  onClick={
                    handleClearFilters
                  }
                >
                  Limpar filtros
                </button>
              ) : null}
            </div>
          </div>

          {loading ? (
            <div
              className="graduations-state"
              data-testid="graduations-loading"
            >
              <div
                className="graduations-loading-spinner"
                aria-hidden="true"
              />

              <span>
                Carregando graduações...
              </span>
            </div>
          ) : error ? (
            <div
              className="graduations-state graduations-state-error"
              data-testid="graduations-error"
            >
              <strong>
                Não foi possível carregar as graduações
              </strong>

              <span>
                {error}
              </span>

              <button
                type="button"
                className="graduations-button graduations-button-secondary"
                data-testid="graduations-retry-button"
                onClick={() => {
                  void loadGraduations()
                  void loadSummary()
                }}
              >
                Tentar novamente
              </button>
            </div>
          ) : graduations.length ===
            0 ? (
            <div
              className="graduations-empty"
              data-testid="graduations-empty"
            >
              <h2>
                Nenhuma graduação encontrada
              </h2>

              <p>
                {hasFilters
                  ? 'Nenhuma graduação corresponde aos filtros informados.'
                  : 'Ainda não existem graduações cadastradas para esta modalidade.'}
              </p>
            </div>
          ) : (
            <>
              <div
                className="graduations-list"
                data-testid="graduations-list"
              >
                {graduations.map(
                  (
                    graduation,
                  ) => (
                    <article
                      key={
                        graduation.id
                      }
                      className="graduation-card"
                      data-testid={`graduation-card-${graduation.id}`}
                    >
                      <div className="graduation-card-main">
                        <div
                          className="graduation-order"
                          data-testid={`graduation-order-${graduation.id}`}
                        >
                          <span>
                            Ordem
                          </span>

                          <strong>
                            {
                              graduation.order
                            }
                          </strong>
                        </div>

                        <div
                          className="graduation-color"
                          data-testid={`graduation-color-${graduation.id}`}
                          style={{
                            backgroundColor:
                              graduation.color ??
                              '#27272a',

                            color:
                              graduation.textColor ??
                              '#fafafa',
                          }}
                        >
                          {!graduation.color
                            ? getGraduationInitial(
                                graduation.name,
                              )
                            : graduation.order}
                        </div>

                        <div className="graduation-info">
                          <div className="graduation-name-row">
                            <h2>
                              {
                                graduation.name
                              }
                            </h2>

                            <span
                              className={
                                graduation.active
                                  ? 'graduation-status graduation-status-active'
                                  : 'graduation-status graduation-status-inactive'
                              }
                              data-testid={`graduation-status-${graduation.id}`}
                            >
                              {graduation.active
                                ? 'Ativa'
                                : 'Inativa'}
                            </span>
                          </div>

                          <p className="graduation-description">
                            {graduation.description ??
                              'Descrição não informada.'}
                          </p>

                          <div className="graduation-meta">
                            {graduation.color ? (
                              <span>
                                Cor:{' '}
                                <strong>
                                  {
                                    graduation.color
                                  }
                                </strong>
                              </span>
                            ) : (
                              <span>
                                Cor não informada
                              </span>
                            )}

                            {graduation.textColor ? (
                              <span>
                                Texto:{' '}
                                <strong>
                                  {
                                    graduation.textColor
                                  }
                                </strong>
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>

              <div
                className="graduations-pagination"
                data-testid="graduations-pagination"
              >
                <button
                  type="button"
                  className="graduations-button graduations-button-secondary"
                  disabled={
                    !hasPreviousPage
                  }
                  data-testid="graduations-pagination-previous"
                  onClick={
                    handlePreviousPage
                  }
                >
                  Anterior
                </button>

                <span
                  className="graduations-pagination-info"
                  data-testid="graduations-pagination-info"
                >
                  Página{' '}
                  <strong>
                    {
                      pagination.page
                    }
                  </strong>{' '}
                  de{' '}
                  <strong>
                    {
                      pagination.totalPages
                    }
                  </strong>
                </span>

                <button
                  type="button"
                  className="graduations-button graduations-button-secondary"
                  disabled={
                    !hasNextPage
                  }
                  data-testid="graduations-pagination-next"
                  onClick={
                    handleNextPage
                  }
                >
                  Próxima
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}