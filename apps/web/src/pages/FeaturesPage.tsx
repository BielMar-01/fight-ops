import { Link } from 'react-router-dom'

const features = [
  {
    title: 'Alunos',
    description:
      'Cadastro, acompanhamento, status, contatos, histórico e informações dos alunos.',
  },
  {
    title: 'Professores',
    description:
      'Organização da equipe, funções, permissões e vínculo com turmas.',
  },
  {
    title: 'Turmas',
    description:
      'Controle de horários, capacidade, modalidade, professor responsável e participantes.',
  },
  {
    title: 'Planos',
    description:
      'Estruturação de planos, mensalidades, regras e vínculos com alunos.',
  },
  {
    title: 'Financeiro',
    description:
      'Acompanhamento de cobranças, pagamentos, inadimplência e indicadores.',
  },
  {
    title: 'Permissões',
    description:
      'Controle de acesso para proprietários, administradores, recepção, professores e alunos.',
  },
  {
    title: 'Multiacademia',
    description:
      'Gerencie mais de uma unidade com separação de dados e permissões.',
  },
  {
    title: 'Dashboard',
    description:
      'Indicadores rápidos para acompanhar a saúde e evolução da operação.',
  },
]

export function FeaturesPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="site-container">
          <span className="eyebrow">Funcionalidades</span>

          <h1>
            Tudo que sua academia precisa
            <span> para operar melhor.</span>
          </h1>

          <p>
            O FightOps reúne as principais rotinas administrativas e
            operacionais em uma plataforma única.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="site-container feature-grid">
          {features.map((feature, index) => (
            <article className="feature-card" key={feature.title}>
              <div className="feature-icon">
                {String(index + 1).padStart(2, '0')}
              </div>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="site-container cta-card">
          <div>
            <span className="eyebrow">Pronto para começar?</span>

            <h2>Organize sua operação com o FightOps.</h2>
          </div>

          <Link to="/register" className="button button-primary button-lg">
            Criar conta
          </Link>
        </div>
      </section>
    </main>
  )
}