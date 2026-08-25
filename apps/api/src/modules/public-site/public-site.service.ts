import { prisma } from '../../database/prisma.js'
import { AppError } from '../../http/app-error.js'

export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findFirst({
    where: {
      active: true,
    },

    orderBy: {
      createdAt: 'asc',
    },
  })

  if (!settings) {
    throw new AppError(
      'SITE_SETTINGS_NOT_FOUND',
      404,
      'Configurações públicas do site não encontradas.',
    )
  }

  return settings
}

export async function getPublicPage(slug: string) {
  const page = await prisma.publicPage.findUnique({
    where: {
      slug,
    },

    include: {
      sections: {
        where: {
          active: true,
        },

        orderBy: {
          sortOrder: 'asc',
        },
      },

      seo: true,
    },
  })

  if (!page || !page.active) {
    throw new AppError(
      'PUBLIC_PAGE_NOT_FOUND',
      404,
      'Página pública não encontrada.',
    )
  }

  return page
}

export async function getPublicSeo(slug: string) {
  const page = await prisma.publicPage.findUnique({
    where: {
      slug,
    },

    select: {
      active: true,
      seo: true,
    },
  })

  if (!page || !page.active || !page.seo) {
    throw new AppError(
      'SEO_NOT_FOUND',
      404,
      'Configuração de SEO não encontrada.',
    )
  }

  return page.seo
}