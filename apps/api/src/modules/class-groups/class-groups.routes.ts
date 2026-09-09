import type { FastifyInstance } from 'fastify'

import { createAuditLog } from '../audit/audit.service.js'

import { authenticate } from '../auth/authenticate.js'

import { requireGymRole } from '../gyms/gym-access.js'

import {
  classGroupListParamsSchema,
  classGroupParamsSchema,
  createClassGroupBodySchema,
  listClassGroupsQuerySchema,
  updateClassGroupBodySchema,
  updateClassGroupStatusBodySchema,
} from './class-groups.schemas.js'

import {
  createClassGroup,
  getClassGroupById,
  listClassGroups,
  updateClassGroup,
  updateClassGroupStatus,
} from './class-groups.service.js'

const security = [{ bearerAuth: [] }]

const errorResponseSchema = {
  type: 'object',
  properties: {
    error: {
      type: 'object',
      properties: {
        code: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['code', 'message'],
    },
  },
  required: ['error'],
}

const nullableStringSchema = {
  anyOf: [{ type: 'string' }, { type: 'null' }],
}

const nullableIntegerSchema = {
  anyOf: [{ type: 'integer' }, { type: 'null' }],
}

const classGroupListParamsJsonSchema = {
  type: 'object',
  required: ['gymId'],
  properties: {
    gymId: {
      type: 'string',
      format: 'uuid',
      description: 'Identificador da academia.',
    },
  },
}

const classGroupParamsJsonSchema = {
  type: 'object',
  required: ['gymId', 'classGroupId'],
  properties: {
    gymId: {
      type: 'string',
      format: 'uuid',
      description: 'Identificador da academia.',
    },
    classGroupId: {
      type: 'string',
      format: 'uuid',
      description: 'Identificador da turma.',
    },
  },
}

const modalitySummarySchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    color: nullableStringSchema,
    active: { type: 'boolean' },
  },
  required: ['id', 'name', 'color', 'active'],
}

const professorSummarySchema = {
  type: 'object',
  properties: {
    relationId: { type: 'string', format: 'uuid' },
    assignedAt: { type: 'string', format: 'date-time' },
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    email: nullableStringSchema,
    phone: nullableStringSchema,
    active: { type: 'boolean' },
  },
  required: [
    'relationId',
    'assignedAt',
    'id',
    'name',
    'email',
    'phone',
    'active',
  ],
}

const classGroupSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    gymId: { type: 'string', format: 'uuid' },
    modalityId: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    description: nullableStringSchema,
    level: {
      type: 'string',
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MIXED'],
    },
    minimumAge: nullableIntegerSchema,
    maximumAge: nullableIntegerSchema,
    maxStudents: nullableIntegerSchema,
    durationMinutes: { type: 'integer' },
    active: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    modality: modalitySummarySchema,
    primaryProfessor: {
      anyOf: [professorSummarySchema, { type: 'null' }],
    },
    assistantProfessors: {
      type: 'array',
      items: professorSummarySchema,
    },
    totalProfessors: { type: 'integer' },
  },
  required: [
    'id',
    'gymId',
    'modalityId',
    'name',
    'description',
    'level',
    'minimumAge',
    'maximumAge',
    'maxStudents',
    'durationMinutes',
    'active',
    'createdAt',
    'updatedAt',
    'modality',
    'primaryProfessor',
    'assistantProfessors',
    'totalProfessors',
  ],
}

const classGroupBodyJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['modalityId', 'name', 'level', 'durationMinutes'],
  properties: {
    modalityId: { type: 'string', format: 'uuid' },
    name: { type: 'string', minLength: 2, maxLength: 150 },
    description: { type: 'string', maxLength: 5000 },
    level: {
      type: 'string',
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MIXED'],
    },
    minimumAge: { type: 'integer', minimum: 0, maximum: 120 },
    maximumAge: { type: 'integer', minimum: 0, maximum: 120 },
    maxStudents: { type: 'integer', minimum: 1, maximum: 1000 },
    durationMinutes: { type: 'integer', minimum: 15, maximum: 300 },
  },
}

