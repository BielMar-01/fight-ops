import {
  useState,
} from 'react'

import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

import {
  useGym,
} from '../../contexts/GymContext'

import {
  useAuth,
} from '../../hooks/useAuth'

import '../../styles/app-layout.css'

export function AppLayout() {
  const navigate =
    useNavigate()

  const {
    user,
    logout,
    isLoggingOut,
  } =
    useAuth()

  const {
    gyms,
    activeGym,
    selectGym,
  } =
    useGym()

  const [
    sidebarOpen,
    setSidebarOpen,
  ] =
    useState(false)

  const [
    gymSelectorOpen,
    setGymSelectorOpen,
  ] =
    useState(false)

  function closeSidebar() {
    setSidebarOpen(false)
  }

  function closeGymSelector() {
    setGymSelectorOpen(false)
  }

  function handleGymChange(
    gymId: string,
  ) {
    selectGym(
      gymId,
    )

    closeGymSelector()
    closeSidebar()
  }

  async function handleLogout() {
    try {
      await logout()
    } finally {
      navigate(
        '/login',
        {
          replace: true,
        },
      )
    }
  }

  if (
    !user ||
    !activeGym
  ) {
    return null
  }

  const userInitials =
    user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0),
      )
      .join('')
      .toUpperCase()

  return (
    <div
      className="app-shell"
      data-testid="app-layout"
    >
      {sidebarOpen ? (
        <button
          type="button"
          className="app-sidebar-overlay"
          aria-label="Fechar menu"
          data-testid="app-sidebar-overlay"
          onClick={
            closeSidebar
          }
        />
      ) : null}

      <aside
        className={
          sidebarOpen
            ? 'app-sidebar open'
            : 'app-sidebar'
        }
        data-testid="app-sidebar"
      >
        <div className="app-sidebar-header">
          <Link
            to="/dashboard"
            className="app-brand"
            onClick={
              closeSidebar
            }
            data-testid="app-logo-link"
          >
            <span className="app-brand-mark">
              FO
            </span>

            <span className="app-brand-name">
              FightOps
            </span>
          </Link>

          <button
            type="button"
            className="app-sidebar-close"
            aria-label="Fechar menu"
            data-testid="app-sidebar-close-button"
            onClick={
              closeSidebar
            }
          >
            ×
          </button>
        </div>

        <div
          className="app-gym-selector"
          data-testid="app-gym-selector"
        >
          <button
            type="button"
            className="app-gym-selector-trigger"
            aria-expanded={
              gymSelectorOpen
            }
            data-testid="app-gym-selector-trigger"
            onClick={() => {
              setGymSelectorOpen(
                (current) =>
                  !current,
              )
            }}
          >
            <div className="app-gym-selector-info">
              <span className="app-gym-selector-label">
                Academia
              </span>

              <strong
                data-testid="app-active-gym-name"
              >
                {activeGym.name}
              </strong>

              <small
                data-testid="app-active-gym-role"
              >
                {activeGym.role}
              </small>
            </div>

            <span className="app-gym-selector-arrow">
              {gymSelectorOpen
                ? '▲'
                : '▼'}
            </span>
          </button>

          {gymSelectorOpen ? (
            <div
              className="app-gym-selector-menu"
              data-testid="app-gym-selector-menu"
            >
              {gyms.map(
                (gym) => (
                  <button
                    key={
                      gym.id
                    }
                    type="button"
                    className={
                      gym.id ===
                      activeGym.id
                        ? 'app-gym-option active'
                        : 'app-gym-option'
                    }
                    data-testid={`app-gym-option-${gym.id}`}
                    onClick={() => {
                      handleGymChange(
                        gym.id,
                      )
                    }}
                  >
                    <div>
                      <strong>
                        {gym.name}
                      </strong>

                      <span>
                        {gym.role}
                      </span>
                    </div>

                    {gym.id ===
                    activeGym.id ? (
                      <span>
                        ✓
                      </span>
                    ) : null}
                  </button>
                ),
              )}
            </div>
          ) : null}
        </div>

        <nav
          className="app-navigation"
          aria-label="Navegação da área interna"
        >
          <span className="app-navigation-group-title">
            Principal
          </span>

          <NavLink
            to="/dashboard"
            end
            className={({
              isActive,
            }) =>
              isActive
                ? 'app-nav-link active'
                : 'app-nav-link'
            }
            onClick={
              closeSidebar
            }
            data-testid="nav-dashboard-link"
          >
            <span className="app-nav-icon">
              ◫
            </span>

            <span>
              Visão geral
            </span>
          </NavLink>

          <span className="app-navigation-group-title">
            Gestão
          </span>

          {activeGym.role !==
          'STUDENT' ? (
            <NavLink
              to="/members"
              className={({
                isActive,
              }) =>
                isActive
                  ? 'app-nav-link active'
                  : 'app-nav-link'
              }
              onClick={
                closeSidebar
              }
              data-testid="nav-members-link"
            >
              <span className="app-nav-icon">
                ◉
              </span>

              <span>
                Membros
              </span>
            </NavLink>
          ) : null}

          {activeGym.role !==
              'STUDENT' ? (
                <NavLink
                  to="/students"
                  className={({
                    isActive,
                  }) =>
                    isActive
                      ? 'app-nav-link active'
                      : 'app-nav-link'
                  }
                  onClick={
                    closeSidebar
                  }
                  data-testid="nav-students-link"
                >
                  <span className="app-nav-icon">
                    ◎
                  </span>

                  <span>
                    Alunos
                  </span>
                </NavLink>
              ) : null}

          <div
            className="app-nav-link disabled"
            data-testid="nav-classes-disabled"
          >
            <span className="app-nav-icon">
              ◇
            </span>

            <span>
              Turmas
            </span>

            <small>
              Em breve
            </small>
          </div>

          <div
            className="app-nav-link disabled"
            data-testid="nav-finance-disabled"
          >
            <span className="app-nav-icon">
              $
            </span>

            <span>
              Financeiro
            </span>

            <small>
              Em breve
            </small>
          </div>

          {(
            activeGym.role ===
              'OWNER' ||
            activeGym.role ===
              'ADMIN'
          ) ? (
            <>
              <span className="app-navigation-group-title">
                Administração
              </span>

              <div
                className="app-nav-link disabled"
                data-testid="nav-settings-disabled"
              >
                <span className="app-nav-icon">
                  ⚙
                </span>

                <span>
                  Configurações
                </span>

                <small>
                  Em breve
                </small>
              </div>
            </>
          ) : null}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-sidebar-user">
            <div
              className="app-user-avatar"
              data-testid="app-user-avatar"
            >
              {userInitials}
            </div>

            <div className="app-user-info">
              <strong
                data-testid="app-user-name"
              >
                {user.name}
              </strong>

              <span
                data-testid="app-user-email"
              >
                {user.email}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <div className="app-content-shell">
        <header
          className="app-header"
          data-testid="app-header"
        >
          <div className="app-header-left">
            <button
              type="button"
              className="app-mobile-menu-button"
              aria-label="Abrir menu"
              aria-expanded={
                sidebarOpen
              }
              data-testid="app-mobile-menu-button"
              onClick={() => {
                setSidebarOpen(
                  true,
                )
              }}
            >
              <span />
              <span />
              <span />
            </button>

            <div>
              <span className="app-header-eyebrow">
                {activeGym.name}
              </span>

              <strong className="app-header-title">
                Painel de gestão
              </strong>
            </div>
          </div>

          <div className="app-header-actions">
            <div className="app-header-user">
              <div className="app-user-avatar small">
                {userInitials}
              </div>

              <div className="app-header-user-info">
                <strong>
                  {user.name}
                </strong>

                <span>
                  {activeGym.role}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="app-logout-button"
              disabled={
                isLoggingOut
              }
              data-testid="app-logout-button"
              onClick={() => {
                void handleLogout()
              }}
            >
              {isLoggingOut
                ? 'Saindo...'
                : 'Sair'}
            </button>
          </div>
        </header>

        <div
          className="app-page-content"
          data-testid="app-page-content"
        >
          <Outlet />
        </div>
      </div>
    </div>
  )
}