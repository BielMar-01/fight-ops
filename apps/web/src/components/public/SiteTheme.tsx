import { useEffect } from 'react'

import type { SiteSettings } from '../../types/public-site'

interface SiteThemeProps {
  settings: SiteSettings
}

export function SiteTheme({
  settings,
}: SiteThemeProps) {
  useEffect(() => {
    const root =
      document.documentElement

    root.style.setProperty(
      '--color-primary',
      settings.primaryColor,
    )

    root.style.setProperty(
      '--color-secondary',
      settings.secondaryColor,
    )

    root.style.setProperty(
      '--color-background',
      settings.backgroundColor,
    )

    root.style.setProperty(
      '--color-surface',
      settings.surfaceColor,
    )

    root.style.setProperty(
      '--color-text',
      settings.textColor,
    )

    root.style.setProperty(
      '--color-text-muted',
      settings.mutedTextColor,
    )

    root.style.setProperty(
      '--font-heading',
      settings.headingFont,
    )

    root.style.setProperty(
      '--font-body',
      settings.bodyFont,
    )

    if (settings.faviconUrl) {
      let favicon =
        document.querySelector<HTMLLinkElement>(
          'link[rel="icon"]',
        )

      if (!favicon) {
        favicon =
          document.createElement(
            'link',
          )

        favicon.rel = 'icon'

        document.head.appendChild(
          favicon,
        )
      }

      favicon.href =
        settings.faviconUrl
    }
  }, [settings])

  return null
}