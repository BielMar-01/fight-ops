import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { ManageClassScheduleModal } from '../components/class-schedules/ManageClassScheduleModal'

import { WeeklyClassScheduleView } from '../components/class-schedules/WeeklyClassScheduleView'

import { useGym } from '../contexts/GymContext'

import { getClassGroups } from '../services/class-group.service'

import {
  getClassSchedules,
  updateClassScheduleStatus,
} from '../services/class-schedule.service'

import { getModalities } from '../services/modality.service'

import type {
  ClassGroup,
} from '../types/class-group'

import type {
  ClassSchedule,
  ClassSchedulePagination,
  Weekday,
} from '../types/class-schedule'

import type {
  Modality,
} from '../types/modality'

import '../styles/class-schedules.css'

const PAGE_LIMIT = 10

const WEEKLY_LIMIT = 100

const initialPagination: ClassSchedulePagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
}

const weekdayLabels: Record<
  Weekday,
  string
> = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
}

const weekdayOrder: Record<
  Weekday,
  number
> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

type StatusFilter =
  | 'all'
  | 'active'
  | 'inactive'

type WeekdayFilter =
  | 'all'
  | Weekday

type ViewMode =
  | 'list'
  | 'weekly'

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

function formatDate(
  value: string | null,
) {
  if (!value) {
    return 'Sem limite'
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
  ).format(
    new Date(`${value}T00:00:00`),
  )
}

function getProfessorNames(
  classSchedule: ClassSchedule,
) {
  const names: string[] = []

  if (
    classSchedule.classGroup
      .primaryProfessor
  ) {
    names.push(
      classSchedule.classGroup
        .primaryProfessor.name,
    )
  }

  for (
    const professor of
    classSchedule.classGroup
      .assistantProfessors
  ) {
    names.push(professor.name)
  }

  return names.length > 0
    ? names.join(', ')
    : 'Sem professor'
}

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Não foi possível concluir a operação.'
}

