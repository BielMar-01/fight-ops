import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  AddGymMemberModal,
} from '../components/members/AddGymMemberModal'

import {
  ManageGymMemberModal,
} from '../components/members/ManageGymMemberModal'

import {
  useGym,
} from '../contexts/GymContext'

import {
  getGymMembers,
} from '../services/gym-member.service'

import type {
  GymMember,
} from '../types/gym-member'

import '../styles/members.css'

const roleLabels = {
  OWNER:
    'Proprietário',

  ADMIN:
    'Administrador',

  RECEPTIONIST:
    'Recepção',

  PROFESSOR:
    'Professor',

  STUDENT:
    'Aluno',
}

export function MembersPage() {
  const {
    activeGym,
  } =
    useGym()

  const [
    members,
    setMembers,
  ] =
    useState<GymMember[]>(
      [],
    )

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    )

  const [
    addModalOpen,
    setAddModalOpen,
  ] =
    useState(false)

  const [
    selectedMember,
    setSelectedMember,
  ] =
    useState<GymMember | null>(
      null,
    )

  const loadMembers =
    useCallback(
      async () => {
        if (!activeGym) {
          return
        }

        setIsLoading(
          true,
        )

        setError(
          null,
        )

        try {
          const response =
            await getGymMembers(
              activeGym.id,
            )

          setMembers(
            response.members,
          )
        } catch {
          setMembers(
            [],
          )

          setError(
            'Não foi possível carregar os membros da academia.',
          )
        } finally {
          setIsLoading(
            false,
          )
        }
      },
      [
        activeGym,
      ],
    )

  useEffect(
    () => {
      void loadMembers()
    },
    [
      loadMembers,
    ],
  )

  const activeMembersCount =
    useMemo(
      () =>
        members.filter(
          (member) =>
            member.active,
        ).length,
      [
        members,
      ],
    )

  const inactiveMembersCount =
    members.length -
    activeMembersCount

  const canManageMembers =
    activeGym?.role ===
      'OWNER' ||
    activeGym?.role ===
      'ADMIN'

  function canManageMember(
    member: GymMember,
  ) {
    if (
      !activeGym ||
      !canManageMembers
    ) {
      return false
    }

    if (
      member.role ===
      'OWNER'
    ) {
      return false
    }

    if (
      activeGym.role ===
      'OWNER'
    ) {
      return true
    }

    if (
      activeGym.role ===
      'ADMIN'
    ) {
      return (
        member.role !==
        'ADMIN'
      )
    }

    return false
  }

  if (!activeGym) {
    return null
  }

  if (isLoading) {
    return (
      <main
        className="members-page"
        data-testid="members-loading"
      >
        <div className="members-state">
          <span
            className="members-spinner"
            aria-hidden="true"
          />

          <h1>
            Carregando membros
          </h1>

          <p>
            Buscando os vínculos da
            academia.
          </p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main
        className="members-page"
        data-testid="members-error"
      >
        <div className="members-state">
          <h1>
            Não foi possível carregar
            os membros
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            className="button button-primary"
            data-testid="members-retry-button"
            onClick={() => {
              void loadMembers()
            }}
          >
            Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  return (
    <>
      <main
        className="members-page"
        data-testid="members-page"
      >
        <header className="members-header">
          <div>
            <span className="eyebrow">
              {activeGym.name}
            </span>

            <h1>
              Membros
            </h1>

            <p>
              Consulte e gerencie as
              pessoas vinculadas à
              academia e seus acessos.
            </p>
          </div>

          {canManageMembers ? (
            <button
              type="button"
              className="button button-primary"
              data-testid="members-add-button"
              onClick={() => {
                setAddModalOpen(
                  true,
                )
              }}
            >
              + Adicionar membro
            </button>
          ) : null}
        </header>

        <section
          className="members-summary"
          aria-label="Resumo dos membros"
        >
          <article
            data-testid="members-total-card"
          >
            <span>
              Total
            </span>

            <strong>
              {members.length}
            </strong>
          </article>

          <article
            data-testid="members-active-card"
          >
            <span>
              Ativos
            </span>

            <strong>
              {activeMembersCount}
            </strong>
          </article>

          <article
            data-testid="members-inactive-card"
          >
            <span>
              Inativos
            </span>

            <strong>
              {inactiveMembersCount}
            </strong>
          </article>
        </section>

        {members.length ===
        0 ? (
          <section
            className="members-empty"
            data-testid="members-empty"
          >
            <h2>
              Nenhum membro encontrado
            </h2>

            <p>
              Esta academia ainda não
              possui membros cadastrados.
            </p>

            {canManageMembers ? (
              <button
                type="button"
                className="button button-primary"
                data-testid="members-empty-add-button"
                onClick={() => {
                  setAddModalOpen(
                    true,
                  )
                }}
              >
                Adicionar primeiro membro
              </button>
            ) : null}
          </section>
        ) : (
          <section
            className="members-table-card"
            data-testid="members-table-card"
          >
            <div className="members-table-wrapper">
              <table
                className="members-table"
                data-testid="members-table"
              >
                <thead>
                  <tr>
                    <th>
                      Membro
                    </th>

                    <th>
                      Papel
                    </th>

                    <th>
                      Telefone
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Desde
                    </th>

                    {canManageMembers ? (
                      <th>
                        Ações
                      </th>
                    ) : null}
                  </tr>
                </thead>

                <tbody>
                  {members.map(
                    (
                      member,
                    ) => (
                      <tr
                        key={
                          member.id
                        }
                        data-testid={`member-row-${member.id}`}
                      >
                        <td>
                          <div className="member-user-cell">
                            <div className="member-avatar">
                              {member.user.name
                                .split(
                                  ' ',
                                )
                                .filter(
                                  Boolean,
                                )
                                .slice(
                                  0,
                                  2,
                                )
                                .map(
                                  (
                                    part,
                                  ) =>
                                    part.charAt(
                                      0,
                                    ),
                                )
                                .join(
                                  '',
                                )
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong
                                data-testid={`member-name-${member.id}`}
                              >
                                {
                                  member
                                    .user
                                    .name
                                }
                              </strong>

                              <span>
                                {
                                  member
                                    .user
                                    .email
                                }
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`member-role member-role-${member.role.toLowerCase()}`}
                            data-testid={`member-role-${member.id}`}
                          >
                            {
                              roleLabels[
                                member
                                  .role
                              ]
                            }
                          </span>
                        </td>

                        <td>
                          {
                            member
                              .user
                              .phone ??
                            '—'
                          }
                        </td>

                        <td>
                          <span
                            className={
                              member.active
                                ? 'member-status active'
                                : 'member-status inactive'
                            }
                            data-testid={`member-status-${member.id}`}
                          >
                            {member.active
                              ? 'Ativo'
                              : 'Inativo'}
                          </span>
                        </td>

                        <td>
                          {new Intl.DateTimeFormat(
                            'pt-BR',
                            {
                              dateStyle:
                                'short',
                            },
                          ).format(
                            new Date(
                              member.joinedAt,
                            ),
                          )}
                        </td>

                        {canManageMembers ? (
                          <td>
                            {canManageMember(
                              member,
                            ) ? (
                              <button
                                type="button"
                                className="member-action-button"
                                aria-label={`Gerenciar ${member.user.name}`}
                                data-testid={`member-manage-button-${member.id}`}
                                onClick={() => {
                                  setSelectedMember(
                                    member,
                                  )
                                }}
                              >
                                Gerenciar
                              </button>
                            ) : (
                              <span className="member-action-unavailable">
                                —
                              </span>
                            )}
                          </td>
                        ) : null}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {addModalOpen ? (
        <AddGymMemberModal
          gymId={
            activeGym.id
          }
          actorRole={
            activeGym.role
          }
          onClose={() => {
            setAddModalOpen(
              false,
            )
          }}
          onCreated={
            loadMembers
          }
        />
      ) : null}

      {selectedMember ? (
        <ManageGymMemberModal
          gymId={
            activeGym.id
          }
          actorRole={
            activeGym.role
          }
          member={
            selectedMember
          }
          onClose={() => {
            setSelectedMember(
              null,
            )
          }}
          onUpdated={
            loadMembers
          }
        />
      ) : null}
    </>
  )
}