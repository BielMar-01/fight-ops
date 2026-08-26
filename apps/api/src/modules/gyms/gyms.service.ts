import {
  prisma,
} from '../../database/prisma.js'

import {
  AppError,
} from '../../http/app-error.js'

import type {
  CreateGymInput,
} from './gyms.types.js'

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