export function ClassSchedulesPage() {
  const { activeGym } = useGym()

  const [
    classSchedules,
    setClassSchedules,
  ] = useState<ClassSchedule[]>([])

  const [
    classGroups,
    setClassGroups,
  ] = useState<ClassGroup[]>([])

  const [
    modalities,
    setModalities,
  ] = useState<Modality[]>([])

  const [
    pagination,
    setPagination,
  ] = useState<ClassSchedulePagination>(
    initialPagination,
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
  ] = useState<StatusFilter>('all')

  const [
    weekdayFilter,
    setWeekdayFilter,
  ] = useState<WeekdayFilter>('all')

  const [
    modalityFilter,
    setModalityFilter,
  ] = useState('all')

  const [
    classGroupFilter,
    setClassGroupFilter,
  ] = useState('all')

  const [
    validOnFilter,
    setValidOnFilter,
  ] = useState('')

  const [
    viewMode,
    setViewMode,
  ] = useState<ViewMode>('list')

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    optionsLoading,
    setOptionsLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(null)

  const [
    actionError,
    setActionError,
  ] = useState<string | null>(null)

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false)

  const [
    selectedClassSchedule,
    setSelectedClassSchedule,
  ] = useState<ClassSchedule | null>(
    null,
  )

  const [
    updatingStatusId,
    setUpdatingStatusId,
  ] = useState<string | null>(null)

  const canViewClassSchedules =
    activeGym?.role === 'OWNER' ||
    activeGym?.role === 'ADMIN' ||
    activeGym?.role ===
      'RECEPTIONIST' ||
    activeGym?.role === 'PROFESSOR'

  const canManageClassSchedules =
    activeGym?.role === 'OWNER' ||
    activeGym?.role === 'ADMIN'

  const sortedClassSchedules =
    useMemo(() => {
      return [
        ...classSchedules,
      ].sort((first, second) => {
        const weekdayDifference =
          weekdayOrder[first.weekday] -
          weekdayOrder[second.weekday]

        if (weekdayDifference !== 0) {
          return weekdayDifference
        }

        return first.startTime.localeCompare(
          second.startTime,
        )
      })
    }, [classSchedules])

  const summary =
    useMemo(() => {
      return {
        total:
          pagination.total,

        visible:
          classSchedules.length,

        active:
          classSchedules.filter(
            (schedule) =>
              schedule.active,
          ).length,

        inactive:
          classSchedules.filter(
            (schedule) =>
              !schedule.active,
          ).length,
      }
    }, [
      classSchedules,
      pagination.total,
    ])

  const loadOptions =
    useCallback(async () => {
      if (
        !activeGym ||
        !canViewClassSchedules
      ) {
        setClassGroups([])
        setModalities([])
        setOptionsLoading(false)

        return
      }

      setOptionsLoading(true)

      try {
        const [
          classGroupResponse,
          modalityResponse,
        ] = await Promise.all([
          getClassGroups(
            activeGym.id,
            {
              page: 1,
              limit: 100,
            },
          ),

          getModalities(
            activeGym.id,
            {
              page: 1,
              limit: 100,
            },
          ),
        ])

        setClassGroups(
          classGroupResponse.classGroups,
        )

        setModalities(
          modalityResponse.modalities,
        )
      } catch (loadError) {
        setError(
          getErrorMessage(loadError),
        )
      } finally {
        setOptionsLoading(false)
      }
    }, [
      activeGym,
      canViewClassSchedules,
    ])

  const loadClassSchedules =
    useCallback(async () => {
      if (
        !activeGym ||
        !canViewClassSchedules
      ) {
        setClassSchedules([])

        setPagination(
          initialPagination,
        )

        setLoading(false)

        return
      }

      setLoading(true)
      setError(null)

      try {
        const response =
          await getClassSchedules(
            activeGym.id,
            {
              page:
                viewMode === 'weekly'
                  ? 1
                  : page,

              limit:
                viewMode === 'weekly'
                  ? WEEKLY_LIMIT
                  : PAGE_LIMIT,

              search:
                appliedSearch ||
                undefined,

              active:
                getActiveFilter(
                  statusFilter,
                ),

              weekday:
                weekdayFilter ===
                'all'
                  ? undefined
                  : weekdayFilter,

              modalityId:
                modalityFilter ===
                'all'
                  ? undefined
                  : modalityFilter,

              classGroupId:
                classGroupFilter ===
                'all'
                  ? undefined
                  : classGroupFilter,

              validOn:
                validOnFilter ||
                undefined,
            },
          )

        setClassSchedules(
          response.classSchedules,
        )

        setPagination(
          response.pagination,
        )
      } catch (loadError) {
        setClassSchedules([])

        setPagination(
          initialPagination,
        )

        setError(
          getErrorMessage(loadError),
        )
      } finally {
        setLoading(false)
      }
    }, [
      activeGym,
      appliedSearch,
      canViewClassSchedules,
      classGroupFilter,
      modalityFilter,
      page,
      statusFilter,
      validOnFilter,
      viewMode,
      weekdayFilter,
    ])

  useEffect(() => {
    setPage(1)
    setSearchInput('')
    setAppliedSearch('')
    setStatusFilter('all')
    setWeekdayFilter('all')
    setModalityFilter('all')
    setClassGroupFilter('all')
    setValidOnFilter('')
    setViewMode('list')
    setSelectedClassSchedule(null)
    setModalOpen(false)
    setActionError(null)
  }, [activeGym?.id])

  useEffect(() => {
    void loadOptions()
  }, [loadOptions])

  useEffect(() => {
    void loadClassSchedules()
  }, [loadClassSchedules])

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
    setWeekdayFilter('all')
    setModalityFilter('all')
    setClassGroupFilter('all')
    setValidOnFilter('')
    setPage(1)
  }

  function handleOpenCreateModal() {
    setSelectedClassSchedule(null)
    setActionError(null)
    setModalOpen(true)
  }

  function handleOpenEditModal(
    classSchedule: ClassSchedule,
  ) {
    setSelectedClassSchedule(
      classSchedule,
    )

    setActionError(null)
    setModalOpen(true)
  }

  function handleCloseModal() {
    setModalOpen(false)
    setSelectedClassSchedule(null)
  }

  function handleScheduleSaved(
    classSchedule: ClassSchedule,
  ) {
    setModalOpen(false)
    setSelectedClassSchedule(null)
    setActionError(null)

    setClassSchedules(
      (currentSchedules) => {
        const scheduleExists =
          currentSchedules.some(
            (schedule) =>
              schedule.id ===
              classSchedule.id,
          )

        if (scheduleExists) {
          return currentSchedules.map(
            (schedule) =>
              schedule.id ===
              classSchedule.id
                ? classSchedule
                : schedule,
          )
        }

        return [
          classSchedule,
          ...currentSchedules,
        ]
      },
    )

    void loadClassSchedules()
  }

  async function handleUpdateStatus(
    classSchedule: ClassSchedule,
  ) {
    if (
      !activeGym ||
      updatingStatusId
    ) {
      return
    }

    const nextStatus =
      !classSchedule.active

    const action =
      nextStatus
        ? 'ativar'
        : 'inativar'

    const confirmed =
      window.confirm(
        `Deseja realmente ${action} o horário da turma "${classSchedule.classGroup.name}"?`,
      )

    if (!confirmed) {
      return
    }

    setUpdatingStatusId(
      classSchedule.id,
    )

    setActionError(null)

    try {
      const response =
        await updateClassScheduleStatus(
          activeGym.id,
          classSchedule.id,
          {
            active: nextStatus,
          },
        )

      setClassSchedules(
        (currentSchedules) =>
          currentSchedules.map(
            (schedule) =>
              schedule.id ===
              response.classSchedule.id
                ? response.classSchedule
                : schedule,
          ),
      )

      await loadClassSchedules()
    } catch (statusError) {
      setActionError(
        getErrorMessage(statusError),
      )
    } finally {
      setUpdatingStatusId(null)
    }
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

  function handleChangeViewMode(
    nextViewMode: ViewMode,
  ) {
    setViewMode(nextViewMode)
    setPage(1)
  }

  if (!activeGym) {
    return (
      <main className="class-schedules-page">
        <section className="class-schedules-state">
          <strong>
            Nenhuma academia selecionada
          </strong>

          <p>
            Selecione uma academia para
            consultar a grade de horários.
          </p>
        </section>
      </main>
    )
  }

  if (!canViewClassSchedules) {
    return (
      <main className="class-schedules-page">
        <section className="class-schedules-state class-schedules-state-error">
          <strong>
            Acesso não autorizado
          </strong>

          <p>
            Seu perfil não possui permissão
            para visualizar a grade de
            horários.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="class-schedules-page">
      <header className="class-schedules-header">
        <div>
          <span className="class-schedules-eyebrow">
            Gestão acadêmica
          </span>

          <h1>
            Grade de horários
          </h1>

          <p>
            Organize os horários recorrentes
            das turmas, professores e espaços
            da academia.
          </p>
        </div>

        {canManageClassSchedules && (
          <button
            className="class-schedules-button class-schedules-button-primary"
            type="button"
            onClick={
              handleOpenCreateModal
            }
          >
            Novo horário
          </button>
        )}
      </header>

      <section className="class-schedules-summary">
        <article>
          <span>
            Total encontrado
          </span>

          <strong>
            {summary.total}
          </strong>
        </article>

        <article>
          <span>
            Em exibição
          </span>

          <strong>
            {summary.visible}
          </strong>
        </article>

        <article>
          <span>
            Ativos exibidos
          </span>

          <strong>
            {summary.active}
          </strong>
        </article>

        <article>
          <span>
            Inativos exibidos
          </span>

          <strong>
            {summary.inactive}
          </strong>
        </article>
      </section>

      <section className="class-schedules-panel">
        <form
          className="class-schedules-filters"
          onSubmit={handleSearch}
        >
          <label className="class-schedules-field class-schedules-field-search">
            <span>
              Buscar
            </span>

            <input
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              placeholder="Turma, modalidade, professor ou local"
            />
          </label>

          <label className="class-schedules-field">
            <span>
              Status
            </span>

            <select
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
                Ativos
              </option>

              <option value="inactive">
                Inativos
              </option>
            </select>
          </label>

          <label className="class-schedules-field">
            <span>
              Dia
            </span>

            <select
              value={weekdayFilter}
              onChange={(event) => {
                setWeekdayFilter(
                  event.target
                    .value as WeekdayFilter,
                )

                setPage(1)
              }}
            >
              <option value="all">
                Todos
              </option>

              {Object.entries(
                weekdayLabels,
              ).map(
                ([
                  weekday,
                  label,
                ]) => (
                  <option
                    key={weekday}
                    value={weekday}
                  >
                    {label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="class-schedules-field">
            <span>
              Modalidade
            </span>

            <select
              value={modalityFilter}
              disabled={optionsLoading}
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
          </label>

          <label className="class-schedules-field">
            <span>
              Turma
            </span>

            <select
              value={classGroupFilter}
              disabled={optionsLoading}
              onChange={(event) => {
                setClassGroupFilter(
                  event.target.value,
                )

                setPage(1)
              }}
            >
              <option value="all">
                Todas
              </option>

              {classGroups.map(
                (classGroup) => (
                  <option
                    key={classGroup.id}
                    value={classGroup.id}
                  >
                    {classGroup.name}
                  </option>
                ),
              )}
            </select>
          </label>

          <label className="class-schedules-field">
            <span>
              Vigente em
            </span>

            <input
              type="date"
              value={validOnFilter}
              onChange={(event) => {
                setValidOnFilter(
                  event.target.value,
                )

                setPage(1)
              }}
            />
          </label>

          <div className="class-schedules-filter-actions">
            <button
              className="class-schedules-button class-schedules-button-primary"
              type="submit"
            >
              Buscar
            </button>

            <button
              className="class-schedules-button class-schedules-button-secondary"
              type="button"
              onClick={
                handleClearFilters
              }
            >
              Limpar
            </button>
          </div>
        </form>
      </section>

      <div className="class-schedules-view-options">
        <span>
          Visualização
        </span>

        <div>
          <button
            type="button"
            className={
              viewMode === 'list'
                ? 'active'
                : ''
            }
            aria-pressed={
              viewMode === 'list'
            }
            onClick={() =>
              handleChangeViewMode(
                'list',
              )
            }
          >
            Lista
          </button>

          <button
            type="button"
            className={
              viewMode === 'weekly'
                ? 'active'
                : ''
            }
            aria-pressed={
              viewMode === 'weekly'
            }
            onClick={() =>
              handleChangeViewMode(
                'weekly',
              )
            }
          >
            Semana
          </button>
        </div>
      </div>

      {actionError && (
        <div
          className="class-schedules-action-error"
          role="alert"
        >
          <span>
            {actionError}
          </span>

          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() =>
              setActionError(null)
            }
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <section className="class-schedules-state">
          <div className="class-schedules-spinner" />

          <strong>
            Carregando horários...
          </strong>
        </section>
      )}

      {!loading && error && (
        <section className="class-schedules-state class-schedules-state-error">
          <strong>
            Não foi possível carregar
          </strong>

          <p>
            {error}
          </p>

          <button
            className="class-schedules-button class-schedules-button-secondary"
            type="button"
            onClick={() =>
              void loadClassSchedules()
            }
          >
            Tentar novamente
          </button>
        </section>
      )}

      {!loading &&
        !error &&
        sortedClassSchedules.length ===
          0 && (
          <section className="class-schedules-state">
            <strong>
              Nenhum horário encontrado
            </strong>

            <p>
              Ajuste os filtros ou cadastre
              um novo horário para uma turma.
            </p>
          </section>
        )}

      {!loading &&
        !error &&
        sortedClassSchedules.length >
          0 && (
          <>
            {viewMode === 'list' && (
              <section className="class-schedules-list">
                {sortedClassSchedules.map(
                  (classSchedule) => {
                    const updatingStatus =
                      updatingStatusId ===
                      classSchedule.id

                    return (
                      <article
                        className={`class-schedule-card ${
                          classSchedule.active
                            ? ''
                            : 'class-schedule-card-inactive'
                        }`}
                        key={
                          classSchedule.id
                        }
                      >
                        <div className="class-schedule-time">
                          <span>
                            {
                              weekdayLabels[
                                classSchedule
                                  .weekday
                              ]
                            }
                          </span>

                          <strong>
                            {
                              classSchedule.startTime
                            }
                            {' — '}
                            {
                              classSchedule.endTime
                            }
                          </strong>
                        </div>

                        <div className="class-schedule-main">
                          <div className="class-schedule-heading">
                            <div>
                              <span
                                className="class-schedule-modality-color"
                                style={{
                                  backgroundColor:
                                    classSchedule
                                      .classGroup
                                      .modality
                                      .color ||
                                    '#ef4444',
                                }}
                              />

                              <h2>
                                {
                                  classSchedule
                                    .classGroup
                                    .name
                                }
                              </h2>
                            </div>

                            <span
                              className={`class-schedule-status ${
                                classSchedule.active
                                  ? 'class-schedule-status-active'
                                  : 'class-schedule-status-inactive'
                              }`}
                            >
                              {classSchedule.active
                                ? 'Ativo'
                                : 'Inativo'}
                            </span>
                          </div>

                          <p className="class-schedule-modality">
                            {
                              classSchedule
                                .classGroup
                                .modality.name
                            }
                          </p>

                          <div className="class-schedule-information">
                            <div>
                              <span>
                                Professores
                              </span>

                              <strong>
                                {getProfessorNames(
                                  classSchedule,
                                )}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Local
                              </span>

                              <strong>
                                {classSchedule.room ||
                                  'Não informado'}
                              </strong>
                            </div>

                            <div>
                              <span>
                                Vigência
                              </span>

                              <strong>
                                {formatDate(
                                  classSchedule.validFrom,
                                )}
                                {' até '}
                                {formatDate(
                                  classSchedule.validUntil,
                                )}
                              </strong>
                            </div>
                          </div>

                          {classSchedule.notes && (
                            <p className="class-schedule-notes">
                              {
                                classSchedule.notes
                              }
                            </p>
                          )}

                          {canManageClassSchedules && (
                            <div className="class-schedule-actions">
                              <button
                                type="button"
                                disabled={
                                  updatingStatus
                                }
                                onClick={() =>
                                  handleOpenEditModal(
                                    classSchedule,
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                disabled={
                                  updatingStatus
                                }
                                onClick={() =>
                                  void handleUpdateStatus(
                                    classSchedule,
                                  )
                                }
                              >
                                {updatingStatus
                                  ? 'Salvando...'
                                  : classSchedule.active
                                    ? 'Inativar'
                                    : 'Ativar'}
                              </button>
                            </div>
                          )}
                        </div>
                      </article>
                    )
                  },
                )}
              </section>
            )}

            {viewMode === 'weekly' && (
              <WeeklyClassScheduleView
                classSchedules={
                  sortedClassSchedules
                }
                canManage={
                  canManageClassSchedules
                }
                updatingStatusId={
                  updatingStatusId
                }
                onEdit={
                  handleOpenEditModal
                }
                onUpdateStatus={(
                  classSchedule,
                ) => {
                  void handleUpdateStatus(
                    classSchedule,
                  )
                }}
              />
            )}

            {viewMode === 'list' && (
              <footer className="class-schedules-pagination">
                <span>
                  Página{' '}
                  {pagination.page}
                  {' de '}
                  {Math.max(
                    1,
                    pagination.totalPages,
                  )}
                </span>

                <div>
                  <button
                    className="class-schedules-button class-schedules-button-secondary"
                    type="button"
                    disabled={
                      pagination.page <= 1
                    }
                    onClick={
                      handlePreviousPage
                    }
                  >
                    Anterior
                  </button>

                  <button
                    className="class-schedules-button class-schedules-button-secondary"
                    type="button"
                    disabled={
                      pagination.page >=
                      pagination.totalPages
                    }
                    onClick={
                      handleNextPage
                    }
                  >
                    Próxima
                  </button>
                </div>
              </footer>
            )}

            {viewMode === 'weekly' &&
              pagination.total >
                WEEKLY_LIMIT && (
                <div className="class-schedules-limit-warning">
                  A visualização semanal
                  apresenta os primeiros{' '}
                  {WEEKLY_LIMIT} horários
                  encontrados. Utilize os
                  filtros para reduzir os
                  resultados.
                </div>
              )}
          </>
        )}

      {modalOpen && (
        <ManageClassScheduleModal
          gymId={activeGym.id}
          classGroups={classGroups}
          classSchedule={
            selectedClassSchedule
          }
          onClose={
            handleCloseModal
          }
          onSaved={
            handleScheduleSaved
          }
        />
      )}
    </main>
  )
}