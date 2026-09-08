import type { FastifyInstance } from 'fastify'

import { createAuditLog } from '../audit/audit.service.js'

import { authenticate } from '../auth/authenticate.js'

import { requireGymRole } from '../gyms/gym-access.js'

import {
  createProfessorModalityBodySchema,
  professorModalitiesParamsSchema,
  professorModalityParamsSchema,
} from './professor-modalities.schemas.js'

import {
  createProfessorModality,
  deleteProfessorModality,
  listProfessorModalities,
} from './professor-modalities.service.js'

const security = [
  {
    bearerAuth: [],
  },
]

const errorResponseSchema = {
  type: 'object',

  properties: {
    error: {
      type: 'object',

      properties: {
        code: {
          type: 'string',
        },

        message: {
          type: 'string',
        },
      },

      required: ['code', 'message'],
    },
  },

  required: ['error'],
}

const professorModalitiesParamsJsonSchema = {
  type: 'object',

  required: ['gymId', 'professorId'],

  properties: {
    gymId: {
      type: 'string',

      format: 'uuid',

      description: 'Identificador da academia.',
    },

    professorId: {
      type: 'string',

      format: 'uuid',

      description: 'Identificador do professor.',
    },
  },
}

const professorModalityParamsJsonSchema = {
  type: 'object',

  required: ['gymId', 'professorId', 'modalityId'],

  properties: {
    gymId: {
      type: 'string',

      format: 'uuid',

      description: 'Identificador da academia.',
    },

    professorId: {
      type: 'string',

      format: 'uuid',

      description: 'Identificador do professor.',
    },

    modalityId: {
      type: 'string',

      format: 'uuid',

      description: 'Identificador da modalidade.',
    },
  },
}

const modalitySummarySchema = {
  type: 'object',

  properties: {
    id: {
      type: 'string',

      format: 'uuid',
    },

    name: {
      type: 'string',
    },

    description: {
      anyOf: [
        {
          type: 'string',
        },

        {
          type: 'null',
        },
      ],
    },

    color: {
      anyOf: [
        {
          type: 'string',
        },

        {
          type: 'null',
        },
      ],
    },

    active: {
      type: 'boolean',
    },
  },

  required: ['id', 'name', 'description', 'color', 'active'],
}

const professorModalitySchema = {
  type: 'object',

  properties: {
    id: {
      type: 'string',

      format: 'uuid',
    },

    gymId: {
      type: 'string',

      format: 'uuid',
    },

    professorId: {
      type: 'string',

      format: 'uuid',
    },

    modalityId: {
      type: 'string',

      format: 'uuid',
    },

    createdAt: {
      type: 'string',

      format: 'date-time',
    },

    modality: modalitySummarySchema,
  },

  required: [
    'id',
    'gymId',
    'professorId',
    'modalityId',
    'createdAt',
    'modality',
  ],
}

export async function professorModalityRoutes(app: FastifyInstance) {
  /*
   * =========================================================
   * LIST
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/professors/:professorId/modalities',
    {
      schema: {
        tags: ['Professor Modalities'],

        summary: 'Listar modalidades do professor',

        description:
          'Lista as modalidades vinculadas ao professor dentro da academia informada.',

        security,

        params: professorModalitiesParamsJsonSchema,

        response: {
          200: {
            type: 'object',

            properties: {
              professorModalities: {
                type: 'array',

                items: professorModalitySchema,
              },
            },

            required: ['professorModalities'],
          },

          400: errorResponseSchema,

          401: errorResponseSchema,

          403: errorResponseSchema,

          404: errorResponseSchema,
        },
      },

      preHandler: [
        authenticate,
        requireGymRole('OWNER', 'ADMIN', 'RECEPTIONIST', 'PROFESSOR'),
      ],
    },
    async (request, reply) => {
      const params = professorModalitiesParamsSchema.parse(request.params)

      const professorModalities = await listProfessorModalities(
        params.gymId,
        params.professorId,
      )

      return reply.send({
        professorModalities,
      })
    },
  )

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  app.post(
    '/gyms/:gymId/professors/:professorId/modalities',
    {
      schema: {
        tags: ['Professor Modalities'],

        summary: 'Vincular modalidade ao professor',

        description:
          'Vincula uma modalidade ativa ao professor. A modalidade e o professor devem pertencer à mesma academia.',

        security,

        params: professorModalitiesParamsJsonSchema,

        body: {
          type: 'object',

          additionalProperties: false,

          required: ['modalityId'],

          properties: {
            modalityId: {
              type: 'string',

              format: 'uuid',

              description: 'Identificador da modalidade que será vinculada.',
            },
          },
        },

        response: {
          201: {
            type: 'object',

            properties: {
              professorModality: professorModalitySchema,
            },

            required: ['professorModality'],
          },

          400: errorResponseSchema,

          401: errorResponseSchema,

          403: errorResponseSchema,

          404: errorResponseSchema,

          409: errorResponseSchema,
        },
      },

      preHandler: [authenticate, requireGymRole('OWNER', 'ADMIN')],
    },
    async (request, reply) => {
      const params = professorModalitiesParamsSchema.parse(request.params)

      const body = createProfessorModalityBodySchema.parse(request.body)

      const professorModality = await createProfessorModality(
        params.gymId,
        params.professorId,
        body.modalityId,
      )

      await createAuditLog({
        gymId: params.gymId,

        userId: request.user!.id,

        action: 'CREATE',

        entity: 'PROFESSOR_MODALITY',

        entityId: professorModality.id,

        newValues: professorModality,

        metadata: {
          source: 'professor-modalities',

          professorId: params.professorId,

          modalityId: body.modalityId,
        },

        ipAddress: request.ip,

        userAgent: request.headers['user-agent'],
      })

      return reply.status(201).send({
        professorModality,
      })
    },
  )

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  app.delete(
    '/gyms/:gymId/professors/:professorId/modalities/:modalityId',
    {
      schema: {
        tags: ['Professor Modalities'],

        summary: 'Remover modalidade do professor',

        description:
          'Remove o vínculo entre o professor e a modalidade dentro da academia informada.',

        security,

        params: professorModalityParamsJsonSchema,

        response: {
          204: {
            type: 'null',

            description: 'Vínculo removido com sucesso.',
          },

          400: errorResponseSchema,

          401: errorResponseSchema,

          403: errorResponseSchema,

          404: errorResponseSchema,
        },
      },

      preHandler: [authenticate, requireGymRole('OWNER', 'ADMIN')],
    },
    async (request, reply) => {
      const params = professorModalityParamsSchema.parse(request.params)

      const deletedProfessorModality = await deleteProfessorModality(
        params.gymId,
        params.professorId,
        params.modalityId,
      )

      await createAuditLog({
        gymId: params.gymId,

        userId: request.user!.id,

        action: 'DELETE',

        entity: 'PROFESSOR_MODALITY',

        entityId: deletedProfessorModality.id,

        oldValues: deletedProfessorModality,

        metadata: {
          source: 'professor-modalities',

          professorId: params.professorId,

          modalityId: params.modalityId,
        },

        ipAddress: request.ip,

        userAgent: request.headers['user-agent'],
      })

      return reply.status(204).send()
    },
  )
}