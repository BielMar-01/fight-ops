import { useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
} from 'react-router-dom'

import { PublicPageError } from '../public/PublicPageError'
import { PublicPageLoading } from '../public/PublicPageLoading'
import { SiteTheme } from '../public/SiteTheme'
import { useSiteSettings } from '../../hooks/usePublicSite'

export function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false)

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useSiteSettings()

  if (isLoading) {
    return <PublicPageLoading />
  }

  if (
    isError ||
    !data?.settings
  ) {
    return (
      <PublicPageError
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  const settings =
    data.settings

  function closeMobileMenu() {
    setMobileMenuOpen(false)
  }

  return (
    <div className="site-shell">
      <SiteTheme
        settings={settings}
      />

      <header className="site-header">
        <div className="site-container header-content">
          <Link
            to="/"
            className="brand"
            data-testid="public-logo-link"
            onClick={closeMobileMenu}
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.siteName}
                className="brand-logo"
              />
            ) : (
              <>
                <span className="brand-mark">
                  FO
                </span>

                <span className="brand-text">
                  {settings.siteName}
                </span>
              </>
            )}
          </Link>

          <nav
            className="main-nav"
            aria-label="Navegação principal"
          >
            <NavLink
              to="/"
              end
              className={({
                isActive,
              }) =>
                isActive
                  ? 'nav-link active'
                  : 'nav-link'
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/features"
              className={({
                isActive,
              }) =>
                isActive
                  ? 'nav-link active'
                  : 'nav-link'
              }
            >
              Funcionalidades
            </NavLink>

            <NavLink
              to="/pricing"
              className={({
                isActive,
              }) =>
                isActive
                  ? 'nav-link active'
                  : 'nav-link'
              }
            >
              Planos
            </NavLink>

            <NavLink
              to="/faq"
              className={({
                isActive,
              }) =>
                isActive
                  ? 'nav-link active'
                  : 'nav-link'
              }
            >
              FAQ
            </NavLink>
          </nav>

          <div className="header-actions">
            <Link
              to="/login"
              className="button button-ghost"
              data-testid="public-login-link"
            >
              Entrar
            </Link>

            <Link
              to="/register"
              className="button button-primary desktop-register-button"
              data-testid="public-register-link"
            >
              Começar agora
            </Link>

            <button
              type="button"
              className="mobile-menu-button"
              aria-label={
                mobileMenuOpen
                  ? 'Fechar menu'
                  : 'Abrir menu'
              }
              aria-expanded={
                mobileMenuOpen
              }
              aria-controls="mobile-navigation"
              data-testid="public-mobile-menu-button"
              onClick={() => {
                setMobileMenuOpen(
                  (current) =>
                    !current,
                )
              }}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={
            mobileMenuOpen
              ? 'mobile-navigation open'
              : 'mobile-navigation'
          }
        >
          <nav
            className="site-container mobile-navigation-content"
            aria-label="Navegação mobile"
          >
            <NavLink
              to="/"
              end
              onClick={
                closeMobileMenu
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/features"
              onClick={
                closeMobileMenu
              }
            >
              Funcionalidades
            </NavLink>

            <NavLink
              to="/pricing"
              onClick={
                closeMobileMenu
              }
            >
              Planos
            </NavLink>

            <NavLink
              to="/faq"
              onClick={
                closeMobileMenu
              }
            >
              FAQ
            </NavLink>

            <div className="mobile-navigation-actions">
              <Link
                to="/login"
                className="button button-secondary"
                onClick={
                  closeMobileMenu
                }
              >
                Entrar
              </Link>

              <Link
                to="/register"
                className="button button-primary"
                onClick={
                  closeMobileMenu
                }
              >
                Começar agora
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="site-container footer-grid">
          <div>
            <Link
              to="/"
              className="brand footer-brand"
            >
              {settings.logoUrl ? (
                <img
                  src={
                    settings.logoUrl
                  }
                  alt={
                    settings.siteName
                  }
                  className="brand-logo"
                />
              ) : (
                <>
                  <span className="brand-mark">
                    FO
                  </span>

                  <span className="brand-text">
                    {
                      settings.siteName
                    }
                  </span>
                </>
              )}
            </Link>

            <p className="footer-description">
              Gestão completa para
              academias, centros de
              treinamento, professores e
              alunos.
            </p>
          </div>

          <div>
            <h3>Produto</h3>

            <Link to="/features">
              Funcionalidades
            </Link>

            <Link to="/pricing">
              Planos
            </Link>

            <Link to="/faq">
              FAQ
            </Link>
          </div>

          <div>
            <h3>Acesso</h3>

            <Link to="/login">
              Entrar
            </Link>

            <Link to="/register">
              Criar conta
            </Link>
          </div>
        </div>

        <div className="site-container footer-bottom">
          <span>
            ©{' '}
            {new Date().getFullYear()}{' '}
            {settings.siteName}. Todos os
            direitos reservados.
          </span>
        </div>
      </footer>
    </div>
  )
}