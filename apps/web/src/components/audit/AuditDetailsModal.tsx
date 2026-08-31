import {
  useEffect,
} from 'react'

import type {
  AuditJsonValue,
  AuditLog,
} from '../../types/audit'

interface AuditDetailsModalProps {
  auditLog: AuditLog
  onClose: () => void
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
  ).format(date)
}

function formatJsonValue(
  value:
    | AuditJsonValue
    | null,
) {
  if (
    value === null
  ) {
    return null
  }

  return JSON.stringify(
    value,
    null,
    2,
  )
}

export function AuditDetailsModal({
  auditLog,
  onClose,
}: AuditDetailsModalProps) {
  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        onClose()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    onClose,
  ])

  const oldValues =
    formatJsonValue(
      auditLog.oldValues,
    )

  const newValues =
    formatJsonValue(
      auditLog.newValues,
    )

  const metadata =
    formatJsonValue(
      auditLog.metadata,
    )

  return (
    <div
      className="audit-modal-backdrop"
      data-testid="audit-details-modal-backdrop"
      role="presentation"
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose()
        }
      }}
    >
      <section
        className="audit-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-details-title"
        data-testid="audit-details-modal"
      >
        <header className="audit-modal-header">
          <div>
            <span className="audit-eyebrow">
              Registro de auditoria
            </span>

            <h2
              id="audit-details-title"
            >
              Detalhes da alteração
            </h2>

            <p>
              Consulte as informações
              registradas para esta
              ação.
            </p>
          </div>

          <button
            type="button"
            className="audit-modal-close"
            aria-label="Fechar detalhes"
            data-testid="audit-details-close-button"
            onClick={
              onClose
            }
          >
            ×
          </button>
        </header>

        <div className="audit-modal-content">
          <div className="audit-detail-summary">
            <div className="audit-detail-summary-item">
              <span>
                Usuário
              </span>

              <strong>
                {auditLog.user
                  ?.name ??
                  'Sistema'}
              </strong>

              <small>
                {auditLog.user
                  ?.email ??
                  'Ação automática'}
              </small>
            </div>

            <div className="audit-detail-summary-item">
              <span>
                Ação
              </span>

              <strong>
                {getActionLabel(
                  auditLog.action,
                )}
              </strong>
            </div>

            <div className="audit-detail-summary-item">
              <span>
                Entidade
              </span>

              <strong>
                {getEntityLabel(
                  auditLog.entity,
                )}
              </strong>
            </div>

            <div className="audit-detail-summary-item">
              <span>
                Data e hora
              </span>

              <strong>
                {formatDateTime(
                  auditLog.createdAt,
                )}
              </strong>
            </div>
          </div>

          <div className="audit-technical-details">
            <div>
              <span>
                ID do registro
              </span>

              <strong>
                {auditLog.id}
              </strong>
            </div>

            <div>
              <span>
                ID da entidade
              </span>

              <strong>
                {auditLog.entityId ??
                  'Não informado'}
              </strong>
            </div>

            <div>
              <span>
                IP
              </span>

              <strong>
                {auditLog.ipAddress ??
                  'Não informado'}
              </strong>
            </div>

            <div>
              <span>
                User-Agent
              </span>

              <strong>
                {auditLog.userAgent ??
                  'Não informado'}
              </strong>
            </div>
          </div>

          <div className="audit-change-grid">
            <section
              className="audit-json-section"
              data-testid="audit-details-old-values"
            >
              <div className="audit-json-header">
                <span className="audit-json-indicator audit-json-indicator-old" />

                <div>
                  <strong>
                    Valores anteriores
                  </strong>

                  <p>
                    Estado registrado
                    antes da alteração.
                  </p>
                </div>
              </div>

              {oldValues ? (
                <pre>
                  {oldValues}
                </pre>
              ) : (
                <div className="audit-json-empty">
                  Nenhum valor anterior
                  registrado.
                </div>
              )}
            </section>

            <section
              className="audit-json-section"
              data-testid="audit-details-new-values"
            >
              <div className="audit-json-header">
                <span className="audit-json-indicator audit-json-indicator-new" />

                <div>
                  <strong>
                    Novos valores
                  </strong>

                  <p>
                    Estado registrado
                    depois da alteração.
                  </p>
                </div>
              </div>

              {newValues ? (
                <pre>
                  {newValues}
                </pre>
              ) : (
                <div className="audit-json-empty">
                  Nenhum novo valor
                  registrado.
                </div>
              )}
            </section>
          </div>

          <section
            className="audit-json-section"
            data-testid="audit-details-metadata"
          >
            <div className="audit-json-header">
              <div>
                <strong>
                  Metadata
                </strong>

                <p>
                  Informações adicionais
                  registradas durante a
                  operação.
                </p>
              </div>
            </div>

            {metadata ? (
              <pre>
                {metadata}
              </pre>
            ) : (
              <div className="audit-json-empty">
                Nenhuma metadata
                registrada.
              </div>
            )}
          </section>
        </div>

        <footer className="audit-modal-footer">
          <button
            type="button"
            className="audit-button audit-button-secondary"
            data-testid="audit-details-footer-close-button"
            onClick={
              onClose
            }
          >
            Fechar
          </button>
        </footer>
      </section>
    </div>
  )
}