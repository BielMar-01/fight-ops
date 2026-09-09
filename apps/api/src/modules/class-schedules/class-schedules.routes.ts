import type { FastifyInstance } from 'fastify'

import { authenticate } from '../auth/authenticate.js'

import { requireGymRole } from '../gyms/gym-access.js'

import {
  classGroupSchedulesParamsSchema,
  classScheduleListParamsSchema,
  classScheduleParamsSchema,
  createClassScheduleBodySchema,
  listClassSchedulesQuerySchema,
  updateClassScheduleBodySchema,
  updateClassScheduleStatusBodySchema,
} from './class-schedules.schemas.js'

import {
  createClassSchedule,
  getClassScheduleById,
  listClassGroupSchedules,
  listClassSchedules,
  updateClassSchedule,
  updateClassScheduleStatus,
} from './class-schedules.service.js'

export async function classScheduleRoutes(
  app: FastifyInstance,
) {
  /*
   * =========================================================
   * LIST ALL
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/class-schedules',
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
        classScheduleListParamsSchema.parse(
          request.params,
        )

      const query =
        listClassSchedulesQuerySchema.parse(
          request.query,
        )

      const result = await listClassSchedules(
        params.gymId,
        query,
      )

      return reply.send(result)
    },
  )

  /*
   * =========================================================
   * LIST BY CLASS GROUP
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/class-groups/:classGroupId/schedules',
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
        classGroupSchedulesParamsSchema.parse(
          request.params,
        )

      const classSchedules =
        await listClassGroupSchedules(
          params.gymId,
          params.classGroupId,
        )

      return reply.send({
        classSchedules,
      })
    },
  )

  /*
   * =========================================================
   * DETAILS
   * =========================================================
   */

  app.get(
    '/gyms/:gymId/class-schedules/:classScheduleId',
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
        classScheduleParamsSchema.parse(
          request.params,
        )

      const classSchedule =
        await getClassScheduleById(
          params.gymId,
          params.classScheduleId,
        )

      return reply.send({
        classSchedule,
      })
    },
  )

  /*
   * =========================================================
   * CREATE
   * =========================================================
   */

  app.post(
    '/gyms/:gymId/class-schedules',
    {
      preHandler: [
        authenticate,
        requireGymRole(
          'OWNER',
          'ADMIN',
        ),
      ],
    },
    async (request, reply) => {
      const params =
        classScheduleListParamsSchema.parse(
          request.params,
        )

      const body =
        createClassScheduleBodySchema.parse(
          request.body,
        )

      const classSchedule =
        await createClassSchedule(
          params.gymId,
          body,
        )

      return reply.status(201).send({
        classSchedule,
      })
    },
  )

  /*
   * =========================================================
   * UPDATE
   * =========================================================
   */

  app.put(
    '/gyms/:gymId/class-schedules/:classScheduleId',
    {
      preHandler: [
        authenticate,
        requireGymRole(
          'OWNER',
          'ADMIN',
        ),
      ],
    },
    async (request, reply) => {
      const params =
        classScheduleParamsSchema.parse(
          request.params,
        )

      const body =
        updateClassScheduleBodySchema.parse(
          request.body,
        )

      const classSchedule =
        await updateClassSchedule(
          params.gymId,
          params.classScheduleId,
          body,
        )

      return reply.send({
        classSchedule,
      })
    },
  )

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  app.patch(
    '/gyms/:gymId/class-schedules/:classScheduleId/status',
    {
      preHandler: [
        authenticate,
        requireGymRole(
          'OWNER',
          'ADMIN',
        ),
      ],
    },
    async (request, reply) => {
      const params =
        classScheduleParamsSchema.parse(
          request.params,
        )

      const body =
        updateClassScheduleStatusBodySchema.parse(
          request.body,
        )

      const classSchedule =
        await updateClassScheduleStatus(
          params.gymId,
          params.classScheduleId,
          body,
        )

      return reply.send({
        classSchedule,
      })
    },
  )
}