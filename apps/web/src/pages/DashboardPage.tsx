import {
  useGym,
} from '../contexts/GymContext'

import {
  useAuth,
} from '../hooks/useAuth'

import '../styles/dashboard.css'

export function DashboardPage() {
  const {
    user,
  } =
    useAuth()

  const {
    activeGym,
  } =
    useGym()

  if (
    !user ||
    !activeGym
  ) {
    return null
  }

  return (
    <main
      className="dashboard-page"
      data-testid="dashboard-page"
    >
      <div className="dashboard-page-heading">
        <div>
          <span className="eyebrow">
            {activeGym.name}
          </span>

          <h1>
            Olá, {user.name}.
          </h1>

          <p>
            Acompanhe os principais
            indicadores da sua academia.
          </p>
        </div>
      </div>

      <section
        className="dashboard-current-gym"
        data-testid="dashboard-active-gym"
      >
        <div>
          <span>
            Academia ativa
          </span>

          <strong>
            {activeGym.name}
          </strong>
        </div>

        <div>
          <span>
            Seu acesso
          </span>

          <strong>
            {activeGym.role}
          </strong>
        </div>

        <div>
          <span>
            Slug
          </span>

          <strong>
            {activeGym.slug}
          </strong>
        </div>
      </section>

      <section
        className="dashboard-metrics"
        aria-label="Indicadores principais"
      >
        <article
          className="dashboard-metric-card"
          data-testid="dashboard-metric-students"
        >
          <span>
            Alunos ativos
          </span>

          <strong>
            —
          </strong>

          <small>
            Em breve
          </small>
        </article>

        <article
          className="dashboard-metric-card"
          data-testid="dashboard-metric-professors"
        >
          <span>
            Professores
          </span>

          <strong>
            —
          </strong>

          <small>
            Em breve
          </small>
        </article>

        <article
          className="dashboard-metric-card"
          data-testid="dashboard-metric-classes"
        >
          <span>
            Turmas
          </span>

          <strong>
            —
          </strong>

          <small>
            Em breve
          </small>
        </article>

        <article
          className="dashboard-metric-card"
          data-testid="dashboard-metric-revenue"
        >
          <span>
            Receita mensal
          </span>

          <strong>
            —
          </strong>

          <small>
            Em breve
          </small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article
          className="dashboard-panel"
          data-testid="dashboard-getting-started"
        >
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-eyebrow">
                Primeiros passos
              </span>

              <h2>
                Configure sua academia
              </h2>
            </div>
          </div>

          <div className="dashboard-steps">
            <div className="dashboard-step completed">
              <span className="dashboard-step-number">
                ✓
              </span>

              <div>
                <strong>
                  Conta criada
                </strong>

                <p>
                  Seu acesso ao FightOps
                  está funcionando.
                </p>
              </div>
            </div>

            <div className="dashboard-step completed">
              <span className="dashboard-step-number">
                ✓
              </span>

              <div>
                <strong>
                  Academia criada
                </strong>

                <p>
                  {activeGym.name}
                  {' '}
                  está configurada.
                </p>
              </div>
            </div>

            <div className="dashboard-step">
              <span className="dashboard-step-number">
                3
              </span>

              <div>
                <strong>
                  Configurar equipe
                </strong>

                <p>
                  Convide professores e
                  administradores.
                </p>
              </div>
            </div>

            <div className="dashboard-step">
              <span className="dashboard-step-number">
                4
              </span>

              <div>
                <strong>
                  Cadastrar alunos
                </strong>

                <p>
                  Comece a organizar sua
                  operação.
                </p>
              </div>
            </div>
          </div>
        </article>

        <article
          className="dashboard-panel"
          data-testid="dashboard-account-info"
        >
          <div className="dashboard-panel-heading">
            <div>
              <span className="dashboard-panel-eyebrow">
                Acesso
              </span>

              <h2>
                Seu vínculo
              </h2>
            </div>
          </div>

          <dl className="dashboard-account-list">
            <div>
              <dt>
                Usuário
              </dt>

              <dd>
                {user.name}
              </dd>
            </div>

            <div>
              <dt>
                E-mail
              </dt>

              <dd>
                {user.email}
              </dd>
            </div>

            <div>
              <dt>
                Academia
              </dt>

              <dd>
                {activeGym.name}
              </dd>
            </div>

            <div>
              <dt>
                Papel na academia
              </dt>

              <dd>
                {activeGym.role}
              </dd>
            </div>

            <div>
              <dt>
                Status
              </dt>

              <dd>
                <span className="status-badge active">
                  Ativo
                </span>
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </main>
  )
}