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
  CreateModalityBody,
  ListModalitiesQuery,
  UpdateModalityBody,
  UpdateModalityStatusBody,
} from './modalities.types.js'

function normalizeOptionalText(
  value?: string,
) {
  const normalized =
    value?.trim()

  return normalized
    ? normalized
    : null
}

const modalitySelect = {
  id: true,
  gymId: true,
  name: true,
  description: true,
  color: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ModalitySelect

async function ensureModalityNameAvailable(
  gymId: string,
  name: string,
  ignoredModalityId?: string,
) {
  const existingModality =
    await prisma.modality.findFirst({
      where: {
        gymId,

        name: {
          equals:
            name.trim(),

          mode:
            'insensitive',
        },

        ...(ignoredModalityId
          ? {
              id: {
                not:
                  ignoredModalityId,
              },
            }
          : {}),
      },

      select: {
        id: true,
      },
    })

  if (existingModality) {
    throw new AppError(
      'MODALITY_ALREADY_EXISTS',
      409,
      'Já existe uma modalidade com este nome nesta academia.',
    )
  }
}

export async function listModalities(
  gymId: string,
  query: ListModalitiesQuery,
) {
  const {
    page,
    limit,
    search,
    active,
  } = query

  const where: Prisma.ModalityWhereInput =
    {
      gymId,

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
    modalities,
    total,
  ] =
    await prisma.$transaction([
      prisma.modality.findMany({
        where,

        orderBy: [
          {
            active:
              'desc',
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
          modalitySelect,
      }),

      prisma.modality.count({
        where,
      }),
    ])

  return {
    modalities,

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

export async function getModalityById(
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

      select:
        modalitySelect,
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

export async function createModality(
  gymId: string,
  input: CreateModalityBody,
) {
  const name =
    input.name.trim()

  await ensureModalityNameAvailable(
    gymId,
    name,
  )

  const modality =
    await prisma.modality.create({
      data: {
        gymId,

        name,

        description:
          normalizeOptionalText(
            input.description,
          ),

        color:
          normalizeOptionalText(
            input.color,
          ),
      },

      select:
        modalitySelect,
    })

  return modality
}

export async function updateModality(
  gymId: string,
  modalityId: string,
  input: UpdateModalityBody,
) {
  await getModalityById(
    gymId,
    modalityId,
  )

  const name =
    input.name.trim()

  await ensureModalityNameAvailable(
    gymId,
    name,
    modalityId,
  )

  const modality =
    await prisma.modality.update({
      where: {
        id:
          modalityId,
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
      },

      select:
        modalitySelect,
    })

  return modality
}

export async function updateModalityStatus(
  gymId: string,
  modalityId: string,
  input: UpdateModalityStatusBody,
) {
  await getModalityById(
    gymId,
    modalityId,
  )

  const modality =
    await prisma.modality.update({
      where: {
        id:
          modalityId,
      },

      data: {
        active:
          input.active,
      },

      select:
        modalitySelect,
    })

  return modality
}