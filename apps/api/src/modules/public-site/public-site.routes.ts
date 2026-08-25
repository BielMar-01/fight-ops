import type { FastifyInstance } from 'fastify'

import {
  getPublicPage,
  getPublicSeo,
  getSiteSettings,
} from './public-site.service.js'

export async function publicSiteRoutes(app: FastifyInstance) {
  app.get(
    '/public/site',
    {
      schema: {
        tags: ['Public Site'],

        summary: 'Consultar configurações públicas do site',
      },
    },

    async (_request, reply) => {
      const settings = await getSiteSettings()

      return reply.status(200).send({
        settings,
      })
    },
  )

  app.get<{
    Params: {
      slug: string
    }
  }>(
    '/public/pages/:slug',
    {
      schema: {
        tags: ['Public Site'],

        summary: 'Consultar conteúdo de uma página pública',

        params: {
          type: 'object',

          required: ['slug'],

          properties: {
            slug: {
              type: 'string',
            },
          },
        },
      },
    },

    async (request, reply) => {
      const page = await getPublicPage(request.params.slug)

      return reply.status(200).send({
        page,
      })
    },
  )

  app.get<{
    Params: {
      slug: string
    }
  }>(
    '/public/seo/:slug',
    {
      schema: {
        tags: ['Public Site'],

        summary: 'Consultar SEO de uma página pública',

        params: {
          type: 'object',

          required: ['slug'],

          properties: {
            slug: {
              type: 'string',
            },
          },
        },
      },
    },

    async (request, reply) => {
      const seo = await getPublicSeo(request.params.slug)

      return reply.status(200).send({
        seo,
      })
    },
  )
}