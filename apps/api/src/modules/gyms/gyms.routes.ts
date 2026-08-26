import type {
  FastifyInstance,
} from 'fastify'

import {
  AppError,
} from '../../http/app-error.js'

import {
  authenticate,
} from '../auth/authenticate.js'

import {
  createGymBodySchema,
  gymParamsSchema,
} from './gyms.schemas.js'

import {
  createGym,
  getUserGymById,
  listUserGyms,
} from './gyms.service.js'

export async function gymRoutes(
  app: FastifyInstance,
) {
  app.post(
    '/gyms',
    {
      preHandler:
        authenticate,
    },
    async (
      request,
      reply,
    ) => {
      if (!request.user) {
        throw new AppError(
          'UNAUTHENTICATED',
          401,
          'Usuário não autenticado.',
        )
      }

      const body =
        createGymBodySchema.parse(
          request.body,
        )

      const gym =
        await createGym(
          request.user.id,
          body,
        )

      return reply
        .status(201)
        .send({
          gym: {
            ...gym,

            role:
              'OWNER',
          },
        })
    },
  )

  app.get(
    '/gyms',
    {
      preHandler:
        authenticate,
    },
    async (
      request,
      reply,
    ) => {
      if (!request.user) {
        throw new AppError(
          'UNAUTHENTICATED',
          401,
          'Usuário não autenticado.',
        )
      }

      const gyms =
        await listUserGyms(
          request.user.id,
        )

      return reply.send({
        gyms,
      })
    },
  )

  app.get(
    '/gyms/:gymId',
    {
      preHandler:
        authenticate,
    },
    async (
      request,
      reply,
    ) => {
      if (!request.user) {
        throw new AppError(
          'UNAUTHENTICATED',
          401,
          'Usuário não autenticado.',
        )
      }

      const params =
        gymParamsSchema.parse(
          request.params,
        )

      const gym =
        await getUserGymById(
          request.user.id,
          params.gymId,
        )

      return reply.send({
        gym,
      })
    },
  )
}