export async function classGroupRoutes(
  app: FastifyInstance,
) {
  /*
   * =========================================================
   * LIST
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/class-groups',
    {
      schema: {
        tags: ['Class Groups'],
        summary: 'Listar turmas',
        description: 'Lista as turmas da academia com filtros e paginação.',
        security,
        params: classGroupListParamsJsonSchema,
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            search: { type: 'string', minLength: 1, maxLength: 150 },
            active: { type: 'boolean' },
            modalityId: { type: 'string', format: 'uuid' },
            level: {
              type: 'string',
              enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'MIXED'],
            },
            professorId: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              classGroups: { type: 'array', items: classGroupSchema },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' },
                },
                required: ['page', 'limit', 'total', 'totalPages'],
              },
            },
            required: ['classGroups', 'pagination'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [
        authenticate,
        requireGymRole(
          'OWNER',
          'ADMIN',
          'RECEPTIONIST',
          'PROFESSOR',
        ),
      ],
    },
    async (request, reply) => {
      const params =
        classGroupListParamsSchema.parse(
          request.params,
        )

      const query =
        listClassGroupsQuerySchema.parse(
          request.query,
        )

      const result = await listClassGroups(
        params.gymId,
        query,
      )

      return reply.send(result)
    },
  )

  /*
   * =========================================================
   * DETAILS
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/class-groups/:classGroupId',
    {
      schema: {
        tags: ['Class Groups'],
        summary: 'Consultar turma',
        description: 'Consulta os dados completos de uma turma da academia.',
        security,
        params: classGroupParamsJsonSchema,
        response: {
          200: {
            type: 'object',
            properties: { classGroup: classGroupSchema },
            required: ['classGroup'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [
        authenticate,
        requireGymRole(
          'OWNER',
          'ADMIN',
          'RECEPTIONIST',
          'PROFESSOR',
        ),
      ],
    },
    async (request, reply) => {
      const params =
        classGroupParamsSchema.parse(
          request.params,
        )

      const classGroup = await getClassGroupById(
        params.gymId,
        params.classGroupId,
      )

      return reply.send({
        classGroup,
      })
    },
  )

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  app.post(
    '/gyms/:gymId/class-groups',
    {
      schema: {
        tags: ['Class Groups'],
        summary: 'Criar turma',
        description: 'Cria uma turma vinculada a uma modalidade ativa da academia.',
        security,
        params: classGroupListParamsJsonSchema,
        body: classGroupBodyJsonSchema,
        response: {
          201: {
            type: 'object',
            properties: { classGroup: classGroupSchema },
            required: ['classGroup'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
      preHandler: [
        authenticate,
        requireGymRole('OWNER', 'ADMIN'),
      ],
    },
    async (request, reply) => {
      const params =
        classGroupListParamsSchema.parse(
          request.params,
        )

      const body =
        createClassGroupBodySchema.parse(
          request.body,
        )

      const classGroup = await createClassGroup(
        params.gymId,
        body,
      )

      await createAuditLog({
        gymId: params.gymId,
        userId: request.user!.id,
        action: 'CREATE',
        entity: 'CLASS_GROUP',
        entityId: classGroup.id,
        newValues: classGroup,
        metadata: {
          source: 'class-groups',
          modalityId: classGroup.modalityId,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      })

      return reply.status(201).send({
        classGroup,
      })
    },
  )

  /*
   * =========================================================
   * UPDATE
   * =========================================================
   */

  app.put(
    '/gyms/:gymId/class-groups/:classGroupId',
    {
      schema: {
        tags: ['Class Groups'],
        summary: 'Editar turma',
        description: 'Atualiza os dados cadastrais e operacionais de uma turma.',
        security,
        params: classGroupParamsJsonSchema,
        body: classGroupBodyJsonSchema,
        response: {
          200: {
            type: 'object',
            properties: { classGroup: classGroupSchema },
            required: ['classGroup'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
          409: errorResponseSchema,
        },
      },
      preHandler: [
        authenticate,
        requireGymRole('OWNER', 'ADMIN'),
      ],
    },
    async (request, reply) => {
      const params =
        classGroupParamsSchema.parse(
          request.params,
        )

      const body =
        updateClassGroupBodySchema.parse(
          request.body,
        )

      const previousClassGroup =
        await getClassGroupById(
          params.gymId,
          params.classGroupId,
        )

      const classGroup = await updateClassGroup(
        params.gymId,
        params.classGroupId,
        body,
      )

      await createAuditLog({
        gymId: params.gymId,
        userId: request.user!.id,
        action: 'UPDATE',
        entity: 'CLASS_GROUP',
        entityId: classGroup.id,
        oldValues: previousClassGroup,
        newValues: classGroup,
        metadata: {
          source: 'class-groups',
          modalityId: classGroup.modalityId,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      })

      return reply.send({
        classGroup,
      })
    },
  )

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  app.patch(
    '/gyms/:gymId/class-groups/:classGroupId/status',
    {
      schema: {
        tags: ['Class Groups'],
        summary: 'Alterar status da turma',
        description: 'Ativa ou inativa uma turma da academia.',
        security,
        params: classGroupParamsJsonSchema,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['active'],
          properties: { active: { type: 'boolean' } },
        },
        response: {
          200: {
            type: 'object',
            properties: { classGroup: classGroupSchema },
            required: ['classGroup'],
          },
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
      preHandler: [
        authenticate,
        requireGymRole('OWNER', 'ADMIN'),
      ],
    },
    async (request, reply) => {
      const params =
        classGroupParamsSchema.parse(
          request.params,
        )

      const body =
        updateClassGroupStatusBodySchema.parse(
          request.body,
        )

      const previousClassGroup =
        await getClassGroupById(
          params.gymId,
          params.classGroupId,
        )

      const classGroup =
        await updateClassGroupStatus(
          params.gymId,
          params.classGroupId,
          body,
        )

      await createAuditLog({
        gymId: params.gymId,
        userId: request.user!.id,
        action: body.active
          ? 'ACTIVATE'
          : 'DEACTIVATE',
        entity: 'CLASS_GROUP',
        entityId: classGroup.id,
        oldValues: previousClassGroup,
        newValues: classGroup,
        metadata: {
          source: 'class-groups',
          previousStatus:
            previousClassGroup.active,
          newStatus: classGroup.active,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      })

      return reply.send({
        classGroup,
      })
    },
  )
}
