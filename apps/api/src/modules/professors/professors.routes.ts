import type {
  FastifyInstance,
} from 'fastify'

import {
  createAuditLog,
} from '../audit/audit.service.js'

import {
  authenticate,
} from '../auth/authenticate.js'

import {
  requireGymRole,
} from '../gyms/gym-access.js'

import {
  createProfessorBodySchema,
  listProfessorsQuerySchema,
  professorListParamsSchema,
  professorParamsSchema,
  updateProfessorBodySchema,
  updateProfessorStatusBodySchema,
} from './professors.schemas.js'

import {
  createProfessor,
  getProfessorById,
  listProfessors,
  updateProfessor,
  updateProfessorStatus,
} from './professors.service.js'

export async function professorRoutes(
  app: FastifyInstance,
) {
  /*
   * =========================================================
   * LIST
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/professors',
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
    async (
      request,
      reply,
    ) => {
      const params =
        professorListParamsSchema.parse(
          request.params,
        )

      const query =
        listProfessorsQuerySchema.parse(
          request.query,
        )

      const result =
        await listProfessors(
          params.gymId,
          query,
        )

      return reply.send(
        result,
      )
    },
  )

  /*
   * =========================================================
   * DETAILS
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/professors/:professorId',
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
    async (
      request,
      reply,
    ) => {
      const params =
        professorParamsSchema.parse(
          request.params,
        )

      const professor =
        await getProfessorById(
          params.gymId,
          params.professorId,
        )

      return reply.send({
        professor,
      })
    },
  )

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  app.post(
    '/gyms/:gymId/professors',
    {
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
        professorListParamsSchema.parse(
          request.params,
        )

      const body =
        createProfessorBodySchema.parse(
          request.body,
        )

      const professor =
        await createProfessor(
          params.gymId,
          body,
        )

      await createAuditLog({
        gymId:
          params.gymId,

        userId:
          request.user!.id,

        action:
          'CREATE',

        entity:
          'PROFESSOR',

        entityId:
          professor.id,

        newValues:
          professor,

        metadata: {
          source:
            'professors',
        },

        ipAddress:
          request.ip,

        userAgent:
          request.headers[
            'user-agent'
          ],
      })

      return reply
        .status(
          201,
        )
        .send({
          professor,
        })
    },
  )

  /*
   * =========================================================
   * UPDATE
   * =========================================================
   */

  app.put(
    '/gyms/:gymId/professors/:professorId',
    {
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
        professorParamsSchema.parse(
          request.params,
        )

      const body =
        updateProfessorBodySchema.parse(
          request.body,
        )

      const previousProfessor =
        await getProfessorById(
          params.gymId,
          params.professorId,
        )

      const professor =
        await updateProfessor(
          params.gymId,
          params.professorId,
          body,
        )

      await createAuditLog({
        gymId:
          params.gymId,

        userId:
          request.user!.id,

        action:
          'UPDATE',

        entity:
          'PROFESSOR',

        entityId:
          professor.id,

        oldValues:
          previousProfessor,

        newValues:
          professor,

        metadata: {
          source:
            'professors',
        },

        ipAddress:
          request.ip,

        userAgent:
          request.headers[
            'user-agent'
          ],
      })

      return reply.send({
        professor,
      })
    },
  )

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  app.patch(
    '/gyms/:gymId/professors/:professorId/status',
    {
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
        professorParamsSchema.parse(
          request.params,
        )

      const body =
        updateProfessorStatusBodySchema.parse(
          request.body,
        )

      const previousProfessor =
        await getProfessorById(
          params.gymId,
          params.professorId,
        )

      const professor =
        await updateProfessorStatus(
          params.gymId,
          params.professorId,
          body,
        )

      await createAuditLog({
        gymId:
          params.gymId,

        userId:
          request.user!.id,

        action:
          'STATUS_CHANGE',

        entity:
          'PROFESSOR',

        entityId:
          professor.id,

        oldValues: {
          active:
            previousProfessor.active,
        },

        newValues: {
          active:
            professor.active,
        },

        metadata: {
          source:
            'professors',
        },

        ipAddress:
          request.ip,

        userAgent:
          request.headers[
            'user-agent'
          ],
      })

      return reply.send({
        professor,
      })
    },
  )
}