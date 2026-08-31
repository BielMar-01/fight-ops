import {
  prisma,
} from '../../database/prisma.js'

import {
  AppError,
} from '../../http/app-error.js'

import {
  createAuditLog,
} from '../audit/audit.service.js'

import type {
  AddGymMemberInput,
  CreateGymInput,
  GymRole,
  UpdateGymMemberRoleInput,
  UpdateGymMemberStatusInput,
} from './gyms.types.js'

interface GymAuditContext {
  userId: string
  ipAddress?: string | null
  userAgent?: string | null
}

function normalizeSlugValue(
  value: string,
) {
  return value
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    )
}

async function generateUniqueSlug(
  name: string,
) {
  const baseSlug =
    normalizeSlugValue(
      name,
    ) || 'academia'

  let slug =
    baseSlug

  let counter = 2

  while (
    await prisma.gym.findUnique({
      where: {
        slug,
      },

      select: {
        id: true,
      },
    })
  ) {
    slug =
      `${baseSlug}-${counter}`

    counter += 1
  }

  return slug
}

export async function createGym(
  userId: string,
  input: CreateGymInput,
) {
  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        active: true,
      },
    })

  if (
    !user ||
    !user.active
  ) {
    throw new AppError(
      'USER_NOT_AVAILABLE',
      403,
      'Usuário não está disponível para criar uma academia.',
    )
  }

  const slug =
    await generateUniqueSlug(
      input.name,
    )

  const gym =
    await prisma.$transaction(
      async (transaction) => {
        const createdGym =
          await transaction.gym.create({
            data: {
              name:
                input.name.trim(),

              slug,

              description:
                input.description?.trim() ||
                null,

              phone:
                input.phone?.trim() ||
                null,

              email:
                input.email
                  ?.trim()
                  .toLowerCase() ||
                null,
            },
          })

        await transaction.gymMembership.create({
          data: {
            userId,

            gymId:
              createdGym.id,

            role:
              'OWNER',

            active:
              true,
          },
        })

        return createdGym
      },
    )

  return gym
}

export async function listUserGyms(
  userId: string,
) {
  const memberships =
    await prisma.gymMembership.findMany({
      where: {
        userId,

        active:
          true,

        gym: {
          active:
            true,
        },
      },

      orderBy: {
        joinedAt:
          'asc',
      },

      select: {
        role: true,

        gym: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            phone: true,
            email: true,
            logoUrl: true,
            active: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })

  return memberships.map(
    (membership) => ({
      ...membership.gym,

      role:
        membership.role,
    }),
  )
}

export async function getUserGymById(
  userId: string,
  gymId: string,
) {
  const membership =
    await prisma.gymMembership.findUnique({
      where: {
        userId_gymId: {
          userId,
          gymId,
        },
      },

      select: {
        role: true,
        active: true,

        gym: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            phone: true,
            email: true,
            logoUrl: true,
            active: true,
            createdAt: true,
            updatedAt: true,
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

  return {
    ...membership.gym,

    role:
      membership.role,
  }
}

export async function listGymMembers(
  gymId: string,
) {
  return prisma.gymMembership.findMany({
    where: {
      gymId,
    },

    orderBy: [
      {
        active:
          'desc',
      },
      {
        joinedAt:
          'asc',
      },
    ],

    select: {
      id: true,
      role: true,
      active: true,
      joinedAt: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
          active: true,
        },
      },
    },
  })
}

export async function addGymMember(
  gymId: string,
  actorRole: GymRole,
  input: AddGymMemberInput,
  auditContext: GymAuditContext,
) {
  if (
    actorRole !== 'OWNER' &&
    input.role === 'ADMIN'
  ) {
    throw new AppError(
      'GYM_ROLE_NOT_ALLOWED',
      403,
      'Somente o proprietário pode adicionar administradores.',
    )
  }

  const email =
    input.email
      .trim()
      .toLowerCase()

  const user =
    await prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        active: true,
      },
    })

  if (!user) {
    throw new AppError(
      'USER_NOT_FOUND',
      404,
      'Usuário não encontrado.',
    )
  }

  if (!user.active) {
    throw new AppError(
      'USER_INACTIVE',
      409,
      'O usuário informado está inativo.',
    )
  }

  const existingMembership =
    await prisma.gymMembership.findUnique({
      where: {
        userId_gymId: {
          userId:
            user.id,

          gymId,
        },
      },
    })

  if (existingMembership) {
    throw new AppError(
      'GYM_MEMBER_ALREADY_EXISTS',
      409,
      'O usuário já faz parte desta academia.',
    )
  }

  const member =
    await prisma.gymMembership.create({
      data: {
        userId:
          user.id,

        gymId,

        role:
          input.role,

        active:
          true,
      },

      select: {
        id: true,
        role: true,
        active: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            active: true,
          },
        },
      },
    })

  await createAuditLog({
    gymId,

    userId:
      auditContext.userId,

    action:
      'CREATE',

    entity:
      'GYM_MEMBERSHIP',

    entityId:
      member.id,

    newValues: {
      membershipId:
        member.id,

      memberUserId:
        member.user.id,

      memberName:
        member.user.name,

      memberEmail:
        member.user.email,

      role:
        member.role,

      active:
        member.active,
    },

    metadata: {
      source:
        'gym-members',

      actorRole,
    },

    ipAddress:
      auditContext.ipAddress,

    userAgent:
      auditContext.userAgent,
  })

  return member
}

