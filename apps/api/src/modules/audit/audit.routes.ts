import type {
  FastifyInstance,
} from 'fastify'

import {
  authenticate,
} from '../auth/authenticate.js'

import {
  requireGymRole,
} from '../gyms/gym-access.js'

import {
  auditGymParamsSchema,
  listAuditLogsQuerySchema,
} from './audit.schemas.js'

import {
  listAuditLogs,
} from './audit.service.js'

const security = [
  {
    bearerAuth: [],
  },
]

const errorResponseSchema = {
  type:
    'object',

  properties: {
    code: {
      type:
        'string',
    },

    message: {
      type:
        'string',
    },
  },
}

const auditUserSchema = {
  anyOf: [
    {
      type:
        'object',

      properties: {
        id: {
          type:
            'string',

          format:
            'uuid',
        },

        name: {
          type:
            'string',
        },

        email: {
          type:
            'string',

          format:
            'email',
        },
      },

      required: [
        'id',
        'name',
        'email',
      ],
    },

    {
      type:
        'null',
    },
  ],
}

const auditLogSchema = {
  type:
    'object',

  properties: {
    id: {
      type:
        'string',

      format:
        'uuid',
    },

    gymId: {
      anyOf: [
        {
          type:
            'string',

          format:
            'uuid',
        },

        {
          type:
            'null',
        },
      ],
    },

    userId: {
      anyOf: [
        {
          type:
            'string',

          format:
            'uuid',
        },

        {
          type:
            'null',
        },
      ],
    },

    action: {
      type:
        'string',
    },

    entity: {
      type:
        'string',
    },

    entityId: {
      anyOf: [
        {
          type:
            'string',
        },

        {
          type:
            'null',
        },
      ],
    },

    oldValues: {},

    newValues: {},

    metadata: {},

    ipAddress: {
      anyOf: [
        {
          type:
            'string',
        },

        {
          type:
            'null',
        },
      ],
    },

    userAgent: {
      anyOf: [
        {
          type:
            'string',
        },

        {
          type:
            'null',
        },
      ],
    },

    createdAt: {
      type:
        'string',

      format:
        'date-time',
    },

    user:
      auditUserSchema,
  },

  required: [
    'id',
    'gymId',
    'userId',
    'action',
    'entity',
    'entityId',
    'oldValues',
    'newValues',
    'metadata',
    'ipAddress',
    'userAgent',
    'createdAt',
    'user',
  ],
}

export async function auditRoutes(
  app: FastifyInstance,
) {
  app.get(
    '/gyms/:gymId/audit-logs',
    {
      schema: {
        tags: [
          'Audit',
        ],

        summary:
          'Listar logs de auditoria',

        description:
          'Lista as alterações auditadas da academia com paginação e filtros.',

        security,

        params: {
          type:
            'object',

          required: [
            'gymId',
          ],

          properties: {
            gymId: {
              type:
                'string',

              format:
                'uuid',

              description:
                'Identificador da academia.',
            },
          },
        },

        querystring: {
          type:
            'object',

          properties: {
            page: {
              type:
                'integer',

              minimum:
                1,

              default:
                1,
            },

            limit: {
              type:
                'integer',

              minimum:
                1,

              maximum:
                100,

              default:
                20,
            },

            action: {
              type:
                'string',

              description:
                'Filtra pela ação registrada.',
            },

            entity: {
              type:
                'string',

              description:
                'Filtra pela entidade auditada.',
            },

            userId: {
              type:
                'string',

              format:
                'uuid',

              description:
                'Filtra pelo usuário que executou a ação.',
            },

            startDate: {
              type:
                'string',

              format:
                'date',

              description:
                'Data inicial do período.',
            },

            endDate: {
              type:
                'string',

              format:
                'date',

              description:
                'Data final do período.',
            },
          },
        },

        response: {
          200: {
            type:
              'object',

            properties: {
              auditLogs: {
                type:
                  'array',

                items:
                  auditLogSchema,
              },

              pagination: {
                type:
                  'object',

                properties: {
                  page: {
                    type:
                      'integer',
                  },

                  limit: {
                    type:
                      'integer',
                  },

                  total: {
                    type:
                      'integer',
                  },

                  totalPages: {
                    type:
                      'integer',
                  },
                },

                required: [
                  'page',
                  'limit',
                  'total',
                  'totalPages',
                ],
              },
            },

            required: [
              'auditLogs',
              'pagination',
            ],
          },

          401:
            errorResponseSchema,

          403:
            errorResponseSchema,

          404:
            errorResponseSchema,
        },
      },

      preHandler: [
        authenticate,

        requireGymRole(
          'OWNER',
          'ADMIN',
        ),
      ],
    },

    async (
      request,
      reply,
    ) => {
      const params =
        auditGymParamsSchema.parse(
          request.params,
        )

      const query =
        listAuditLogsQuerySchema.parse(
          request.query,
        )

      const result =
        await listAuditLogs(
          params.gymId,
          query,
        )

      return reply
        .status(200)
        .send(
          result,
        )
    },
  )
}