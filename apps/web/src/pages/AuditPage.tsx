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
  getAuditLogs,
} from '../services/audit.service'

import {
  getGymMembers,
} from '../services/gym-member.service'

import type {
  AuditLog,
  AuditPagination,
} from '../types/audit'

import type {
  GymMember,
} from '../types/gym-member'

import '../styles/audit.css'

const PAGE_LIMIT = 10

const initialPagination: AuditPagination = {
  page: 1,
  limit: PAGE_LIMIT,
  total: 0,
  totalPages: 0,
}

const actionLabels: Record<
  string,
  string
> = {
  CREATE:
    'Criação',

  UPDATE:
    'Alteração',

  STATUS_CHANGE:
    'Alteração de status',

  DELETE:
    'Exclusão',

  LOGIN:
    'Login',

  LOGOUT:
    'Logout',

  PASSWORD_RESET_REQUESTED:
    'Recuperação solicitada',

  PASSWORD_RESET_COMPLETED:
    'Senha redefinida',

  PASSWORD_RESET_REQUESTED_BY_ADMIN:
    'Reset solicitado por administrador',
}

const entityLabels: Record<
  string,
  string
> = {
  USER:
    'Usuário',

  GYM:
    'Academia',

  GYM_MEMBERSHIP:
    'Membro',

  STUDENT:
    'Aluno',

  AUTH:
    'Autenticação',

  SYSTEM:
    'Sistema',
}

const roleLabels: Record<
  string,
  string
> = {
  OWNER:
    'Proprietário',

  ADMIN:
    'Administrador',

  RECEPTIONIST:
    'Recepcionista',

  PROFESSOR:
    'Professor',

  STUDENT:
    'Aluno',
}

function getActionLabel(
  action: string,
) {
  return (
    actionLabels[
      action
    ] ?? action
  )
}

function getEntityLabel(
  entity: string,
) {
  return (
    entityLabels[
      entity
    ] ?? entity
  )
}

function getRoleLabel(
  role: string,
) {
  return (
    roleLabels[
      role
    ] ?? role
  )
}

function formatDateTime(
  value: string,
) {
  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle:
        'short',

      timeStyle:
        'medium',
    },
  ).format(
    date,
  )
}

function getUserInitials(
  auditLog: AuditLog,
) {
  if (!auditLog.user) {
    return 'S'
  }

  return auditLog.user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0),
    )
    .join('')
    .toUpperCase()
}

