import { Link } from 'react-router-dom'

import { PageSeo } from '../components/public/PageSeo'
import { PublicPageError } from '../components/public/PublicPageError'
import { PublicPageLoading } from '../components/public/PublicPageLoading'
import { usePublicPage } from '../hooks/usePublicSite'

import type {
  FeatureItem,
} from '../types/public-site'

interface BenefitsMetadata {
  benefits?: string[]
}

interface FeaturesMetadata {
  items?: FeatureItem[]
}

interface MartialArtsMetadata {
  items?: string[]
}

export function HomePage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = usePublicPage('home')

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

  const features =
    page.sections.find(
      (section) =>
        section.key === 'features',
    )

  const martialArts =
    page.sections.find(
      (section) =>
        section.key ===
        'martial-arts',
    )

  const cta =
    page.sections.find(
      (section) =>
        section.key === 'cta',
    )

  const heroMetadata =
    hero?.metadata as
      | BenefitsMetadata
      | null

  const featuresMetadata =
    features?.metadata as
      | FeaturesMetadata
      | null

  const martialArtsMetadata =
    martialArts?.metadata as
      | MartialArtsMetadata
      | null

  return (
    <main>
      <PageSeo seo={page.seo} />

      {hero ? (
        <section
          className="hero"
          data-testid="home-hero"
        >
          <div className="site-container hero-grid">
            <div className="hero-content">
              {hero.eyebrow ? (
                <span className="eyebrow">
                  {hero.eyebrow}
                </span>
              ) : null}

              {hero.title ? (
                <h1>
                  {hero.title}
                </h1>
              ) : null}

              {hero.content ? (
                <p className="hero-description">
                  {hero.content}
                </p>
              ) : null}

              <div className="hero-actions">
                {hero.buttonText &&
                hero.buttonUrl ? (
                  <Link
                    to={hero.buttonUrl}
                    className="button button-primary button-lg"
                  >
                    {hero.buttonText}
                  </Link>
                ) : null}

                {hero.secondaryButtonText &&
                hero.secondaryButtonUrl ? (
                  <Link
                    to={
                      hero.secondaryButtonUrl
                    }
                    className="button button-secondary button-lg"
                  >
                    {
                      hero.secondaryButtonText
                    }
                  </Link>
                ) : null}
              </div>

              {heroMetadata?.benefits?.length ? (
                <div className="hero-meta">
                  {heroMetadata.benefits.map(
                    (benefit) => (
                      <span key={benefit}>
                        {benefit}
                      </span>
                    ),
                  )}
                </div>
              ) : null}
            </div>

            <div
              className="hero-dashboard"
              aria-hidden="true"
            >
              <div className="dashboard-window">
                <div className="dashboard-window-header">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="dashboard-content">
                  <div className="dashboard-sidebar">
                    <div className="dashboard-logo">
                      FO
                    </div>

                    <div className="dashboard-nav-item active" />
                    <div className="dashboard-nav-item" />
                    <div className="dashboard-nav-item" />
                    <div className="dashboard-nav-item" />
                  </div>

                  <div className="dashboard-main">
                    <span className="dashboard-label">
                      Visão geral
                    </span>

                    <h3>
                      Dashboard
                    </h3>

                    <div className="dashboard-stats">
                      <div className="dashboard-card">
                        <span>
                          Alunos ativos
                        </span>

                        <strong>
                          248
                        </strong>
                      </div>

                      <div className="dashboard-card">
                        <span>
                          Turmas hoje
                        </span>

                        <strong>
                          08
                        </strong>
                      </div>

                      <div className="dashboard-card">
                        <span>
                          Receita
                        </span>

                        <strong>
                          R$ 28,4k
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {features ? (
        <section
          className="section"
          data-testid="home-features"
        >
          <div className="site-container">
            <div className="section-heading">
              {features.eyebrow ? (
                <span className="eyebrow">
                  {features.eyebrow}
                </span>
              ) : null}

              {features.title ? (
                <h2>
                  {features.title}
                </h2>
              ) : null}

              {features.content ? (
                <p>
                  {features.content}
                </p>
              ) : null}
            </div>

            <div className="feature-grid">
              {featuresMetadata?.items?.map(
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
          </div>
        </section>
      ) : null}

      {martialArts ? (
        <section
          className="section section-highlight"
          data-testid="home-highlight"
        >
          <div className="site-container highlight-grid">
            <div>
              {martialArts.eyebrow ? (
                <span className="eyebrow">
                  {
                    martialArts.eyebrow
                  }
                </span>
              ) : null}

              {martialArts.title ? (
                <h2>
                  {
                    martialArts.title
                  }
                </h2>
              ) : null}

              {martialArts.content ? (
                <p>
                  {
                    martialArts.content
                  }
                </p>
              ) : null}
            </div>

            <div className="highlight-list">
              {martialArtsMetadata?.items?.map(
                (
                  item,
                  index,
                ) => (
                  <div key={item}>
                    <strong>
                      {String(
                        index + 1,
                      ).padStart(
                        2,
                        '0',
                      )}
                    </strong>

                    <span>
                      {item}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>
      ) : null}

      {cta ? (
        <section
          className="section"
          data-testid="home-cta"
        >
          <div className="site-container cta-card">
            <div>
              {cta.eyebrow ? (
                <span className="eyebrow">
                  {cta.eyebrow}
                </span>
              ) : null}

              {cta.title ? (
                <h2>
                  {cta.title}
                </h2>
              ) : null}

              {cta.content ? (
                <p>
                  {cta.content}
                </p>
              ) : null}
            </div>

            {cta.buttonText &&
            cta.buttonUrl ? (
              <Link
                to={cta.buttonUrl}
                className="button button-primary button-lg"
              >
                {cta.buttonText}
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  )
}