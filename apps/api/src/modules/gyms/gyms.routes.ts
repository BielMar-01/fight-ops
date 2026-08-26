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
  requireGymRole,
} from './gym-access.js'

import {
  addGymMemberBodySchema,
  createGymBodySchema,
  gymMemberParamsSchema,
  gymParamsSchema,
  updateGymMemberRoleBodySchema,
  updateGymMemberStatusBodySchema,
} from './gyms.schemas.js'

import {
  addGymMember,
  createGym,
  getUserGymById,
  listGymMembers,
  listUserGyms,
  updateGymMemberRole,
  updateGymMemberStatus,
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

  app.get(
    '/gyms/:gymId/members',
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
        gymParamsSchema.parse(
          request.params,
        )

      const members =
        await listGymMembers(
          params.gymId,
        )

      return reply.send({
        members,
      })
    },
  )

  app.post(
    '/gyms/:gymId/members',
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
        gymParamsSchema.parse(
          request.params,
        )

      const body =
        addGymMemberBodySchema.parse(
          request.body,
        )

      if (!request.gymMembership) {
        throw new AppError(
          'GYM_MEMBERSHIP_REQUIRED',
          403,
          'Vínculo com a academia não encontrado.',
        )
      }

      const member =
        await addGymMember(
          params.gymId,
          request.gymMembership.role,
          body,
        )

      return reply
        .status(201)
        .send({
          member,
        })
    },
  )

  app.patch(
    '/gyms/:gymId/members/:memberId/role',
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
      if (
        !request.user ||
        !request.gymMembership
      ) {
        throw new AppError(
          'GYM_MEMBERSHIP_REQUIRED',
          403,
          'Vínculo com a academia não encontrado.',
        )
      }

      const params =
        gymMemberParamsSchema.parse(
          request.params,
        )

      const body =
        updateGymMemberRoleBodySchema.parse(
          request.body,
        )

      const member =
        await updateGymMemberRole(
          params.gymId,
          params.memberId,
          request.user.id,
          request.gymMembership.role,
          body,
        )

      return reply.send({
        member,
      })
    },
  )

  app.patch(
    '/gyms/:gymId/members/:memberId/status',
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
      if (
        !request.user ||
        !request.gymMembership
      ) {
        throw new AppError(
          'GYM_MEMBERSHIP_REQUIRED',
          403,
          'Vínculo com a academia não encontrado.',
        )
      }

      const params =
        gymMemberParamsSchema.parse(
          request.params,
        )

      const body =
        updateGymMemberStatusBodySchema.parse(
          request.body,
        )

      const member =
        await updateGymMemberStatus(
          params.gymId,
          params.memberId,
          request.user.id,
          request.gymMembership.role,
          body,
        )

      return reply.send({
        member,
      })
    },
  )
}