export function AuditPage() {
  const {
    activeGym,
  } = useGym()

  const [
    auditLogs,
    setAuditLogs,
  ] =
    useState<AuditLog[]>(
      [],
    )

  const [
    members,
    setMembers,
  ] =
    useState<GymMember[]>(
      [],
    )

  const [
    pagination,
    setPagination,
  ] =
    useState<AuditPagination>(
      initialPagination,
    )

  const [
    page,
    setPage,
  ] =
    useState(1)

  const [
    actionFilter,
    setActionFilter,
  ] =
    useState('')

  const [
    entityFilter,
    setEntityFilter,
  ] =
    useState('')

  const [
    userFilter,
    setUserFilter,
  ] =
    useState('')

  const [
    startDateInput,
    setStartDateInput,
  ] =
    useState('')

  const [
    endDateInput,
    setEndDateInput,
  ] =
    useState('')

  const [
    appliedStartDate,
    setAppliedStartDate,
  ] =
    useState('')

  const [
    appliedEndDate,
    setAppliedEndDate,
  ] =
    useState('')

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  const [
    membersLoading,
    setMembersLoading,
  ] =
    useState(false)

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null)

  const canViewAudit =
    activeGym?.role ===
      'OWNER' ||
    activeGym?.role ===
      'ADMIN'

  const hasFilters =
    actionFilter.length > 0 ||
    entityFilter.length > 0 ||
    userFilter.length > 0 ||
    appliedStartDate.length > 0 ||
    appliedEndDate.length > 0

  const loadMembers =
    useCallback(
      async () => {
        if (
          !activeGym ||
          !canViewAudit
        ) {
          setMembers(
            [],
          )

          return
        }

        try {
          setMembersLoading(
            true,
          )

          const response =
            await getGymMembers(
              activeGym.id,
            )

          const sortedMembers =
            [...response.members].sort(
              (
                first,
                second,
              ) =>
                first.user.name.localeCompare(
                  second.user.name,
                  'pt-BR',
                ),
            )

          setMembers(
            sortedMembers,
          )
        } catch {
          setMembers(
            [],
          )
        } finally {
          setMembersLoading(
            false,
          )
        }
      },
      [
        activeGym,
        canViewAudit,
      ],
    )

  const loadAuditLogs =
    useCallback(
      async () => {
        if (
          !activeGym ||
          !canViewAudit
        ) {
          setAuditLogs(
            [],
          )

          setPagination(
            initialPagination,
          )

          setLoading(
            false,
          )

          return
        }

        try {
          setLoading(
            true,
          )

          setError(
            null,
          )

          const response =
            await getAuditLogs(
              activeGym.id,
              {
                page,

                limit:
                  PAGE_LIMIT,

                action:
                  actionFilter ||
                  undefined,

                entity:
                  entityFilter ||
                  undefined,

                userId:
                  userFilter ||
                  undefined,

                startDate:
                  appliedStartDate ||
                  undefined,

                endDate:
                  appliedEndDate ||
                  undefined,
              },
            )

          setAuditLogs(
            response.auditLogs,
          )

          setPagination(
            response.pagination,
          )
        } catch {
          setAuditLogs(
            [],
          )

          setPagination(
            initialPagination,
          )

          setError(
            'Não foi possível carregar os registros de auditoria.',
          )
        } finally {
          setLoading(
            false,
          )
        }
      },
      [
        activeGym,
        canViewAudit,
        page,
        actionFilter,
        entityFilter,
        userFilter,
        appliedStartDate,
        appliedEndDate,
      ],
    )

  useEffect(() => {
    void loadMembers()
  }, [
    loadMembers,
  ])

  useEffect(() => {
    void loadAuditLogs()
  }, [
    loadAuditLogs,
  ])

  useEffect(() => {
    setPage(1)

    setActionFilter(
      '',
    )

    setEntityFilter(
      '',
    )

    setUserFilter(
      '',
    )

    setStartDateInput(
      '',
    )

    setEndDateInput(
      '',
    )

    setAppliedStartDate(
      '',
    )

    setAppliedEndDate(
      '',
    )

    setError(
      null,
    )
  }, [
    activeGym?.id,
  ])

  function handlePeriodSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setPage(1)

    setAppliedStartDate(
      startDateInput,
    )

    setAppliedEndDate(
      endDateInput,
    )
  }

  function handleClearFilters() {
    setActionFilter(
      '',
    )

    setEntityFilter(
      '',
    )

    setUserFilter(
      '',
    )

    setStartDateInput(
      '',
    )

    setEndDateInput(
      '',
    )

    setAppliedStartDate(
      '',
    )

    setAppliedEndDate(
      '',
    )

    setPage(1)
  }

  function handlePreviousPage() {
    setPage(
      (currentPage) =>
        Math.max(
          1,
          currentPage -
            1,
        ),
    )
  }

  function handleNextPage() {
    setPage(
      (currentPage) =>
        Math.min(
          pagination.totalPages,
          currentPage +
            1,
        ),
    )
  }

  const hasPreviousPage =
    pagination.page > 1

  const hasNextPage =
    pagination.page <
    pagination.totalPages

  if (
    activeGym &&
    !canViewAudit
  ) {
    return (
      <section
        className="audit-page"
        data-testid="audit-page"
      >
        <div
          className="audit-access-denied"
          data-testid="audit-access-denied"
        >
          <div className="audit-access-denied-icon">
            !
          </div>

          <span className="audit-eyebrow">
            Acesso restrito
          </span>

          <h1>
            Auditoria não disponível
          </h1>

          <p>
            Apenas proprietários e
            administradores podem
            consultar os registros de
            auditoria desta academia.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="audit-page"
      data-testid="audit-page"
    >
      <header className="audit-header">
        <div>
          <span className="audit-eyebrow">
            Administração
          </span>

          <h1>
            Auditoria
          </h1>

          <p>
            Acompanhe as principais
            alterações realizadas na
            academia, identificando
            quando ocorreram e quem
            realizou cada ação.
          </p>
        </div>

        <div
          className="audit-total"
          data-testid="audit-total"
        >
          <strong>
            {pagination.total}
          </strong>

          <span>
            {pagination.total ===
            1
              ? 'registro'
              : 'registros'}
          </span>
        </div>
      </header>

      <div className="audit-info-banner">
        <div className="audit-info-icon">
          ◷
        </div>

        <div>
          <strong>
            Histórico de alterações
          </strong>

          <p>
            Utilize os filtros para
            localizar ações específicas
            dentro da academia.
          </p>
        </div>
      </div>

      <div
        className="audit-filters"
        data-testid="audit-filters"
      >
        <div className="audit-filter-grid">
          <div className="audit-field">
            <label htmlFor="audit-action">
              Ação
            </label>

            <select
              id="audit-action"
              value={
                actionFilter
              }
              data-testid="audit-action-filter"
              onChange={(
                event,
              ) => {
                setActionFilter(
                  event.target
                    .value,
                )

                setPage(1)
              }}
            >
              <option value="">
                Todas
              </option>

              <option value="CREATE">
                Criação
              </option>

              <option value="UPDATE">
                Alteração
              </option>

              <option value="STATUS_CHANGE">
                Alteração de status
              </option>

              <option value="DELETE">
                Exclusão
              </option>

              <option value="LOGIN">
                Login
              </option>

              <option value="LOGOUT">
                Logout
              </option>

              <option value="PASSWORD_RESET_REQUESTED">
                Recuperação solicitada
              </option>

              <option value="PASSWORD_RESET_COMPLETED">
                Senha redefinida
              </option>

              <option value="PASSWORD_RESET_REQUESTED_BY_ADMIN">
                Reset por administrador
              </option>
            </select>
          </div>

          <div className="audit-field">
            <label htmlFor="audit-entity">
              Entidade
            </label>

            <select
              id="audit-entity"
              value={
                entityFilter
              }
              data-testid="audit-entity-filter"
              onChange={(
                event,
              ) => {
                setEntityFilter(
                  event.target
                    .value,
                )

                setPage(1)
              }}
            >
              <option value="">
                Todas
              </option>

              <option value="USER">
                Usuário
              </option>

              <option value="GYM">
                Academia
              </option>

              <option value="GYM_MEMBERSHIP">
                Membro
              </option>

              <option value="STUDENT">
                Aluno
              </option>

              <option value="AUTH">
                Autenticação
              </option>

              <option value="SYSTEM">
                Sistema
              </option>
            </select>
          </div>

          <div className="audit-field">
            <label htmlFor="audit-user">
              Usuário
            </label>

            <select
              id="audit-user"
              value={
                userFilter
              }
              disabled={
                membersLoading
              }
              data-testid="audit-user-filter"
              onChange={(
                event,
              ) => {
                setUserFilter(
                  event.target
                    .value,
                )

                setPage(1)
              }}
            >
              <option value="">
                {membersLoading
                  ? 'Carregando usuários...'
                  : 'Todos os usuários'}
              </option>

              {members.map(
                (member) => (
                  <option
                    key={
                      member.id
                    }
                    value={
                      member.user.id
                    }
                  >
                    {member.user.name} —{' '}
                    {getRoleLabel(
                      member.role,
                    )}
                    {!member.active
                      ? ' — Inativo'
                      : ''}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <form
          className="audit-period-form"
          onSubmit={
            handlePeriodSubmit
          }
        >
          <div className="audit-field">
            <label htmlFor="audit-start-date">
              Data inicial
            </label>

            <input
              id="audit-start-date"
              type="date"
              value={
                startDateInput
              }
              data-testid="audit-start-date-input"
              onChange={(
                event,
              ) => {
                setStartDateInput(
                  event.target
                    .value,
                )
              }}
            />
          </div>

          <div className="audit-field">
            <label htmlFor="audit-end-date">
              Data final
            </label>

            <input
              id="audit-end-date"
              type="date"
              value={
                endDateInput
              }
              min={
                startDateInput ||
                undefined
              }
              data-testid="audit-end-date-input"
              onChange={(
                event,
              ) => {
                setEndDateInput(
                  event.target
                    .value,
                )
              }}
            />
          </div>

          <button
            type="submit"
            className="audit-button audit-button-primary"
            data-testid="audit-period-apply-button"
          >
            Aplicar período
          </button>
        </form>

        {hasFilters ? (
          <div className="audit-filter-footer">
            <span
              className="audit-filter-active"
              data-testid="audit-filters-active"
            >
              Filtros aplicados
            </span>

            <button
              type="button"
              className="audit-button audit-button-secondary"
              data-testid="audit-clear-filters-button"
              onClick={
                handleClearFilters
              }
            >
              Limpar filtros
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <div
          className="audit-state"
          data-testid="audit-loading"
        >
          <div
            className="audit-loading-spinner"
            aria-hidden="true"
          />

          <span>
            Carregando auditoria...
          </span>
        </div>
      ) : error ? (
        <div
          className="audit-state audit-state-error"
          data-testid="audit-error"
        >
          <strong>
            Não foi possível carregar
            a auditoria
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            className="audit-button audit-button-secondary"
            data-testid="audit-retry-button"
            onClick={() => {
              void loadAuditLogs()
            }}
          >
            Tentar novamente
          </button>
        </div>
      ) : auditLogs.length ===
        0 ? (
        <div
          className="audit-empty"
          data-testid="audit-empty"
        >
          <div className="audit-empty-icon">
            ◷
          </div>

          <h2>
            Nenhum registro encontrado
          </h2>

          <p>
            {hasFilters
              ? 'Nenhum registro corresponde aos filtros informados.'
              : 'Ainda não existem registros de auditoria para esta academia.'}
          </p>

          {hasFilters ? (
            <button
              type="button"
              className="audit-button audit-button-secondary"
              data-testid="audit-empty-clear-filters-button"
              onClick={
                handleClearFilters
              }
            >
              Limpar filtros
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div
            className="audit-list"
            data-testid="audit-list"
          >
            {auditLogs.map(
              (auditLog) => (
                <article
                  key={
                    auditLog.id
                  }
                  className="audit-card"
                  data-testid={`audit-card-${auditLog.id}`}
                >
                  <div className="audit-card-header">
                    <div className="audit-user">
                      <div className="audit-user-avatar">
                        {getUserInitials(
                          auditLog,
                        )}
                      </div>

                      <div className="audit-user-info">
                        <strong>
                          {auditLog.user
                            ?.name ??
                            'Sistema'}
                        </strong>

                        <span>
                          {auditLog.user
                            ?.email ??
                            'Ação do sistema'}
                        </span>
                      </div>
                    </div>

                    <span
                      className="audit-action-badge"
                      data-testid={`audit-action-${auditLog.id}`}
                    >
                      {getActionLabel(
                        auditLog.action,
                      )}
                    </span>
                  </div>

                  <div className="audit-card-content">
                    <div className="audit-detail">
                      <span>
                        Entidade
                      </span>

                      <strong>
                        {getEntityLabel(
                          auditLog.entity,
                        )}
                      </strong>
                    </div>

                    <div className="audit-detail">
                      <span>
                        Data e hora
                      </span>

                      <strong>
                        {formatDateTime(
                          auditLog.createdAt,
                        )}
                      </strong>
                    </div>

                    <div className="audit-detail">
                      <span>
                        Identificador
                      </span>

                      <strong
                        className="audit-entity-id"
                        title={
                          auditLog.entityId ??
                          undefined
                        }
                      >
                        {auditLog.entityId ??
                          'Não informado'}
                      </strong>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>

          <div
            className="audit-pagination"
            data-testid="audit-pagination"
          >
            <button
              type="button"
              className="audit-button audit-button-secondary"
              disabled={
                !hasPreviousPage
              }
              data-testid="audit-pagination-previous"
              onClick={
                handlePreviousPage
              }
            >
              Anterior
            </button>

            <span
              className="audit-pagination-info"
              data-testid="audit-pagination-info"
            >
              Página{' '}
              <strong>
                {
                  pagination.page
                }
              </strong>{' '}
              de{' '}
              <strong>
                {Math.max(
                  1,
                  pagination.totalPages,
                )}
              </strong>
            </span>

            <button
              type="button"
              className="audit-button audit-button-secondary"
              disabled={
                !hasNextPage
              }
              data-testid="audit-pagination-next"
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