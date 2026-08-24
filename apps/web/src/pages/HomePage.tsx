import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main data-testid="home-page">
      <section>
        <p>FightOps</p>

        <h1 data-testid="home-title">Gestão completa para academias e centros de treinamento</h1>

        <p>
          Gerencie alunos, professores, aulas, presenças, graduações, planos e financeiro em
          uma única plataforma.
        </p>

        <div>
          <Link to="/register" data-testid="home-register-link">
            Começar agora
          </Link>

          <Link to="/features" data-testid="home-features-link">
            Conhecer recursos
          </Link>
        </div>
      </section>
    </main>
  )
}