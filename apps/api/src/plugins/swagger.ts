import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

import type { FastifyInstance } from 'fastify'

export function registerSwagger(app: FastifyInstance) {
  app.register(swagger, {
    openapi: {
      openapi: '3.0.3',

      info: {
        title: 'FightOps API',
        description:
          'API REST da plataforma FightOps para gestão de academias e centros de treinamento.',
        version: '0.1.0',
      },

      tags: [
        {
          name: 'Health',
          description: 'Monitoramento e disponibilidade da API.',
        },
        {
          name: 'Auth',
          description: 'Autenticação e gerenciamento de sessão.',
        },
      ],

      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })

  app.register(swaggerUi, {
    routePrefix: '/docs',

    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },

    staticCSP: true,
  })

  app.get('/openapi.json', {
    schema: {
      hide: true,
    },

    handler: async () => {
      return app.swagger()
    },
  })
}