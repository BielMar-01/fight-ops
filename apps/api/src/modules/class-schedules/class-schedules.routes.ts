import type { FastifyInstance } from 'fastify'

import { createAuditLog } from '../audit/audit.service.js'

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

      await createAuditLog({
        gymId: params.gymId,
        userId: request.user!.id,
        action: 'CREATE',
        entity: 'CLASS_SCHEDULE',
        entityId: classSchedule.id,
        newValues: classSchedule,

        metadata: {
          source: 'class-schedules',
          classGroupId:
            classSchedule.classGroupId,
          weekday: classSchedule.weekday,
          startTime: classSchedule.startTime,
          endTime: classSchedule.endTime,
          room: classSchedule.room,
        },

        ipAddress: request.ip,
        userAgent:
          request.headers['user-agent'],
      })

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

      const previousClassSchedule =
        await getClassScheduleById(
          params.gymId,
          params.classScheduleId,
        )

      const classSchedule =
        await updateClassSchedule(
          params.gymId,
          params.classScheduleId,
          body,
        )

      await createAuditLog({
        gymId: params.gymId,
        userId: request.user!.id,
        action: 'UPDATE',
        entity: 'CLASS_SCHEDULE',
        entityId: classSchedule.id,
        oldValues: previousClassSchedule,
        newValues: classSchedule,

        metadata: {
          source: 'class-schedules',

          previousClassGroupId:
            previousClassSchedule.classGroupId,

          newClassGroupId:
            classSchedule.classGroupId,

          previousWeekday:
            previousClassSchedule.weekday,

          newWeekday: classSchedule.weekday,

          previousStartTime:
            previousClassSchedule.startTime,

          newStartTime:
            classSchedule.startTime,

          previousEndTime:
            previousClassSchedule.endTime,

          newEndTime:
            classSchedule.endTime,
        },

        ipAddress: request.ip,
        userAgent:
          request.headers['user-agent'],
      })

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

      const previousClassSchedule =
        await getClassScheduleById(
          params.gymId,
          params.classScheduleId,
        )

      const classSchedule =
        await updateClassScheduleStatus(
          params.gymId,
          params.classScheduleId,
          body,
        )

      await createAuditLog({
        gymId: params.gymId,
        userId: request.user!.id,

        action: body.active
          ? 'ACTIVATE'
          : 'DEACTIVATE',

        entity: 'CLASS_SCHEDULE',
        entityId: classSchedule.id,
        oldValues: previousClassSchedule,
        newValues: classSchedule,

        metadata: {
          source: 'class-schedules',
          classGroupId:
            classSchedule.classGroupId,

          previousStatus:
            previousClassSchedule.active,

          newStatus: classSchedule.active,
        },

        ipAddress: request.ip,
        userAgent:
          request.headers['user-agent'],
      })

      return reply.send({
        classSchedule,
      })
    },
  )
}