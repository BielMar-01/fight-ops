import {
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

import type {
  AuditLog,
  AuditPagination,
} from '../types/audit'

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
    loading,
    setLoading,
  ] =
    useState(true)

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
      ],
    )

  useEffect(() => {
    void loadAuditLogs()
  }, [
    loadAuditLogs,
  ])

  useEffect(() => {
    setPage(1)
    setError(null)
  }, [
    activeGym?.id,
  ])

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
            Os registros de auditoria
            ajudam a identificar ações
            administrativas e
            alterações realizadas
            dentro da academia.
          </p>
        </div>
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
            Ainda não existem registros
            de auditoria para esta
            academia.
          </p>
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