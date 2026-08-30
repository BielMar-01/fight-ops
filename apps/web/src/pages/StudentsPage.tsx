import {
  type FormEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  AddStudentModal,
} from '../components/students/AddStudentModal'

import {
  ManageStudentModal,
} from '../components/students/ManageStudentModal'

import {
  useGym,
} from '../contexts/GymContext'

import {
  getStudents,
} from '../services/student.service'

import type {
  Student,
  StudentPagination,
} from '../types/student'

import '../styles/students.css'

const PAGE_LIMIT = 10

const initialPagination: StudentPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
}

type StatusFilter =
  | 'all'
  | 'active'
  | 'inactive'

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

export function StudentsPage() {
  const {
    activeGym,
  } = useGym()

  const [
    students,
    setStudents,
  ] = useState<Student[]>([])

  const [
    pagination,
    setPagination,
  ] =
    useState<StudentPagination>(
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

  const [
    isAddModalOpen,
    setIsAddModalOpen,
  ] = useState(false)

  const [
    selectedStudentId,
    setSelectedStudentId,
  ] = useState<string | null>(
    null,
  )

  const canViewStudents =
    activeGym?.role ===
      'OWNER' ||
    activeGym?.role ===
      'ADMIN' ||
    activeGym?.role ===
      'RECEPTIONIST' ||
    activeGym?.role ===
      'PROFESSOR'

  const canManageStudents =
    activeGym?.role ===
      'OWNER' ||
    activeGym?.role ===
      'ADMIN' ||
    activeGym?.role ===
      'RECEPTIONIST'

  const loadStudents =
    useCallback(
      async () => {
        if (!activeGym) {
          setStudents([])

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
          setStudents([])

          setPagination(
            initialPagination,
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
            await getStudents(
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

          setStudents(
            response.students,
          )

          setPagination(
            response.pagination,
          )
        } catch {
          setStudents([])

          setPagination(
            initialPagination,
          )

          setError(
            'Não foi possível carregar os alunos.',
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
    void loadStudents()
  }, [
    loadStudents,
  ])

  useEffect(() => {
    setPage(1)

    setSearchInput('')

    setAppliedSearch('')

    setStatusFilter(
      'all',
    )

    setIsAddModalOpen(
      false,
    )

    setSelectedStudentId(
      null,
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

  async function handleStudentCreated() {
    setPage(1)

    setSearchInput('')

    setAppliedSearch('')

    setStatusFilter(
      'all',
    )

    if (page === 1) {
      await loadStudents()
    }
  }

  async function handleStudentUpdated() {
    await loadStudents()
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
    !canViewStudents
  ) {
    return (
      <section
        className="students-page"
        data-testid="students-page"
      >
        <div
          className="students-access-denied"
          data-testid="students-access-denied"
        >
          <div className="students-access-denied-icon">
            !
          </div>

          <span className="students-eyebrow">
            Acesso restrito
          </span>

          <h1>
            Área não disponível
          </h1>

          <p>
            Seu perfil nesta academia
            não possui acesso à gestão
            de alunos.
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section
        className="students-page"
        data-testid="students-page"
      >
        <header className="students-header">
          <div>
            <span className="students-eyebrow">
              Gestão acadêmica
            </span>

            <h1>
              Alunos
            </h1>

            <p>
              Consulte e gerencie os
              alunos cadastrados na
              academia selecionada.
            </p>
          </div>

          <div className="students-header-actions">
            <div
              className="students-total"
              data-testid="students-total"
            >
              <strong>
                {pagination.total}
              </strong>

              <span>
                {pagination.total ===
                1
                  ? 'aluno'
                  : 'alunos'}
              </span>
            </div>

            {canManageStudents ? (
              <button
                type="button"
                className="students-button students-button-primary"
                data-testid="students-add-button"
                onClick={() => {
                  setIsAddModalOpen(
                    true,
                  )
                }}
              >
                Novo aluno
              </button>
            ) : null}
          </div>
        </header>

        <div
          className="students-filters"
          data-testid="students-filters"
        >
          <form
            className="students-search-form"
            onSubmit={
              handleSearch
            }
          >
            <div className="students-field">
              <label
                htmlFor="students-search"
              >
                Buscar aluno
              </label>

              <input
                id="students-search"
                type="search"
                value={
                  searchInput
                }
                placeholder="Nome, e-mail ou telefone"
                data-testid="students-search-input"
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
              className="students-button students-button-primary"
              data-testid="students-search-button"
            >
              Buscar
            </button>
          </form>

          <div className="students-filter-actions">
            <div className="students-field">
              <label
                htmlFor="students-status"
              >
                Status
              </label>

              <select
                id="students-status"
                value={
                  statusFilter
                }
                data-testid="students-status-filter"
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
                className="students-button students-button-secondary"
                data-testid="students-clear-filters-button"
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
  className="students-state"
  data-testid="students-loading"
>
  <div
    className="students-loading-spinner"
    aria-hidden="true"
  />

  <span>
    Carregando alunos...
  </span>
</div>
        ) : error ? (
  <div
    className="students-state students-state-error"
    data-testid="students-error"
  >
    <strong>
      Não foi possível carregar os alunos
    </strong>

    <span>
      {error}
    </span>

    <button
      type="button"
      className="students-button students-button-secondary"
      data-testid="students-retry-button"
      onClick={() => {
        void loadStudents()
      }}
    >
      Tentar novamente
    </button>
  </div>
        ) : students.length ===
          0 ? (
          <div
            className="students-empty"
            data-testid="students-empty"
          >
            <h2>
              Nenhum aluno encontrado
            </h2>

            <p>
              {hasFilters
                ? 'Nenhum aluno corresponde aos filtros informados.'
                : 'Ainda não existem alunos cadastrados nesta academia.'}
            </p>
          </div>
        ) : (
          <>
            <div
              className="students-list"
              data-testid="students-list"
            >
              {students.map(
                (student) => (
                  <article
                    key={
                      student.id
                    }
                    className="student-card"
                    data-testid={`student-card-${student.id}`}
                  >
                    <div className="student-card-main">
                      <div className="student-avatar">
                        {student.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="student-info">
                        <div className="student-name-row">
                          <h2>
                            {
                              student.name
                            }
                          </h2>

                          <span
                            className={
                              student.active
                                ? 'student-status student-status-active'
                                : 'student-status student-status-inactive'
                            }
                            data-testid={`student-status-${student.id}`}
                          >
                            {student.active
                              ? 'Ativo'
                              : 'Inativo'}
                          </span>
                        </div>

                        <div className="student-contact">
                          <span>
                            {student.email ??
                              'E-mail não informado'}
                          </span>

                          <span>
                            {student.phone ??
                              'Telefone não informado'}
                          </span>
                        </div>
                      </div>

                      <div className="student-card-actions">
                        <button
                          type="button"
                          className="students-button students-button-secondary"
                          data-testid={`student-view-button-${student.id}`}
                          onClick={() => {
                            setSelectedStudentId(
                              student.id,
                            )
                          }}
                        >
                          Ver detalhes
                        </button>
                      </div>
                    </div>
                  </article>
                ),
              )}
            </div>

            <div
              className="students-pagination"
              data-testid="students-pagination"
            >
              <button
                type="button"
                className="students-button students-button-secondary"
                disabled={
                  !hasPreviousPage
                }
                data-testid="students-pagination-previous"
                onClick={
                  handlePreviousPage
                }
              >
                Anterior
              </button>

              <span
                className="students-pagination-info"
                data-testid="students-pagination-info"
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
                className="students-button students-button-secondary"
                disabled={
                  !hasNextPage
                }
                data-testid="students-pagination-next"
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

      {isAddModalOpen &&
      activeGym &&
      canManageStudents ? (
        <AddStudentModal
          gymId={
            activeGym.id
          }
          onClose={() => {
            setIsAddModalOpen(
              false,
            )
          }}
          onCreated={
            handleStudentCreated
          }
        />
      ) : null}

      {selectedStudentId &&
      activeGym &&
      canViewStudents ? (
        <ManageStudentModal
          gymId={
            activeGym.id
          }
          studentId={
            selectedStudentId
          }
          canEdit={
            canManageStudents
          }
          onClose={() => {
            setSelectedStudentId(
              null,
            )
          }}
          onUpdated={
            handleStudentUpdated
          }
        />
      ) : null}
    </>
  )
}