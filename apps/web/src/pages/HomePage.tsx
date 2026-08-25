import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <>
      <main>
        <section className="hero">
          <div className="site-container hero-grid">
            <div className="hero-content">
              <span className="eyebrow">
                Gestão inteligente para o seu CT
              </span>

              <h1>
                Organize sua academia.
                <span> Evolua sua operação.</span>
              </h1>

              <p className="hero-description">
                O FightOps centraliza alunos, professores, planos, turmas,
                pagamentos e toda a operação do seu centro de treinamento em
                uma única plataforma.
              </p>

              <div className="hero-actions">
                <Link to="/register" className="button button-primary button-lg">
                  Começar gratuitamente
                </Link>

                <Link to="/features" className="button button-secondary button-lg">
                  Conhecer funcionalidades
                </Link>
              </div>

              <div className="hero-meta">
                <span>Sem cartão de crédito</span>
                <span>Configuração rápida</span>
                <span>Gestão em qualquer lugar</span>
              </div>
            </div>

            <div className="hero-dashboard">
              <div className="dashboard-window">
                <div className="dashboard-window-header">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="dashboard-content">
                  <div className="dashboard-sidebar">
                    <div className="dashboard-logo">FO</div>

                    <div className="dashboard-nav-item active" />
                    <div className="dashboard-nav-item" />
                    <div className="dashboard-nav-item" />
                    <div className="dashboard-nav-item" />
                  </div>

                  <div className="dashboard-main">
                    <div>
                      <span className="dashboard-label">Visão geral</span>
                      <h3>Dashboard</h3>
                    </div>

                    <div className="dashboard-stats">
                      <div className="dashboard-card">
                        <span>Alunos ativos</span>
                        <strong>248</strong>
                        <small>+12 este mês</small>
                      </div>

                      <div className="dashboard-card">
                        <span>Turmas hoje</span>
                        <strong>08</strong>
                        <small>42 alunos inscritos</small>
                      </div>

                      <div className="dashboard-card">
                        <span>Receita mensal</span>
                        <strong>R$ 28,4k</strong>
                        <small>+8,2%</small>
                      </div>
                    </div>

                    <div className="dashboard-chart">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="site-container">
            <div className="section-heading">
              <span className="eyebrow">Tudo em um só lugar</span>

              <h2>
                Menos planilhas.
                <span> Mais controle.</span>
              </h2>

              <p>
                Ferramentas pensadas para simplificar a rotina de quem
                administra uma academia ou centro de treinamento.
              </p>
            </div>

            <div className="feature-grid">
              <article className="feature-card">
                <div className="feature-icon">01</div>

                <h3>Gestão de alunos</h3>

                <p>
                  Cadastre alunos, acompanhe status, histórico, planos e
                  informações importantes.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">02</div>

                <h3>Turmas e professores</h3>

                <p>
                  Organize horários, professores, capacidade das turmas e
                  presença dos alunos.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">03</div>

                <h3>Financeiro</h3>

                <p>
                  Acompanhe mensalidades, pagamentos, inadimplência e indicadores
                  financeiros.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">04</div>

                <h3>Gestão de acessos</h3>

                <p>
                  Controle as permissões de donos, administradores,
                  recepcionistas, professores e alunos.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">05</div>

                <h3>Multiacademia</h3>

                <p>
                  Gerencie diferentes unidades dentro da mesma estrutura de
                  forma organizada e segura.
                </p>
              </article>

              <article className="feature-card">
                <div className="feature-icon">06</div>

                <h3>Indicadores</h3>

                <p>
                  Tenha uma visão rápida da operação com informações úteis para
                  decisões do dia a dia.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section section-highlight">
          <div className="site-container highlight-grid">
            <div>
              <span className="eyebrow">Feito para artes marciais</span>

              <h2>
                Do tatame para a gestão.
              </h2>

              <p>
                O FightOps nasce para atender a realidade de academias,
                professores e equipes que precisam de organização sem
                burocracia.
              </p>
            </div>

            <div className="highlight-list">
              <div>
                <strong>01</strong>
                <span>Organização operacional</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Experiência do aluno</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Controle financeiro</span>
              </div>

              <div>
                <strong>04</strong>
                <span>Crescimento sustentável</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="site-container cta-card">
            <div>
              <span className="eyebrow">Comece agora</span>

              <h2>
                Sua operação merece mais controle.
              </h2>

              <p>
                Crie sua conta e prepare sua academia para uma gestão mais
                simples e profissional.
              </p>
            </div>

            <Link to="/register" className="button button-primary button-lg">
              Criar minha conta
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}