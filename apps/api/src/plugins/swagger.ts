import swagger from '@fastify/swagger'

import swaggerUi from '@fastify/swagger-ui'

import type { FastifyInstance } from 'fastify'

export function registerSwagger(
  app: FastifyInstance,
) {
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

          description:
            'Monitoramento e disponibilidade da API.',
        },

        {
          name: 'Auth',

          description:
            'Autenticação, recuperação de senha e gerenciamento de sessões.',
        },

        {
          name: 'Public Site',

          description:
            'Conteúdo, identidade visual e SEO das páginas públicas.',
        },

        {
          name: 'Gyms',

          description:
            'Cadastro, consulta e administração de academias.',
        },

        {
          name: 'Gym Members',

          description:
            'Gestão dos usuários, perfis e permissões vinculados às academias.',
        },

        {
          name: 'Students',

          description:
            'Cadastro e gestão de alunos das academias.',
        },

        {
          name: 'Professors',

          description:
            'Cadastro e gestão de professores das academias.',
        },

        {
          name:
            'Professor Modalities',

          description:
            'Gestão das modalidades ministradas por cada professor.',
        },

        {
          name: 'Modalities',

          description:
            'Cadastro e gestão das modalidades oferecidas pelas academias.',
        },

        {
          name: 'Graduations',

          description:
            'Gestão das graduações e faixas de cada modalidade.',
        },

        {
          name: 'Class Groups',

          description:
            'Cadastro e gestão das turmas oferecidas pelas academias.',
        },

        {
          name:
            'Class Group Professors',

          description:
            'Gestão dos professores responsáveis e auxiliares de cada turma.',
        },

        {
          name:
            'Class Schedules',

          description:
            'Gestão da grade recorrente de horários das turmas.',
        },

        {
          name: 'Audit',

          description:
            'Consulta dos registros de auditoria das academias.',
        },
      ],

      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',

            scheme: 'bearer',

            bearerFormat: 'JWT',

            description:
              'Access token JWT retornado pelo endpoint de login.',
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

      filter: true,

      displayRequestDuration: true,

      tryItOutEnabled: true,
    },

    staticCSP: true,
  })

  app.get(
    '/openapi.json',
    {
      schema: {
        hide: true,
      },
    },

    async () => {
      return app.swagger()
    },
  )
}