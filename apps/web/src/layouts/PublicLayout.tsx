import { Link, NavLink, Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="site-container header-content">
          <Link to="/" className="brand">
            <span className="brand-mark">FO</span>

            <span className="brand-text">
              Fight<span>Ops</span>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Navegação principal">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Início
            </NavLink>

            <NavLink
              to="/features"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Funcionalidades
            </NavLink>

            <NavLink
              to="/pricing"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Planos
            </NavLink>

            <NavLink
              to="/faq"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              FAQ
            </NavLink>
          </nav>

          <div className="header-actions">
            <Link to="/login" className="button button-ghost">
              Entrar
            </Link>

            <Link to="/register" className="button button-primary">
              Começar agora
            </Link>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <div className="site-container footer-grid">
          <div>
            <Link to="/" className="brand footer-brand">
              <span className="brand-mark">FO</span>

              <span className="brand-text">
                Fight<span>Ops</span>
              </span>
            </Link>

            <p className="footer-description">
              Gestão completa para academias, centros de treinamento,
              professores e alunos.
            </p>
          </div>

          <div>
            <h3>Produto</h3>

            <Link to="/features">Funcionalidades</Link>
            <Link to="/pricing">Planos</Link>
            <Link to="/faq">FAQ</Link>
          </div>

          <div>
            <h3>Acesso</h3>

            <Link to="/login">Entrar</Link>
            <Link to="/register">Criar conta</Link>
          </div>
        </div>

        <div className="site-container footer-bottom">
          <span>
            © {new Date().getFullYear()} FightOps. Todos os direitos reservados.
          </span>
        </div>
      </footer>
    </div>
  )
}