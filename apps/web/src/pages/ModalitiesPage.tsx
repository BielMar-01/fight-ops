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
  getModalities,
} from '../services/modality.service'

import type {
  Modality,
  Pagination,
} from '../types/modality'

import '../styles/modalities.css'

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

interface ModalitySummary {
  total: number
  active: number
  inactive: number
}

const initialSummary: ModalitySummary = {
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

export function ModalitiesPage() {
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
    useState<ModalitySummary>(
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
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  )

  const canViewModalities =
    activeGym?.role ===
      'OWNER' ||
    activeGym?.role ===
      'ADMIN' ||
    activeGym?.role ===
      'RECEPTIONIST' ||
    activeGym?.role ===
      'PROFESSOR'

  const canManageModalities =
    activeGym?.role ===
      'OWNER' ||
    activeGym?.role ===
      'ADMIN'

  const loadSummary =
    useCallback(
      async () => {
        if (
          !activeGym ||
          activeGym.role ===
            'STUDENT'
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
              getModalities(
                activeGym.id,
                {
                  page: 1,
                  limit: 1,
                  active:
                    true,
                },
              ),

              getModalities(
                activeGym.id,
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
      ],
    )

  const loadModalities =
    useCallback(
      async () => {
        if (!activeGym) {
          setModalities([])

          setPagination(
            initialPagination,
          )

          setLoading(false)

          return
        }

        if (
          activeGym.role ===
          'STUDENT'
        ) {
          setModalities([])

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
            await getModalities(
              activeGym.id,
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

          setModalities(
            response.modalities,
          )

          setPagination(
            response.pagination,
          )
        } catch {
          setModalities([])

          setPagination(
            initialPagination,
          )

          setError(
            'Não foi possível carregar as modalidades.',
          )
        } finally {
          setLoading(false)
        }
      },
      [
        activeGym,
        page,
        appliedSearch,
        statusFilter,
      ],
    )

  useEffect(() => {
    void loadModalities()
  }, [
    loadModalities,
  ])

  useEffect(() => {
    void loadSummary()
  }, [
    loadSummary,
  ])

  useEffect(() => {
    setPage(1)

    setSearchInput('')

    setAppliedSearch('')

    setStatusFilter(
      'all',
    )
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
    !canViewModalities
  ) {
    return (
      <section
        className="modalities-page"
        data-testid="modalities-page"
      >
        <div
          className="modalities-access-denied"
          data-testid="modalities-access-denied"
        >
          <div className="modalities-access-denied-icon">
            !
          </div>

          <span className="modalities-eyebrow">
            Acesso restrito
          </span>

          <h1>
            Área não disponível
          </h1>

          <p>
            Seu perfil nesta academia
            não possui acesso à gestão
            de modalidades.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="modalities-page"
      data-testid="modalities-page"
    >
      <header className="modalities-header">
        <div>
          <span className="modalities-eyebrow">
            Gestão acadêmica
          </span>

          <h1>
            Modalidades
          </h1>

          <p>
            Consulte as modalidades
            disponíveis na academia
            selecionada.
          </p>
        </div>

        {canManageModalities ? (
          <div className="modalities-header-actions">
            <button
              type="button"
              className="modalities-button modalities-button-primary"
              data-testid="modalities-add-button"
              disabled
              title="Cadastro disponível na próxima etapa"
            >
              Nova modalidade
            </button>
          </div>
        ) : null}
      </header>

      <div
        className="modalities-summary"
        data-testid="modalities-summary"
      >
        <div
          className="modalities-summary-card"
          data-testid="modalities-summary-total"
        >
          <span>
            Total
          </span>

          <strong>
            {summary.total}
          </strong>

          <small>
            Modalidades cadastradas
          </small>
        </div>

        <div
          className="modalities-summary-card"
          data-testid="modalities-summary-active"
        >
          <span>
            Ativas
          </span>

          <strong>
            {summary.active}
          </strong>

          <small>
            Modalidades ativas
          </small>
        </div>

        <div
          className="modalities-summary-card"
          data-testid="modalities-summary-inactive"
        >
          <span>
            Inativas
          </span>

          <strong>
            {summary.inactive}
          </strong>

          <small>
            Modalidades inativas
          </small>
        </div>
      </div>

      <div
        className="modalities-filters"
        data-testid="modalities-filters"
      >
        <form
          className="modalities-search-form"
          onSubmit={
            handleSearch
          }
        >
          <div className="modalities-field">
            <label
              htmlFor="modalities-search"
            >
              Buscar modalidade
            </label>

            <input
              id="modalities-search"
              type="search"
              value={
                searchInput
              }
              placeholder="Nome da modalidade"
              data-testid="modalities-search-input"
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
            className="modalities-button modalities-button-primary"
            data-testid="modalities-search-button"
          >
            Buscar
          </button>
        </form>

        <div className="modalities-filter-actions">
          <div className="modalities-field">
            <label
              htmlFor="modalities-status"
            >
              Status
            </label>

            <select
              id="modalities-status"
              value={
                statusFilter
              }
              data-testid="modalities-status-filter"
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
              className="modalities-button modalities-button-secondary"
              data-testid="modalities-clear-filters-button"
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
          className="modalities-state"
          data-testid="modalities-loading"
        >
          <div
            className="modalities-loading-spinner"
            aria-hidden="true"
          />

          <span>
            Carregando modalidades...
          </span>
        </div>
      ) : error ? (
        <div
          className="modalities-state modalities-state-error"
          data-testid="modalities-error"
        >
          <strong>
            Não foi possível carregar as modalidades
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            className="modalities-button modalities-button-secondary"
            data-testid="modalities-retry-button"
            onClick={() => {
              void loadModalities()
              void loadSummary()
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : modalities.length ===
        0 ? (
        <div
          className="modalities-empty"
          data-testid="modalities-empty"
        >
          <h2>
            Nenhuma modalidade encontrada
          </h2>

          <p>
            {hasFilters
              ? 'Nenhuma modalidade corresponde aos filtros informados.'
              : 'Ainda não existem modalidades cadastradas nesta academia.'}
          </p>
        </div>
      ) : (
        <>
          <div
            className="modalities-list"
            data-testid="modalities-list"
          >
            {modalities.map(
              (
                modality,
              ) => (
                <article
                  key={
                    modality.id
                  }
                  className="modality-card"
                  data-testid={`modality-card-${modality.id}`}
                >
                  <div className="modality-card-main">
                    <div
                      className="modality-color"
                      data-testid={`modality-color-${modality.id}`}
                      style={
                        modality.color
                          ? {
                              backgroundColor:
                                modality.color,
                            }
                          : undefined
                      }
                    >
                      {!modality.color
                        ? modality.name
                            .charAt(0)
                            .toUpperCase()
                        : null}
                    </div>

                    <div className="modality-info">
                      <div className="modality-name-row">
                        <h2>
                          {
                            modality.name
                          }
                        </h2>

                        <span
                          className={
                            modality.active
                              ? 'modality-status modality-status-active'
                              : 'modality-status modality-status-inactive'
                          }
                          data-testid={`modality-status-${modality.id}`}
                        >
                          {modality.active
                            ? 'Ativa'
                            : 'Inativa'}
                        </span>
                      </div>

                      <p className="modality-description">
                        {modality.description ??
                          'Descrição não informada.'}
                      </p>

                      {modality.color ? (
                        <span className="modality-color-value">
                          Cor:{' '}
                          {
                            modality.color
                          }
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>

          <div
            className="modalities-pagination"
            data-testid="modalities-pagination"
          >
            <button
              type="button"
              className="modalities-button modalities-button-secondary"
              disabled={
                !hasPreviousPage
              }
              data-testid="modalities-pagination-previous"
              onClick={
                handlePreviousPage
              }
            >
              Anterior
            </button>

            <span
              className="modalities-pagination-info"
              data-testid="modalities-pagination-info"
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
              className="modalities-button modalities-button-secondary"
              disabled={
                !hasNextPage
              }
              data-testid="modalities-pagination-next"
              onClick={
                handleNextPage
              }
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </section>
  )
}