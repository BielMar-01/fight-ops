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
  createGraduationBodySchema,
  graduationParamsSchema,
  listGraduationsQuerySchema,
  modalityGraduationsParamsSchema,
  updateGraduationBodySchema,
  updateGraduationStatusBodySchema,
} from './graduations.schemas.js'

import {
  createGraduation,
  getGraduationById,
  listGraduations,
  updateGraduation,
  updateGraduationStatus,
} from './graduations.service.js'

export async function graduationRoutes(
  app: FastifyInstance,
) {
  /*
   * =========================================================
   * LIST
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/modalities/:modalityId/graduations',
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
        modalityGraduationsParamsSchema.parse(
          request.params,
        )

      const query =
        listGraduationsQuerySchema.parse(
          request.query,
        )

      const result =
        await listGraduations(
          params.gymId,
          params.modalityId,
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
    '/gyms/:gymId/modalities/:modalityId/graduations/:graduationId',
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
        graduationParamsSchema.parse(
          request.params,
        )

      const graduation =
        await getGraduationById(
          params.gymId,
          params.modalityId,
          params.graduationId,
        )

      return reply.send({
        graduation,
      })
    },
  )

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  app.post(
    '/gyms/:gymId/modalities/:modalityId/graduations',
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
        modalityGraduationsParamsSchema.parse(
          request.params,
        )

      const body =
        createGraduationBodySchema.parse(
          request.body,
        )

      const graduation =
        await createGraduation(
          params.gymId,
          params.modalityId,
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
          'GRADUATION',

        entityId:
          graduation.id,

        newValues:
          graduation,

        metadata: {
          source:
            'graduations',

          modalityId:
            params.modalityId,
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
          graduation,
        })
    },
  )

  /*
   * =========================================================
   * UPDATE
   * =========================================================
   */

  app.put(
    '/gyms/:gymId/modalities/:modalityId/graduations/:graduationId',
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
        graduationParamsSchema.parse(
          request.params,
        )

      const body =
        updateGraduationBodySchema.parse(
          request.body,
        )

      const previousGraduation =
        await getGraduationById(
          params.gymId,
          params.modalityId,
          params.graduationId,
        )

      const graduation =
        await updateGraduation(
          params.gymId,
          params.modalityId,
          params.graduationId,
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
          'GRADUATION',

        entityId:
          graduation.id,

        oldValues:
          previousGraduation,

        newValues:
          graduation,

        metadata: {
          source:
            'graduations',

          modalityId:
            params.modalityId,
        },

        ipAddress:
          request.ip,

        userAgent:
          request.headers[
            'user-agent'
          ],
      })

      return reply.send({
        graduation,
      })
    },
  )

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  app.patch(
    '/gyms/:gymId/modalities/:modalityId/graduations/:graduationId/status',
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
        graduationParamsSchema.parse(
          request.params,
        )

      const body =
        updateGraduationStatusBodySchema.parse(
          request.body,
        )

      const previousGraduation =
        await getGraduationById(
          params.gymId,
          params.modalityId,
          params.graduationId,
        )

      const graduation =
        await updateGraduationStatus(
          params.gymId,
          params.modalityId,
          params.graduationId,
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
          'GRADUATION',

        entityId:
          graduation.id,

        oldValues: {
          active:
            previousGraduation.active,
        },

        newValues: {
          active:
            graduation.active,
        },

        metadata: {
          source:
            'graduations',

          modalityId:
            params.modalityId,
        },

        ipAddress:
          request.ip,

        userAgent:
          request.headers[
            'user-agent'
          ],
      })

      return reply.send({
        graduation,
      })
    },
  )
}