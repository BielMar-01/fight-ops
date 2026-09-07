import type { FastifyInstance } from 'fastify'

import { createAuditLog } from '../audit/audit.service.js'

import { authenticate } from '../auth/authenticate.js'

import { requireGymRole } from '../gyms/gym-access.js'

import {
  createModalityBodySchema,
  gymParamsSchema,
  listModalitiesQuerySchema,
  modalityParamsSchema,
  updateModalityBodySchema,
  updateModalityStatusBodySchema,
} from './modalities.schemas.js'

import {
  createModality,
  getModalityById,
  listModalities,
  updateModality,
  updateModalityStatus,
} from './modalities.service.js'

export async function modalityRoutes(app: FastifyInstance) {
  /*
   * =========================================================
   * LIST
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/modalities',
    {
      preHandler: [authenticate, requireGymRole('OWNER', 'ADMIN', 'RECEPTIONIST', 'PROFESSOR')],
    },
    async (request, reply) => {
      const params = gymParamsSchema.parse(request.params)

      const query = listModalitiesQuerySchema.parse(request.query)

      const result = await listModalities(params.gymId, query)

      return reply.send(result)
    },
  )

  /*
   * =========================================================
   * DETAILS
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/modalities/:modalityId',
    {
      preHandler: [authenticate, requireGymRole('OWNER', 'ADMIN', 'RECEPTIONIST', 'PROFESSOR')],
    },
    async (request, reply) => {
      const params = modalityParamsSchema.parse(request.params)

      const modality = await getModalityById(params.gymId, params.modalityId)

      return reply.send({
        modality,
      })
    },
  )

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  app.post(
    '/gyms/:gymId/modalities',
    {
      preHandler: [authenticate, requireGymRole('OWNER', 'ADMIN')],
    },
    async (request, reply) => {
      const params = gymParamsSchema.parse(request.params)

      const body = createModalityBodySchema.parse(request.body)

      const modality = await createModality(params.gymId, body)

      await createAuditLog({
        gymId: params.gymId,

        userId: request.user!.id,

        action: 'CREATE',

        entity: 'MODALITY',

        entityId: modality.id,

        newValues: modality,

        metadata: {
          source: 'modalities',
        },

        ipAddress: request.ip,

        userAgent: request.headers['user-agent'],
      })

      return reply.status(201).send({
        modality,
      })
    },
  )

  /*
   * =========================================================
   * UPDATE
   * =========================================================
   */

  app.put(
    '/gyms/:gymId/modalities/:modalityId',
    {
      preHandler: [authenticate, requireGymRole('OWNER', 'ADMIN')],
    },
    async (request, reply) => {
      const params = modalityParamsSchema.parse(request.params)

      const body = updateModalityBodySchema.parse(request.body)

      const previousModality = await getModalityById(params.gymId, params.modalityId)

      const modality = await updateModality(params.gymId, params.modalityId, body)

      await createAuditLog({
        gymId: params.gymId,

        userId: request.user!.id,

        action: 'UPDATE',

        entity: 'MODALITY',

        entityId: modality.id,

        oldValues: previousModality,

        newValues: modality,

        metadata: {
          source: 'modalities',
        },

        ipAddress: request.ip,

        userAgent: request.headers['user-agent'],
      })

      return reply.send({
        modality,
      })
    },
  )

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  app.patch(
    '/gyms/:gymId/modalities/:modalityId/status',
    {
      preHandler: [authenticate, requireGymRole('OWNER', 'ADMIN')],
    },
    async (request, reply) => {
      const params = modalityParamsSchema.parse(request.params)

      const body = updateModalityStatusBodySchema.parse(request.body)

      const previousModality = await getModalityById(params.gymId, params.modalityId)

      const modality = await updateModalityStatus(params.gymId, params.modalityId, body)

      await createAuditLog({
        gymId: params.gymId,

        userId: request.user!.id,

        action: 'STATUS_CHANGE',

        entity: 'MODALITY',

        entityId: modality.id,

        oldValues: {
          active: previousModality.active,
        },

        newValues: {
          active: modality.active,
        },

        metadata: {
          source: 'modalities',
        },

        ipAddress: request.ip,

        userAgent: request.headers['user-agent'],
      })

      return reply.send({
        modality,
      })
    },
  )
}
