import type {
  FastifyReply,
  FastifyRequest,
} from 'fastify'

import {
  prisma,
} from '../../database/prisma.js'

import {
  AppError,
} from '../../http/app-error.js'

import type {
  GymRole,
} from './gyms.types.js'

declare module 'fastify' {
  interface FastifyRequest {
    gymMembership?: {
      id: string
      gymId: string
      userId: string
      role: GymRole
      active: boolean
    }
  }
}

interface GymParams {
  gymId?: string
}

export function requireGymRole(
  ...allowedRoles: GymRole[]
) {
  return async function gymRoleGuard(
    request: FastifyRequest,
    _reply: FastifyReply,
  ) {
    if (!request.user) {
      throw new AppError(
        'UNAUTHENTICATED',
        401,
        'Usuário não autenticado.',
      )
    }

    const params =
      request.params as GymParams

    const gymId =
      params.gymId

    if (!gymId) {
      throw new AppError(
        'GYM_ID_REQUIRED',
        400,
        'Identificador da academia não informado.',
      )
    }

    const membership =
      await prisma.gymMembership.findUnique({
        where: {
          userId_gymId: {
            userId:
              request.user.id,

            gymId,
          },
        },

        select: {
          id: true,
          gymId: true,
          userId: true,
          role: true,
          active: true,

          gym: {
            select: {
              active: true,
            },
          },
        },
      })

    if (
      !membership ||
      !membership.active ||
      !membership.gym.active
    ) {
      throw new AppError(
        'GYM_NOT_FOUND',
        404,
        'Academia não encontrada.',
      )
    }

    if (
      !allowedRoles.includes(
        membership.role,
      )
    ) {
      throw new AppError(
        'GYM_ACCESS_DENIED',
        403,
        'Você não possui permissão para realizar esta ação.',
      )
    }

    request.gymMembership = {
      id:
        membership.id,

      gymId:
        membership.gymId,

      userId:
        membership.userId,

      role:
        membership.role,

      active:
        membership.active,
    }
  }
}