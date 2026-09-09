import type { FastifyInstance } from 'fastify'

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

      await deleteClassGroupProfessor(
        params.gymId,
        params.classGroupId,
        params.professorId,
      )

      return reply.status(204).send()
    },
  )
}