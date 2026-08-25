interface PublicPageErrorProps {
  onRetry?: () => void
}

export function PublicPageError({
  onRetry,
}: PublicPageErrorProps) {
  return (
    <main
      className="page-state"
      data-testid="public-page-error"
    >
      <span className="eyebrow">
        FightOps
      </span>

      <h1>
        Não foi possível carregar esta página.
      </h1>

      <p>
        O conteúdo público está temporariamente indisponível.
      </p>

      {onRetry ? (
        <button
          type="button"
          className="button button-primary"
          onClick={onRetry}
        >
          Tentar novamente
        </button>
      ) : null}
    </main>
  )
}