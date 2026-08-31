import {
  prisma,
} from '../../database/prisma.js'

import {
  AppError,
} from '../../http/app-error.js'

import {
  createAuditLog,
} from '../audit/audit.service.js'

import {
  hashPassword,
} from '../auth/password.js'

import type {
  GymRole,
} from './gyms.types.js'

interface ResetGymMemberPasswordInput {
  gymId: string
  memberId: string
  actorUserId: string
  actorRole: GymRole
  password: string
}

interface GymMemberPasswordAuditContext {
  userId: string
  ipAddress?: string | null
  userAgent?: string | null
}

function validateAdministrativePasswordReset(
  actorUserId: string,
  actorRole: GymRole,
  targetUserId: string,
  targetRole: GymRole,
) {
  if (
    actorUserId ===
    targetUserId
  ) {
    throw new AppError(
      'MEMBER_SELF_PASSWORD_RESET_NOT_ALLOWED',
      409,
      'Você não pode redefinir a própria senha por este fluxo administrativo.',
    )
  }

  if (
    targetRole ===
    'OWNER'
  ) {
    throw new AppError(
      'OWNER_PASSWORD_RESET_NOT_ALLOWED',
      403,
      'A senha do proprietário não pode ser redefinida por esta operação.',
    )
  }

  if (
    actorRole ===
      'ADMIN' &&
    targetRole ===
      'ADMIN'
  ) {
    throw new AppError(
      'ADMIN_MANAGEMENT_NOT_ALLOWED',
      403,
      'Administradores não podem redefinir a senha de outros administradores.',
    )
  }

  if (
    actorRole !==
      'OWNER' &&
    actorRole !==
      'ADMIN'
  ) {
    throw new AppError(
      'GYM_ROLE_NOT_ALLOWED',
      403,
      'Seu perfil não possui permissão para redefinir senhas.',
    )
  }
}

export async function resetGymMemberPassword(
  input: ResetGymMemberPasswordInput,
  auditContext: GymMemberPasswordAuditContext,
) {
  const membership =
    await prisma.gymMembership.findFirst({
      where: {
        id:
          input.memberId,

        gymId:
          input.gymId,
      },

      select: {
        id: true,
        userId: true,
        role: true,
        active: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            active: true,
          },
        },
      },
    })

  if (!membership) {
    throw new AppError(
      'GYM_MEMBER_NOT_FOUND',
      404,
      'Membro não encontrado.',
    )
  }

  if (
    !membership.active
  ) {
    throw new AppError(
      'GYM_MEMBER_INACTIVE',
      409,
      'Não é possível redefinir a senha de um vínculo inativo.',
    )
  }

  if (
    !membership.user.active
  ) {
    throw new AppError(
      'USER_INACTIVE',
      409,
      'Não é possível redefinir a senha de um usuário inativo.',
    )
  }

  validateAdministrativePasswordReset(
    input.actorUserId,
    input.actorRole,
    membership.userId,
    membership.role,
  )

  const passwordHash =
    await hashPassword(
      input.password,
    )

  const now =
    new Date()

  await prisma.$transaction(
    async (
      transaction,
    ) => {
      await transaction.user.update({
        where: {
          id:
            membership.userId,
        },

        data: {
          passwordHash,
        },
      })

      await transaction.userSession.updateMany({
        where: {
          userId:
            membership.userId,

          revokedAt:
            null,
        },

        data: {
          revokedAt:
            now,
        },
      })

      await transaction.passwordReset.updateMany({
        where: {
          userId:
            membership.userId,

          usedAt:
            null,
        },

        data: {
          usedAt:
            now,
        },
      })
    },
  )

  await createAuditLog({
    gymId:
      input.gymId,

    userId:
      auditContext.userId,

    action:
      'PASSWORD_RESET_REQUESTED_BY_ADMIN',

    entity:
      'USER',

    entityId:
      membership.userId,

    metadata: {
      source:
        'gym-member-password-reset',

      membershipId:
        membership.id,

      targetUserId:
        membership.userId,

      targetUserName:
        membership.user.name,

      targetUserEmail:
        membership.user.email,

      targetRole:
        membership.role,

      actorRole:
        input.actorRole,

      sessionsRevoked:
        true,
    },

    ipAddress:
      auditContext.ipAddress,

    userAgent:
      auditContext.userAgent,
  })

  return {
    user: {
      id:
        membership.user.id,

      name:
        membership.user.name,

      email:
        membership.user.email,
    },
  }
}