export function PublicPageLoading() {
  return (
    <main
      className="page-state"
      data-testid="public-page-loading"
    >
      <div className="loading-spinner" />

      <p>
        Carregando conteúdo...
      </p>
    </main>
  )
}