export async function updateGymMemberRole(
  gymId: string,
  memberId: string,
  actorUserId: string,
  actorRole: GymRole,
  input: UpdateGymMemberRoleInput,
  auditContext: GymAuditContext,
) {
  const membership =
    await prisma.gymMembership.findFirst({
      where: {
        id:
          memberId,

        gymId,
      },

      select: {
        id: true,
        userId: true,
        role: true,
        active: true,
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
    membership.userId ===
      actorUserId &&
    membership.role ===
      'OWNER'
  ) {
    throw new AppError(
      'OWNER_SELF_CHANGE_NOT_ALLOWED',
      409,
      'O proprietário não pode alterar o próprio papel.',
    )
  }

  if (
    membership.role ===
      'OWNER' &&
    actorRole !==
      'OWNER'
  ) {
    throw new AppError(
      'OWNER_MANAGEMENT_NOT_ALLOWED',
      403,
      'Somente um proprietário pode gerenciar outro proprietário.',
    )
  }

  if (
    input.role ===
      'OWNER' &&
    actorRole !==
      'OWNER'
  ) {
    throw new AppError(
      'OWNER_ASSIGNMENT_NOT_ALLOWED',
      403,
      'Somente um proprietário pode definir outro proprietário.',
    )
  }

  if (
    actorRole ===
      'ADMIN' &&
    (
      membership.role ===
        'ADMIN' ||
      input.role ===
        'ADMIN'
    )
  ) {
    throw new AppError(
      'ADMIN_ROLE_MANAGEMENT_NOT_ALLOWED',
      403,
      'Administradores não podem gerenciar outros administradores.',
    )
  }

  const previousRole =
    membership.role

  const member =
    await prisma.gymMembership.update({
      where: {
        id:
          membership.id,
      },

      data: {
        role:
          input.role,
      },

      select: {
        id: true,
        role: true,
        active: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            active: true,
          },
        },
      },
    })

  await createAuditLog({
    gymId,

    userId:
      auditContext.userId,

    action:
      'UPDATE',

    entity:
      'GYM_MEMBERSHIP',

    entityId:
      member.id,

    oldValues: {
      role:
        previousRole,
    },

    newValues: {
      role:
        member.role,
    },

    metadata: {
      source:
        'gym-members',

      memberUserId:
        member.user.id,

      memberName:
        member.user.name,

      memberEmail:
        member.user.email,

      actorRole,
    },

    ipAddress:
      auditContext.ipAddress,

    userAgent:
      auditContext.userAgent,
  })

  return member
}

export async function updateGymMemberStatus(
  gymId: string,
  memberId: string,
  actorUserId: string,
  actorRole: GymRole,
  input: UpdateGymMemberStatusInput,
  auditContext: GymAuditContext,
) {
  const membership =
    await prisma.gymMembership.findFirst({
      where: {
        id:
          memberId,

        gymId,
      },

      select: {
        id: true,
        userId: true,
        role: true,
        active: true,
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
    membership.userId ===
      actorUserId
  ) {
    throw new AppError(
      'MEMBER_SELF_STATUS_NOT_ALLOWED',
      409,
      'Você não pode alterar o status do próprio vínculo.',
    )
  }

  if (
    membership.role ===
      'OWNER'
  ) {
    throw new AppError(
      'OWNER_STATUS_CHANGE_NOT_ALLOWED',
      403,
      'O vínculo do proprietário não pode ser desativado por esta operação.',
    )
  }

  if (
    actorRole ===
      'ADMIN' &&
    membership.role ===
      'ADMIN'
  ) {
    throw new AppError(
      'ADMIN_MANAGEMENT_NOT_ALLOWED',
      403,
      'Administradores não podem gerenciar outros administradores.',
    )
  }

  if (
    membership.active ===
      input.active
  ) {
    throw new AppError(
      input.active
        ? 'GYM_MEMBER_ALREADY_ACTIVE'
        : 'GYM_MEMBER_ALREADY_INACTIVE',
      409,
      input.active
        ? 'O membro já está ativo.'
        : 'O membro já está inativo.',
    )
  }

  const previousActive =
    membership.active

  const member =
    await prisma.gymMembership.update({
      where: {
        id:
          membership.id,
      },

      data: {
        active:
          input.active,
      },

      select: {
        id: true,
        role: true,
        active: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            active: true,
          },
        },
      },
    })

  await createAuditLog({
    gymId,

    userId:
      auditContext.userId,

    action:
      'STATUS_CHANGE',

    entity:
      'GYM_MEMBERSHIP',

    entityId:
      member.id,

    oldValues: {
      active:
        previousActive,
    },

    newValues: {
      active:
        member.active,
    },

    metadata: {
      source:
        'gym-members',

      memberUserId:
        member.user.id,

      memberName:
        member.user.name,

      memberEmail:
        member.user.email,

      memberRole:
        member.role,

      actorRole,
    },

    ipAddress:
      auditContext.ipAddress,

    userAgent:
      auditContext.userAgent,
  })

  return member
}