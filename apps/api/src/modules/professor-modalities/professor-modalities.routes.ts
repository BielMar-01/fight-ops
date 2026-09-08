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

export async function professorModalityRoutes(app: FastifyInstance) {
  /*
   * =========================================================
   * LIST
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/professors/:professorId/modalities',
    {
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