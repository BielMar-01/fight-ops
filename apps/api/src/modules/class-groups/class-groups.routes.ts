import type { FastifyInstance } from 'fastify'

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
} from '../class-groups/class-groups.service.js'

export async function classGroupRoutes(app: FastifyInstance) {
  /*
   * =========================================================
   * LIST
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/class-groups',
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
      const params = classGroupListParamsSchema.parse(
        request.params,
      )

      const query = listClassGroupsQuerySchema.parse(
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
      const params = classGroupParamsSchema.parse(
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
      preHandler: [
        authenticate,
        requireGymRole('OWNER', 'ADMIN'),
      ],
    },
    async (request, reply) => {
      const params = classGroupListParamsSchema.parse(
        request.params,
      )

      const body = createClassGroupBodySchema.parse(
        request.body,
      )

      const classGroup = await createClassGroup(
        params.gymId,
        body,
      )

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
      preHandler: [
        authenticate,
        requireGymRole('OWNER', 'ADMIN'),
      ],
    },
    async (request, reply) => {
      const params = classGroupParamsSchema.parse(
        request.params,
      )

      const body = updateClassGroupBodySchema.parse(
        request.body,
      )

      const classGroup = await updateClassGroup(
        params.gymId,
        params.classGroupId,
        body,
      )

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
      preHandler: [
        authenticate,
        requireGymRole('OWNER', 'ADMIN'),
      ],
    },
    async (request, reply) => {
      const params = classGroupParamsSchema.parse(
        request.params,
      )

      const body = updateClassGroupStatusBodySchema.parse(
        request.body,
      )

      const classGroup = await updateClassGroupStatus(
        params.gymId,
        params.classGroupId,
        body,
      )

      return reply.send({
        classGroup,
      })
    },
  )
}