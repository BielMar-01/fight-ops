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

interface ComparisonRow {
  key: string
  label: string
  oldValue:
    | AuditJsonValue
    | undefined
  newValue:
    | AuditJsonValue
    | undefined
  changed: boolean
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

const fieldLabels: Record<
  string,
  string
> = {
  id:
    'ID',

  name:
    'Nome',

  email:
    'E-mail',

  phone:
    'Telefone',

  birthDate:
    'Data de nascimento',

  emergencyContact:
    'Contato de emergência',

  emergencyPhone:
    'Telefone de emergência',

  notes:
    'Observações',

  active:
    'Status',

  role:
    'Função',

  joinedAt:
    'Data de entrada',

  hireDate:
    'Data de contratação',

  userId:
    'Usuário',

  gymId:
    'Academia',

  createdAt:
    'Criado em',

  updatedAt:
    'Atualizado em',

  avatarUrl:
    'Avatar',

  bio:
    'Biografia',
}

function getActionLabel(
  action: string,
) {
  return (
    actionLabels[action] ??
    action
  )
}

function getEntityLabel(
  entity: string,
) {
  return (
    entityLabels[entity] ??
    entity
  )
}

function getFieldLabel(
  field: string,
) {
  return (
    fieldLabels[field] ??
    field
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

function isRecord(
  value:
    | AuditJsonValue
    | null,
): value is Record<
  string,
  AuditJsonValue
> {
  return (
    value !== null &&
    typeof value ===
      'object' &&
    !Array.isArray(
      value,
    )
  )
}

function areValuesEqual(
  first:
    | AuditJsonValue
    | undefined,
  second:
    | AuditJsonValue
    | undefined,
) {
  return (
    JSON.stringify(first) ===
    JSON.stringify(second)
  )
}

function getComparisonRows(
  oldValues:
    | AuditJsonValue
    | null,
  newValues:
    | AuditJsonValue
    | null,
) {
  const oldRecord =
    isRecord(oldValues)
      ? oldValues
      : {}

  const newRecord =
    isRecord(newValues)
      ? newValues
      : {}

  const keys =
    Array.from(
      new Set([
        ...Object.keys(
          oldRecord,
        ),

        ...Object.keys(
          newRecord,
        ),
      ]),
    )

  return keys.map(
    (key): ComparisonRow => {
      const oldValue =
        oldRecord[key]

      const newValue =
        newRecord[key]

      return {
        key,

        label:
          getFieldLabel(
            key,
          ),

        oldValue,

        newValue,

        changed:
          !areValuesEqual(
            oldValue,
            newValue,
          ),
      }
    },
  )
}

function formatBoolean(
  field: string,
  value: boolean,
) {
  if (
    field === 'active'
  ) {
    return value
      ? 'Ativo'
      : 'Inativo'
  }

  return value
    ? 'Sim'
    : 'Não'
}

function formatPossibleDate(
  field: string,
  value: string,
) {
  const dateFields = [
    'birthDate',
    'joinedAt',
    'hireDate',
    'createdAt',
    'updatedAt',
  ]

  if (
    !dateFields.includes(
      field,
    )
  ) {
    return value
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value
  }

  if (
    field ===
    'birthDate'
  ) {
    return new Intl.DateTimeFormat(
      'pt-BR',
    ).format(date)
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      dateStyle:
        'short',

      timeStyle:
        'short',
    },
  ).format(date)
}

function formatValue(
  field: string,
  value:
    | AuditJsonValue
    | undefined,
) {
  if (
    value === undefined
  ) {
    return '—'
  }

  if (
    value === null
  ) {
    return 'Não informado'
  }

  if (
    typeof value ===
    'boolean'
  ) {
    return formatBoolean(
      field,
      value,
    )
  }

  if (
    typeof value ===
    'number'
  ) {
    return String(value)
  }

  if (
    typeof value ===
    'string'
  ) {
    if (
      field === 'role'
    ) {
      return (
        roleLabels[value] ??
        value
      )
    }

    return formatPossibleDate(
      field,
      value,
    )
  }

  return JSON.stringify(
    value,
    null,
    2,
  )
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

  const comparisonRows =
    getComparisonRows(
      auditLog.oldValues,
      auditLog.newValues,
    )

  const changedRows =
    comparisonRows.filter(
      (row) =>
        row.changed,
    )

  const rowsToDisplay =
    changedRows.length > 0
      ? changedRows
      : comparisonRows

  const hasComparison =
    rowsToDisplay.length > 0

  const isCreate =
    auditLog.action ===
    'CREATE'

  const isDelete =
    auditLog.action ===
    'DELETE'

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

          {hasComparison ? (
            <section
              className="audit-comparison-section"
              data-testid="audit-details-comparison"
            >
              <div className="audit-comparison-heading">
                <div>
                  <span className="audit-eyebrow">
                    Alterações
                  </span>

                  <h3>
                    {isCreate
                      ? 'Dados criados'
                      : isDelete
                        ? 'Dados removidos'
                        : 'Antes e depois'}
                  </h3>

                  <p>
                    {isCreate
                      ? 'Valores registrados durante a criação.'
                      : isDelete
                        ? 'Valores existentes antes da remoção.'
                        : 'Somente os campos alterados são destacados.'}
                  </p>
                </div>

                {!isCreate &&
                !isDelete &&
                changedRows.length >
                  0 ? (
                  <span
                    className="audit-change-count"
                    data-testid="audit-change-count"
                  >
                    {
                      changedRows.length
                    }{' '}
                    {changedRows.length ===
                    1
                      ? 'campo alterado'
                      : 'campos alterados'}
                  </span>
                ) : null}
              </div>

              <div className="audit-comparison-list">
                {rowsToDisplay.map(
                  (row) => (
                    <div
                      key={
                        row.key
                      }
                      className={
                        row.changed
                          ? 'audit-comparison-row changed'
                          : 'audit-comparison-row'
                      }
                      data-testid={`audit-comparison-field-${row.key}`}
                    >
                      <div className="audit-comparison-field">
                        <span>
                          Campo
                        </span>

                        <strong>
                          {
                            row.label
                          }
                        </strong>
                      </div>

                      {!isCreate ? (
                        <div className="audit-comparison-value audit-comparison-old">
                          <span>
                            Antes
                          </span>

                          <strong>
                            {formatValue(
                              row.key,
                              row.oldValue,
                            )}
                          </strong>
                        </div>
                      ) : null}

                      {!isDelete ? (
                        <div className="audit-comparison-value audit-comparison-new">
                          <span>
                            Depois
                          </span>

                          <strong>
                            {formatValue(
                              row.key,
                              row.newValue,
                            )}
                          </strong>
                        </div>
                      ) : null}
                    </div>
                  ),
                )}
              </div>
            </section>
          ) : (
            <section
              className="audit-no-comparison"
              data-testid="audit-details-no-comparison"
            >
              <strong>
                Nenhuma alteração de
                campos registrada
              </strong>

              <p>
                Este evento não possui
                valores anteriores ou
                posteriores para
                comparação.
              </p>
            </section>
          )}

          <details
            className="audit-raw-details"
            data-testid="audit-details-raw-data"
          >
            <summary>
              Dados técnicos
            </summary>

            <div className="audit-raw-content">
              <div className="audit-change-grid">
                <section className="audit-json-section">
                  <div className="audit-json-header">
                    <div>
                      <strong>
                        Valores anteriores
                      </strong>

                      <p>
                        Conteúdo bruto
                        registrado antes
                        da operação.
                      </p>
                    </div>
                  </div>

                  {oldValues ? (
                    <pre>
                      {oldValues}
                    </pre>
                  ) : (
                    <div className="audit-json-empty">
                      Nenhum valor
                      anterior
                      registrado.
                    </div>
                  )}
                </section>

                <section className="audit-json-section">
                  <div className="audit-json-header">
                    <div>
                      <strong>
                        Novos valores
                      </strong>

                      <p>
                        Conteúdo bruto
                        registrado após
                        a operação.
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
                      Informações
                      adicionais da
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
          </details>
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