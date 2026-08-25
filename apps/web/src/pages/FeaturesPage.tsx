import { PageSeo } from '../components/public/PageSeo'
import { PublicPageError } from '../components/public/PublicPageError'
import { PublicPageLoading } from '../components/public/PublicPageLoading'
import { usePublicPage } from '../hooks/usePublicSite'

import type { FeatureItem } from '../types/public-site'

interface FeaturesMetadata {
  items?: FeatureItem[]
}

export function FeaturesPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = usePublicPage('features')

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

  const items =
    page.sections.find(
      (section) =>
        section.key === 'items',
    )

  const metadata =
    items?.metadata as
      | FeaturesMetadata
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
        <div className="site-container feature-grid">
          {metadata?.items?.map(
            (
              feature,
              index,
            ) => (
              <article
                className="feature-card"
                key={
                  feature.key ??
                  feature.title
                }
              >
                <div className="feature-icon">
                  {String(
                    index + 1,
                  ).padStart(
                    2,
                    '0',
                  )}
                </div>

                <h3>
                  {feature.title}
                </h3>

                <p>
                  {
                    feature.description
                  }
                </p>
              </article>
            ),
          )}
        </div>
      </section>
    </main>
  )
}