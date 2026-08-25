import { PageSeo } from '../components/public/PageSeo'
import { PublicPageError } from '../components/public/PublicPageError'
import { PublicPageLoading } from '../components/public/PublicPageLoading'
import { usePublicPage } from '../hooks/usePublicSite'

import type { FaqItem } from '../types/public-site'

interface FaqMetadata {
  items?: FaqItem[]
}

export function FaqPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = usePublicPage('faq')

  if (isLoading) {
    return <PublicPageLoading />
  }

  if (
    isError ||
    !data?.page
  ) {
    return (
      <PublicPageError
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  const page = data.page

  const hero =
    page.sections.find(
      (section) =>
        section.key === 'hero',
    )

  const questions =
    page.sections.find(
      (section) =>
        section.key ===
        'questions',
    )

  const metadata =
    questions?.metadata as
      | FaqMetadata
      | null

  return (
    <main>
      <PageSeo seo={page.seo} />

      {hero ? (
        <section className="page-hero">
          <div className="site-container">
            {hero.eyebrow ? (
              <span className="eyebrow">
                {hero.eyebrow}
              </span>
            ) : null}

            {hero.title ? (
              <h1>{hero.title}</h1>
            ) : null}

            {hero.content ? (
              <p>
                {hero.content}
              </p>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="site-container faq-list">
          {metadata?.items?.map(
            (item) => (
              <details
                className="faq-item"
                key={item.question}
              >
                <summary>
                  {item.question}
                </summary>

                <p>
                  {item.answer}
                </p>
              </details>
            ),
          )}
        </div>
      </section>
    </main>
  )
}