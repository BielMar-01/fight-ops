import type { FastifyInstance } from 'fastify'

import { createAuditLog } from '../audit/audit.service.js'

import { authenticate } from '../auth/authenticate.js'

import { requireGymRole } from '../gyms/gym-access.js'

import {
  classGroupProfessorParamsSchema,
  classGroupProfessorsParamsSchema,
  createClassGroupProfessorBodySchema,
} from './class-groups.schemas.js'

import {
  createClassGroupProfessor,
  deleteClassGroupProfessor,
  listClassGroupProfessors,
} from './class-group-professors.service.js'

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

const classGroupProfessorsParamsJsonSchema = {
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

const classGroupProfessorParamsJsonSchema = {
  type: 'object',
  required: ['gymId', 'classGroupId', 'professorId'],
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
    professorId: {
      type: 'string',
      format: 'uuid',
      description: 'Identificador do professor.',
    },
  },
}

const nullableStringSchema = {
  anyOf: [{ type: 'string' }, { type: 'null' }],
}

const classGroupProfessorSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    gymId: { type: 'string', format: 'uuid' },
    classGroupId: { type: 'string', format: 'uuid' },
    professorId: { type: 'string', format: 'uuid' },
    role: {
      type: 'string',
      enum: ['PRIMARY', 'ASSISTANT'],
    },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    professor: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        email: nullableStringSchema,
        phone: nullableStringSchema,
        active: { type: 'boolean' },
      },
      required: ['id', 'name', 'email', 'phone', 'active'],
    },
  },
  required: [
    'id',
    'gymId',
    'classGroupId',
    'professorId',
    'role',
    'createdAt',
    'updatedAt',
    'professor',
  ],
}

export async function classGroupProfessorRoutes(
  app: FastifyInstance,
) {
  /*
   * =========================================================
   * LIST
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/class-groups/:classGroupId/professors',
    {
      schema: {
        tags: ['Class Group Professors'],
        summary: 'Listar professores da turma',
        description: 'Lista os professores vinculados à turma informada.',
        security,
        params: classGroupProfessorsParamsJsonSchema,
        response: {
          200: {
            type: 'object',
            properties: {
              professors: {
                type: 'array',
                items: classGroupProfessorSchema,
              },
            },
            required: ['professors'],
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
        classGroupProfessorsParamsSchema.parse(
          request.params,
        )

      const professors =
        await listClassGroupProfessors(
          params.gymId,
          params.classGroupId,
        )

      return reply.send({
        professors,
      })
    },
  )

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  app.post(
    '/gyms/:gymId/class-groups/:classGroupId/professors',
    {
      schema: {
        tags: ['Class Group Professors'],
        summary: 'Vincular professor à turma',
        description: 'Vincula um professor habilitado na modalidade como principal ou auxiliar da turma.',
        security,
        params: classGroupProfessorsParamsJsonSchema,
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['professorId', 'role'],
          properties: {
            professorId: { type: 'string', format: 'uuid' },
            role: {
              type: 'string',
              enum: ['PRIMARY', 'ASSISTANT'],
            },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              classGroupProfessor: classGroupProfessorSchema,
            },
            required: ['classGroupProfessor'],
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
        classGroupProfessorsParamsSchema.parse(
          request.params,
        )

      const body =
        createClassGroupProfessorBodySchema.parse(
          request.body,
        )

      const classGroupProfessor =
        await createClassGroupProfessor(
          params.gymId,
          params.classGroupId,
          body,
        )

      await createAuditLog({
        gymId: params.gymId,
        userId: request.user!.id,
        action: 'CREATE',
        entity: 'CLASS_GROUP_PROFESSOR',
        entityId: classGroupProfessor.id,
        newValues: classGroupProfessor,
        metadata: {
          source: 'class-group-professors',
          classGroupId: params.classGroupId,
          professorId: body.professorId,
          role: body.role,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      })

      return reply.status(201).send({
        classGroupProfessor,
      })
    },
  )

  /*
   * =========================================================
   * DELETE
   * =========================================================
   */

  app.delete(
    '/gyms/:gymId/class-groups/:classGroupId/professors/:professorId',
    {
      schema: {
        tags: ['Class Group Professors'],
        summary: 'Remover professor da turma',
        description: 'Remove o vínculo entre o professor e a turma informada.',
        security,
        params: classGroupProfessorParamsJsonSchema,
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
      preHandler: [
        authenticate,
        requireGymRole('OWNER', 'ADMIN'),
      ],
    },
    async (request, reply) => {
      const params =
        classGroupProfessorParamsSchema.parse(
          request.params,
        )

      const deletedClassGroupProfessor =
        await deleteClassGroupProfessor(
          params.gymId,
          params.classGroupId,
          params.professorId,
        )

      await createAuditLog({
        gymId: params.gymId,
        userId: request.user!.id,
        action: 'DELETE',
        entity: 'CLASS_GROUP_PROFESSOR',
        entityId:
          deletedClassGroupProfessor.id,
        oldValues:
          deletedClassGroupProfessor,
        metadata: {
          source: 'class-group-professors',
          classGroupId: params.classGroupId,
          professorId: params.professorId,
          role:
            deletedClassGroupProfessor.role,
        },
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      })

      return reply.status(204).send()
    },
  )
}
