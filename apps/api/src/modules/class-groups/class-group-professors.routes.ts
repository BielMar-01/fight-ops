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