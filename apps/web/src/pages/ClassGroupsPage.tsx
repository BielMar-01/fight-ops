import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'

import { useGym } from '../contexts/GymContext'

import { getClassGroups } from '../services/class-group.service'

import { getModalities } from '../services/modality.service'

import type {
  ClassGroup,
  ClassGroupLevel,
  Pagination,
} from '../types/class-group'

import type { Modality } from '../types/modality'

import '../styles/class-groups.css'

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

type LevelFilter =
  | 'all'
  | ClassGroupLevel

interface ClassGroupSummary {
  total: number
  active: number
  inactive: number
}

const initialSummary: ClassGroupSummary = {
  total: 0,
  active: 0,
  inactive: 0,
}

const levelLabels: Record<
  ClassGroupLevel,
  string
> = {
  BEGINNER: 'Iniciante',
  INTERMEDIATE: 'Intermediário',
  ADVANCED: 'Avançado',
  MIXED: 'Misto',
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

function formatAgeRange(
  minimumAge: number | null,
  maximumAge: number | null,
) {
  if (
    minimumAge !== null &&
    maximumAge !== null
  ) {
    return `${minimumAge} a ${maximumAge} anos`
  }

  if (minimumAge !== null) {
    return `A partir de ${minimumAge} anos`
  }

  if (maximumAge !== null) {
    return `Até ${maximumAge} anos`
  }

  return 'Todas as idades'
}

function getClassGroupInitial(name: string) {
  return name.charAt(0).toUpperCase()
}

export function ClassGroupsPage() {
  const { activeGym } = useGym()

  const [classGroups, setClassGroups] =
    useState<ClassGroup[]>([])

  const [modalities, setModalities] =
    useState<Modality[]>([])

  const [pagination, setPagination] =
    useState<Pagination>(
      initialPagination,
    )

  const [summary, setSummary] =
    useState<ClassGroupSummary>(
      initialSummary,
    )

  const [page, setPage] = useState(1)

  const [searchInput, setSearchInput] =
    useState('')

  const [appliedSearch, setAppliedSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all')

  const [modalityFilter, setModalityFilter] =
    useState('all')

  const [levelFilter, setLevelFilter] =
    useState<LevelFilter>('all')

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const canViewClassGroups =
    activeGym?.role === 'OWNER' ||
    activeGym?.role === 'ADMIN' ||
    activeGym?.role ===
      'RECEPTIONIST' ||
    activeGym?.role === 'PROFESSOR'

  const canManageClassGroups =
    activeGym?.role === 'OWNER' ||
    activeGym?.role === 'ADMIN'

  const loadModalities =
    useCallback(async () => {
      if (
        !activeGym ||
        !canViewClassGroups
      ) {
        setModalities([])

        return
      }

      try {
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
      } catch {
        setModalities([])
      }
    }, [
      activeGym,
      canViewClassGroups,
    ])

  const loadSummary =
    useCallback(async () => {
      if (
        !activeGym ||
        !canViewClassGroups
      ) {
        setSummary(initialSummary)

        return
      }

      try {
        const [
          activeResponse,
          inactiveResponse,
        ] = await Promise.all([
          getClassGroups(
            activeGym.id,
            {
              page: 1,
              limit: 1,
              active: true,
            },
          ),

          getClassGroups(
            activeGym.id,
            {
              page: 1,
              limit: 1,
              active: false,
            },
          ),
        ])

        const activeTotal =
          activeResponse.pagination
            .total

        const inactiveTotal =
          inactiveResponse.pagination
            .total

        setSummary({
          total:
            activeTotal +
            inactiveTotal,
          active: activeTotal,
          inactive: inactiveTotal,
        })
      } catch {
        setSummary(initialSummary)
      }
    }, [
      activeGym,
      canViewClassGroups,
    ])

  const loadClassGroups =
    useCallback(async () => {
      if (!activeGym) {
        setClassGroups([])

        setPagination(
          initialPagination,
        )

        setLoading(false)

        return
      }

      if (!canViewClassGroups) {
        setClassGroups([])

        setPagination(
          initialPagination,
        )

        setSummary(initialSummary)

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
          await getClassGroups(
            activeGym.id,
            {
              page,
              limit: PAGE_LIMIT,
              search:
                appliedSearch ||
                undefined,
              active,
              modalityId:
                modalityFilter ===
                'all'
                  ? undefined
                  : modalityFilter,
              level:
                levelFilter === 'all'
                  ? undefined
                  : levelFilter,
            },
          )

        setClassGroups(
          response.classGroups,
        )

        setPagination(
          response.pagination,
        )
      } catch {
        setClassGroups([])

        setPagination(
          initialPagination,
        )

        setError(
          'Não foi possível carregar as turmas.',
        )
      } finally {
        setLoading(false)
      }
    }, [
      activeGym,
      canViewClassGroups,
      page,
      appliedSearch,
      statusFilter,
      modalityFilter,
      levelFilter,
    ])

  useEffect(() => {
    void loadModalities()
  }, [loadModalities])

  useEffect(() => {
    void loadClassGroups()
  }, [loadClassGroups])

  useEffect(() => {
    void loadSummary()
  }, [loadSummary])

  useEffect(() => {
    setClassGroups([])

    setModalities([])

    setPagination(
      initialPagination,
    )

    setSummary(initialSummary)

    setPage(1)

    setSearchInput('')

    setAppliedSearch('')

    setStatusFilter('all')

    setModalityFilter('all')

    setLevelFilter('all')

    setError(null)
  }, [activeGym?.id])

  function handleSearch(
    event: FormEvent<HTMLFormElement>,
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

    setStatusFilter('all')

    setModalityFilter('all')

    setLevelFilter('all')

    setPage(1)
  }

  function handlePreviousPage() {
    setPage((currentPage) =>
      Math.max(
        1,
        currentPage - 1,
      ),
    )
  }

  function handleNextPage() {
    setPage((currentPage) =>
      Math.min(
        pagination.totalPages,
        currentPage + 1,
      ),
    )
  }

  const hasFilters =
    appliedSearch.length > 0 ||
    statusFilter !== 'all' ||
    modalityFilter !== 'all' ||
    levelFilter !== 'all'

  const hasPreviousPage =
    pagination.page > 1

  const hasNextPage =
    pagination.page <
    pagination.totalPages

  if (
    activeGym &&
    !canViewClassGroups
  ) {
    return (
      <section
        className="class-groups-page"
        data-testid="class-groups-page"
      >
        <div
          className="class-groups-access-denied"
          data-testid="class-groups-access-denied"
        >
          <div className="class-groups-access-denied-icon">
            !
          </div>

          <span className="class-groups-eyebrow">
            Acesso restrito
          </span>

          <h1>Área não disponível</h1>

          <p>
            Seu perfil nesta academia
            não possui acesso à gestão
            de turmas.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="class-groups-page"
      data-testid="class-groups-page"
    >
      <header className="class-groups-header">
        <div>
          <span className="class-groups-eyebrow">
            Gestão acadêmica
          </span>

          <h1>Turmas</h1>

          <p>
            Consulte e gerencie as turmas
            oferecidas pela academia
            selecionada.
          </p>
        </div>

        {canManageClassGroups ? (
          <div className="class-groups-header-actions">
            <button
              type="button"
              className="class-groups-button class-groups-button-primary"
              data-testid="class-groups-add-button"
              disabled
              title="O cadastro será implementado na próxima etapa."
            >
              Nova turma
            </button>
          </div>
        ) : null}
      </header>

      <div
        className="class-groups-summary"
        data-testid="class-groups-summary"
      >
        <div className="class-groups-summary-card">
          <span>Total</span>

          <strong>
            {summary.total}
          </strong>

          <small>
            Turmas cadastradas
          </small>
        </div>

        <div className="class-groups-summary-card">
          <span>Ativas</span>

          <strong>
            {summary.active}
          </strong>

          <small>
            Turmas disponíveis
          </small>
        </div>

        <div className="class-groups-summary-card">
          <span>Inativas</span>

          <strong>
            {summary.inactive}
          </strong>

          <small>
            Turmas indisponíveis
          </small>
        </div>
      </div>

      <div className="class-groups-filters">
        <form
          className="class-groups-search-form"
          onSubmit={handleSearch}
        >
          <div className="class-groups-field">
            <label htmlFor="class-groups-search">
              Buscar turma
            </label>

            <input
              id="class-groups-search"
              type="search"
              value={searchInput}
              placeholder="Nome, descrição ou modalidade"
              maxLength={150}
              onChange={(event) => {
                setSearchInput(
                  event.target.value,
                )
              }}
            />
          </div>

          <button
            type="submit"
            className="class-groups-button class-groups-button-primary"
          >
            Buscar
          </button>
        </form>

        <div className="class-groups-filter-grid">
          <div className="class-groups-field">
            <label htmlFor="class-groups-status">
              Status
            </label>

            <select
              id="class-groups-status"
              value={statusFilter}
              onChange={(event) => {
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
                Ativas
              </option>

              <option value="inactive">
                Inativas
              </option>
            </select>
          </div>

          <div className="class-groups-field">
            <label htmlFor="class-groups-modality">
              Modalidade
            </label>

            <select
              id="class-groups-modality"
              value={modalityFilter}
              onChange={(event) => {
                setModalityFilter(
                  event.target.value,
                )

                setPage(1)
              }}
            >
              <option value="all">
                Todas
              </option>

              {modalities.map(
                (modality) => (
                  <option
                    key={modality.id}
                    value={modality.id}
                  >
                    {modality.name}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="class-groups-field">
            <label htmlFor="class-groups-level">
              Nível
            </label>

            <select
              id="class-groups-level"
              value={levelFilter}
              onChange={(event) => {
                setLevelFilter(
                  event.target
                    .value as LevelFilter,
                )

                setPage(1)
              }}
            >
              <option value="all">
                Todos
              </option>

              <option value="BEGINNER">
                Iniciante
              </option>

              <option value="INTERMEDIATE">
                Intermediário
              </option>

              <option value="ADVANCED">
                Avançado
              </option>

              <option value="MIXED">
                Misto
              </option>
            </select>
          </div>

          {hasFilters ? (
            <button
              type="button"
              className="class-groups-button class-groups-button-secondary"
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
        <div className="class-groups-state">
          <div className="class-groups-loading-spinner" />

          <span>
            Carregando turmas...
          </span>
        </div>
      ) : null}

      {!loading && error ? (
        <div className="class-groups-state class-groups-state-error">
          <strong>
            Não foi possível carregar
          </strong>

          <span>{error}</span>

          <button
            type="button"
            className="class-groups-button class-groups-button-secondary"
            onClick={() => {
              void loadClassGroups()
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : null}

      {!loading &&
      !error &&
      classGroups.length === 0 ? (
        <div className="class-groups-empty">
          <h2>
            Nenhuma turma encontrada
          </h2>

          <p>
            {hasFilters
              ? 'Altere ou limpe os filtros para buscar outras turmas.'
              : 'As turmas cadastradas aparecerão aqui.'}
          </p>
        </div>
      ) : null}

      {!loading &&
      !error &&
      classGroups.length > 0 ? (
        <div className="class-groups-list">
          {classGroups.map(
            (classGroup) => (
              <article
                key={classGroup.id}
                className="class-group-card"
                data-testid={`class-group-card-${classGroup.id}`}
              >
                <div className="class-group-card-main">
                  <div
                    className="class-group-avatar"
                    style={{
                      borderColor:
                        classGroup
                          .modality
                          .color ??
                        undefined,
                      color:
                        classGroup
                          .modality
                          .color ??
                        undefined,
                    }}
                  >
                    {getClassGroupInitial(
                      classGroup.name,
                    )}
                  </div>

                  <div className="class-group-info">
                    <div className="class-group-name-row">
                      <div>
                        <h2>
                          {
                            classGroup.name
                          }
                        </h2>

                        <span className="class-group-modality">
                          {
                            classGroup
                              .modality
                              .name
                          }
                        </span>
                      </div>

                      <span
                        className={
                          classGroup.active
                            ? 'class-group-status class-group-status-active'
                            : 'class-group-status class-group-status-inactive'
                        }
                      >
                        {classGroup.active
                          ? 'Ativa'
                          : 'Inativa'}
                      </span>
                    </div>

                    {classGroup.description ? (
                      <p className="class-group-description">
                        {
                          classGroup.description
                        }
                      </p>
                    ) : null}

                    <div className="class-group-details">
                      <span>
                        <strong>
                          Nível:
                        </strong>{' '}
                        {
                          levelLabels[
                            classGroup
                              .level
                          ]
                        }
                      </span>

                      <span>
                        <strong>
                          Idade:
                        </strong>{' '}
                        {formatAgeRange(
                          classGroup.minimumAge,
                          classGroup.maximumAge,
                        )}
                      </span>

                      <span>
                        <strong>
                          Duração:
                        </strong>{' '}
                        {
                          classGroup.durationMinutes
                        }{' '}
                        minutos
                      </span>

                      <span>
                        <strong>
                          Capacidade:
                        </strong>{' '}
                        {classGroup.maxStudents !==
                        null
                          ? `${classGroup.maxStudents} alunos`
                          : 'Sem limite definido'}
                      </span>
                    </div>

                    <div className="class-group-professors">
                      <span>
                        <strong>
                          Professor principal:
                        </strong>{' '}
                        {classGroup
                          .primaryProfessor
                          ?.name ??
                          'Não definido'}
                      </span>

                      <span>
                        <strong>
                          Auxiliares:
                        </strong>{' '}
                        {
                          classGroup
                            .assistantProfessors
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      ) : null}

      {!loading &&
      !error &&
      pagination.total > 0 ? (
        <div className="class-groups-pagination">
          <span className="class-groups-pagination-info">
            Página{' '}
            <strong>
              {pagination.page}
            </strong>{' '}
            de{' '}
            <strong>
              {Math.max(
                pagination.totalPages,
                1,
              )}
            </strong>
            {' · '}
            {pagination.total}{' '}
            {pagination.total === 1
              ? 'turma'
              : 'turmas'}
          </span>

          <div className="class-groups-pagination-actions">
            <button
              type="button"
              className="class-groups-button class-groups-button-secondary"
              disabled={
                !hasPreviousPage
              }
              onClick={
                handlePreviousPage
              }
            >
              Anterior
            </button>

            <button
              type="button"
              className="class-groups-button class-groups-button-secondary"
              disabled={!hasNextPage}
              onClick={
                handleNextPage
              }
            >
              Próxima
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}