import { useEffect } from 'react'

import type { SeoSettings } from '../../types/public-site'

interface PageSeoProps {
  seo: SeoSettings | null | undefined
}

function setMetaTag(
  selector: string,
  attribute: string,
  value: string,
) {
  let element =
    document.querySelector<HTMLMetaElement>(
      selector,
    )

  if (!element) {
    element =
      document.createElement('meta')

    if (
      selector.includes(
        'property=',
      )
    ) {
      const property =
        selector.match(
          /property="(.+?)"/,
        )?.[1]

      if (property) {
        element.setAttribute(
          'property',
          property,
        )
      }
    } else {
      const name =
        selector.match(
          /name="(.+?)"/,
        )?.[1]

      if (name) {
        element.setAttribute(
          'name',
          name,
        )
      }
    }

    document.head.appendChild(
      element,
    )
  }

  element.setAttribute(
    attribute,
    value,
  )
}

export function PageSeo({
  seo,
}: PageSeoProps) {
  useEffect(() => {
    if (!seo) {
      return
    }

    document.title =
      seo.title

    setMetaTag(
      'meta[name="description"]',
      'content',
      seo.description,
    )

    if (seo.keywords) {
      setMetaTag(
        'meta[name="keywords"]',
        'content',
        seo.keywords,
      )
    }

    setMetaTag(
      'meta[name="robots"]',
      'content',
      `${seo.robotsIndex ? 'index' : 'noindex'}, ${seo.robotsFollow ? 'follow' : 'nofollow'}`,
    )

    setMetaTag(
      'meta[property="og:title"]',
      'content',
      seo.ogTitle ??
        seo.title,
    )

    setMetaTag(
      'meta[property="og:description"]',
      'content',
      seo.ogDescription ??
        seo.description,
    )

    if (seo.ogImageUrl) {
      setMetaTag(
        'meta[property="og:image"]',
        'content',
        seo.ogImageUrl,
      )
    }

    if (seo.canonicalUrl) {
      let canonical =
        document.querySelector<HTMLLinkElement>(
          'link[rel="canonical"]',
        )

      if (!canonical) {
        canonical =
          document.createElement(
            'link',
          )

        canonical.rel =
          'canonical'

        document.head.appendChild(
          canonical,
        )
      }

      canonical.href =
        seo.canonicalUrl
    }
  }, [seo])

  return null
}