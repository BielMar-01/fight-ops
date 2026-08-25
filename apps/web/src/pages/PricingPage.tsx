import { Link } from 'react-router-dom'

import { PageSeo } from '../components/public/PageSeo'
import { PublicPageError } from '../components/public/PublicPageError'
import { PublicPageLoading } from '../components/public/PublicPageLoading'
import { usePublicPage } from '../hooks/usePublicSite'

import type { PricingItem } from '../types/public-site'

interface PricingMetadata {
  items?: PricingItem[]
}

export function PricingPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = usePublicPage('pricing')

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

  const plans =
    page.sections.find(
      (section) =>
        section.key === 'plans',
    )

  const metadata =
    plans?.metadata as
      | PricingMetadata
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
        <div className="site-container pricing-grid">
          {metadata?.items?.map(
            (plan) => (
              <article
                className={
                  plan.featured
                    ? 'pricing-card featured'
                    : 'pricing-card'
                }
                key={plan.key}
              >
                {plan.featured ? (
                  <span className="pricing-badge">
                    Mais completo
                  </span>
                ) : null}

                <span className="pricing-name">
                  {plan.name}
                </span>

                <h2>
                  {plan.title}
                </h2>

                <p>
                  {
                    plan.description
                  }
                </p>

                <div className="pricing-value">
                  <strong>
                    {plan.price}
                  </strong>
                </div>

                <ul>
                  {plan.features.map(
                    (feature) => (
                      <li key={feature}>
                        {feature}
                      </li>
                    ),
                  )}
                </ul>

                <Link
                  to="/register"
                  className={
                    plan.featured
                      ? 'button button-primary'
                      : 'button button-secondary'
                  }
                >
                  Começar
                </Link>
              </article>
            ),
          )}
        </div>
      </section>
    </main>
  )
}