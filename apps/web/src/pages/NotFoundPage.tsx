import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main data-testid="not-found-page">
      <h1 data-testid="not-found-title">Página não encontrada</h1>

      <Link to="/" data-testid="not-found-home-link">
        Voltar para o início
      </Link>
    </main>
  )
}