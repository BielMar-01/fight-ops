import {
  useAuth,
} from '../hooks/useAuth'

import '../styles/dashboard.css'

export function DashboardPage() {
  const {
    user,
  } =
    useAuth()

  if (!user) {
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
            Visão geral
          </span>

          <h1>
            Olá, {user.name}.
          </h1>

          <p>
            Acompanhe os principais
            indicadores da sua operação.
          </p>
        </div>
      </div>

      <section
        className="dashboard-metrics"
        aria-label="Indicadores principais"
      >
        <article
          className="dashboard-metric-card"
          data-testid="dashboard-metric-academies"
        >
          <span>
            Academias
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
                Configure seu FightOps
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

            <div className="dashboard-step">
              <span className="dashboard-step-number">
                2
              </span>

              <div>
                <strong>
                  Criar academia
                </strong>

                <p>
                  Cadastre sua primeira
                  unidade.
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
                Conta
              </span>

              <h2>
                Seu acesso
              </h2>
            </div>
          </div>

          <dl className="dashboard-account-list">
            <div>
              <dt>
                Nome
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
                Perfil global
              </dt>

              <dd>
                {user.globalRole}
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