import type {
  FastifyInstance,
} from 'fastify'

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
} from './professors.schemas.js'

import {
  createProfessor,
  getProfessorById,
  listProfessors,
} from './professors.service.js'

export async function professorRoutes(
  app: FastifyInstance,
) {
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

      return reply
        .status(201)
        .send({
          professor,
        })
    },
  )
}