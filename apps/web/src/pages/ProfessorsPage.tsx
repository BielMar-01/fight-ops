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
  getProfessors,
} from '../services/professor.service'

import type {
  Pagination,
  Professor,
} from '../types/professor'

import '../styles/professors.css'

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

interface ProfessorSummary {
  total: number
  active: number
  inactive: number
}

const initialSummary: ProfessorSummary = {
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

export function ProfessorsPage() {
  const {
    activeGym,
  } = useGym()

  const [
    professors,
    setProfessors,
  ] = useState<Professor[]>(
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
    useState<ProfessorSummary>(
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

  const canViewProfessors =
    activeGym?.role ===
      'OWNER' ||
    activeGym?.role ===
      'ADMIN' ||
    activeGym?.role ===
      'RECEPTIONIST' ||
    activeGym?.role ===
      'PROFESSOR'

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
              getProfessors(
                activeGym.id,
                {
                  page: 1,
                  limit: 1,
                  active:
                    true,
                },
              ),

              getProfessors(
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

  const loadProfessors =
    useCallback(
      async () => {
        if (!activeGym) {
          setProfessors([])

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
          setProfessors([])

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
            await getProfessors(
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

          setProfessors(
            response.professors,
          )

          setPagination(
            response.pagination,
          )
        } catch {
          setProfessors([])

          setPagination(
            initialPagination,
          )

          setError(
            'Não foi possível carregar os professores.',
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
    void loadProfessors()
  }, [
    loadProfessors,
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
    !canViewProfessors
  ) {
    return (
      <section
        className="professors-page"
        data-testid="professors-page"
      >
        <div
          className="professors-access-denied"
          data-testid="professors-access-denied"
        >
          <div className="professors-access-denied-icon">
            !
          </div>

          <span className="professors-eyebrow">
            Acesso restrito
          </span>

          <h1>
            Área não disponível
          </h1>

          <p>
            Seu perfil nesta academia
            não possui acesso à gestão
            de professores.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="professors-page"
      data-testid="professors-page"
    >
      <header className="professors-header">
        <div>
          <span className="professors-eyebrow">
            Gestão acadêmica
          </span>

          <h1>
            Professores
          </h1>

          <p>
            Consulte os professores
            cadastrados na academia
            selecionada.
          </p>
        </div>
      </header>

      <div
        className="professors-summary"
        data-testid="professors-summary"
      >
        <div
          className="professors-summary-card"
          data-testid="professors-summary-total"
        >
          <span>
            Total
          </span>

          <strong>
            {summary.total}
          </strong>

          <small>
            Professores cadastrados
          </small>
        </div>

        <div
          className="professors-summary-card"
          data-testid="professors-summary-active"
        >
          <span>
            Ativos
          </span>

          <strong>
            {summary.active}
          </strong>

          <small>
            Professores ativos
          </small>
        </div>

        <div
          className="professors-summary-card"
          data-testid="professors-summary-inactive"
        >
          <span>
            Inativos
          </span>

          <strong>
            {summary.inactive}
          </strong>

          <small>
            Professores inativos
          </small>
        </div>
      </div>

      <div
        className="professors-filters"
        data-testid="professors-filters"
      >
        <form
          className="professors-search-form"
          onSubmit={
            handleSearch
          }
        >
          <div className="professors-field">
            <label
              htmlFor="professors-search"
            >
              Buscar professor
            </label>

            <input
              id="professors-search"
              type="search"
              value={
                searchInput
              }
              placeholder="Nome, e-mail ou telefone"
              data-testid="professors-search-input"
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
            className="professors-button professors-button-primary"
            data-testid="professors-search-button"
          >
            Buscar
          </button>
        </form>

        <div className="professors-filter-actions">
          <div className="professors-field">
            <label
              htmlFor="professors-status"
            >
              Status
            </label>

            <select
              id="professors-status"
              value={
                statusFilter
              }
              data-testid="professors-status-filter"
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
                Todos
              </option>

              <option value="active">
                Ativos
              </option>

              <option value="inactive">
                Inativos
              </option>
            </select>
          </div>

          {hasFilters ? (
            <button
              type="button"
              className="professors-button professors-button-secondary"
              data-testid="professors-clear-filters-button"
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
          className="professors-state"
          data-testid="professors-loading"
        >
          <div
            className="professors-loading-spinner"
            aria-hidden="true"
          />

          <span>
            Carregando professores...
          </span>
        </div>
      ) : error ? (
        <div
          className="professors-state professors-state-error"
          data-testid="professors-error"
        >
          <strong>
            Não foi possível carregar os professores
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            className="professors-button professors-button-secondary"
            data-testid="professors-retry-button"
            onClick={() => {
              void loadProfessors()
              void loadSummary()
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : professors.length ===
        0 ? (
        <div
          className="professors-empty"
          data-testid="professors-empty"
        >
          <h2>
            Nenhum professor encontrado
          </h2>

          <p>
            {hasFilters
              ? 'Nenhum professor corresponde aos filtros informados.'
              : 'Ainda não existem professores cadastrados nesta academia.'}
          </p>
        </div>
      ) : (
        <>
          <div
            className="professors-list"
            data-testid="professors-list"
          >
            {professors.map(
              (
                professor,
              ) => (
                <article
                  key={
                    professor.id
                  }
                  className="professor-card"
                  data-testid={`professor-card-${professor.id}`}
                >
                  <div className="professor-card-main">
                    <div className="professor-avatar">
                      {professor.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="professor-info">
                      <div className="professor-name-row">
                        <h2>
                          {
                            professor.name
                          }
                        </h2>

                        <span
                          className={
                            professor.active
                              ? 'professor-status professor-status-active'
                              : 'professor-status professor-status-inactive'
                          }
                          data-testid={`professor-status-${professor.id}`}
                        >
                          {professor.active
                            ? 'Ativo'
                            : 'Inativo'}
                        </span>
                      </div>

                      <div className="professor-contact">
                        <span>
                          {professor.email ??
                            'E-mail não informado'}
                        </span>

                        <span>
                          {professor.phone ??
                            'Telefone não informado'}
                        </span>
                      </div>

                      {professor.hireDate ? (
                        <span className="professor-hire-date">
                          Contratação:{' '}
                          {new Intl.DateTimeFormat(
                            'pt-BR',
                          ).format(
                            new Date(
                              professor.hireDate,
                            ),
                          )}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>

          <div
            className="professors-pagination"
            data-testid="professors-pagination"
          >
            <button
              type="button"
              className="professors-button professors-button-secondary"
              disabled={
                !hasPreviousPage
              }
              data-testid="professors-pagination-previous"
              onClick={
                handlePreviousPage
              }
            >
              Anterior
            </button>

            <span
              className="professors-pagination-info"
              data-testid="professors-pagination-info"
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
              className="professors-button professors-button-secondary"
              disabled={
                !hasNextPage
              }
              data-testid="professors-pagination-next"
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