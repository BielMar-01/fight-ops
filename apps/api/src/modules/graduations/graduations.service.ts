import type {
  Prisma,
} from '../../generated/prisma/client.js'

import {
  prisma,
} from '../../database/prisma.js'

import {
  AppError,
} from '../../http/app-error.js'

import type {
  CreateGraduationBody,
  ListGraduationsQuery,
  UpdateGraduationBody,
  UpdateGraduationStatusBody,
} from './graduations.types.js'

function normalizeOptionalText(
  value?: string,
) {
  const normalized =
    value?.trim()

  return normalized
    ? normalized
    : null
}

const graduationSelect = {
  id: true,
  gymId: true,
  modalityId: true,
  name: true,
  description: true,
  color: true,
  textColor: true,
  order: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.GraduationSelect

async function ensureModalityBelongsToGym(
  gymId: string,
  modalityId: string,
) {
  const modality =
    await prisma.modality.findFirst({
      where: {
        id:
          modalityId,

        gymId,
      },

      select: {
        id: true,
      },
    })

  if (!modality) {
    throw new AppError(
      'MODALITY_NOT_FOUND',
      404,
      'Modalidade não encontrada.',
    )
  }

  return modality
}

async function ensureGraduationNameAvailable(
  gymId: string,
  modalityId: string,
  name: string,
  ignoredGraduationId?: string,
) {
  const existingGraduation =
    await prisma.graduation.findFirst({
      where: {
        gymId,

        modalityId,

        name: {
          equals:
            name.trim(),

          mode:
            'insensitive',
        },

        ...(ignoredGraduationId
          ? {
              id: {
                not:
                  ignoredGraduationId,
              },
            }
          : {}),
      },

      select: {
        id: true,
      },
    })

  if (existingGraduation) {
    throw new AppError(
      'GRADUATION_ALREADY_EXISTS',
      409,
      'Já existe uma graduação com este nome nesta modalidade.',
    )
  }
}

async function ensureGraduationOrderAvailable(
  gymId: string,
  modalityId: string,
  order: number,
  ignoredGraduationId?: string,
) {
  const existingGraduation =
    await prisma.graduation.findFirst({
      where: {
        gymId,

        modalityId,

        order,

        ...(ignoredGraduationId
          ? {
              id: {
                not:
                  ignoredGraduationId,
              },
            }
          : {}),
      },

      select: {
        id: true,
      },
    })

  if (existingGraduation) {
    throw new AppError(
      'GRADUATION_ORDER_ALREADY_EXISTS',
      409,
      'Já existe uma graduação utilizando esta ordem nesta modalidade.',
    )
  }
}

export async function listGraduations(
  gymId: string,
  modalityId: string,
  query: ListGraduationsQuery,
) {
  await ensureModalityBelongsToGym(
    gymId,
    modalityId,
  )

  const {
    page,
    limit,
    search,
    active,
  } = query

  const where: Prisma.GraduationWhereInput =
    {
      gymId,

      modalityId,

      ...(active !==
      undefined
        ? {
            active,
          }
        : {}),

      ...(search
        ? {
            name: {
              contains:
                search,

              mode:
                'insensitive',
            },
          }
        : {}),
    }

  const [
    graduations,
    total,
  ] =
    await prisma.$transaction([
      prisma.graduation.findMany({
        where,

        orderBy: [
          {
            order:
              'asc',
          },

          {
            name:
              'asc',
          },
        ],

        skip:
          (page - 1) *
          limit,

        take:
          limit,

        select:
          graduationSelect,
      }),

      prisma.graduation.count({
        where,
      }),
    ])

  return {
    graduations,

    pagination: {
      page,
      limit,
      total,

      totalPages:
        Math.ceil(
          total / limit,
        ),
    },
  }
}

export async function getGraduationById(
  gymId: string,
  modalityId: string,
  graduationId: string,
) {
  const graduation =
    await prisma.graduation.findFirst({
      where: {
        id:
          graduationId,

        gymId,

        modalityId,
      },

      select:
        graduationSelect,
    })

  if (!graduation) {
    throw new AppError(
      'GRADUATION_NOT_FOUND',
      404,
      'Graduação não encontrada.',
    )
  }

  return graduation
}

export async function createGraduation(
  gymId: string,
  modalityId: string,
  input: CreateGraduationBody,
) {
  await ensureModalityBelongsToGym(
    gymId,
    modalityId,
  )

  const name =
    input.name.trim()

  await ensureGraduationNameAvailable(
    gymId,
    modalityId,
    name,
  )

  await ensureGraduationOrderAvailable(
    gymId,
    modalityId,
    input.order,
  )

  const graduation =
    await prisma.graduation.create({
      data: {
        gymId,

        modalityId,

        name,

        description:
          normalizeOptionalText(
            input.description,
          ),

        color:
          normalizeOptionalText(
            input.color,
          ),

        textColor:
          normalizeOptionalText(
            input.textColor,
          ),

        order:
          input.order,
      },

      select:
        graduationSelect,
    })

  return graduation
}

export async function updateGraduation(
  gymId: string,
  modalityId: string,
  graduationId: string,
  input: UpdateGraduationBody,
) {
  await getGraduationById(
    gymId,
    modalityId,
    graduationId,
  )

  const name =
    input.name.trim()

  await ensureGraduationNameAvailable(
    gymId,
    modalityId,
    name,
    graduationId,
  )

  await ensureGraduationOrderAvailable(
    gymId,
    modalityId,
    input.order,
    graduationId,
  )

  const graduation =
    await prisma.graduation.update({
      where: {
        id:
          graduationId,
      },

      data: {
        name,

        description:
          normalizeOptionalText(
            input.description,
          ),

        color:
          normalizeOptionalText(
            input.color,
          ),

        textColor:
          normalizeOptionalText(
            input.textColor,
          ),

        order:
          input.order,
      },

      select:
        graduationSelect,
    })

  return graduation
}

export async function updateGraduationStatus(
  gymId: string,
  modalityId: string,
  graduationId: string,
  input: UpdateGraduationStatusBody,
) {
  await getGraduationById(
    gymId,
    modalityId,
    graduationId,
  )

  const graduation =
    await prisma.graduation.update({
      where: {
        id:
          graduationId,
      },

      data: {
        active:
          input.active,
      },

      select:
        graduationSelect,
    })

  return graduation
}