import type { FastifyInstance } from 'fastify'

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

      return reply.status(201).send({
        professorModality,
      })
    },
  )

  app.delete(
    '/gyms/:gymId/professors/:professorId/modalities/:modalityId',
    {
      preHandler: [authenticate, requireGymRole('OWNER', 'ADMIN')],
    },
    async (request, reply) => {
      const params = professorModalityParamsSchema.parse(request.params)

      await deleteProfessorModality(
        params.gymId,
        params.professorId,
        params.modalityId,
      )

      return reply.status(204).send()
    },
  )
}