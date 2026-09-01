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
  CreateProfessorInput,
  ListProfessorsQuery,
} from './professors.types.js'

function parseOptionalDate(
  value?: string,
) {
  if (!value) {
    return null
  }

  return new Date(
    `${value}T00:00:00.000Z`,
  )
}

function normalizeOptionalText(
  value?: string,
) {
  const normalized =
    value?.trim()

  return normalized
    ? normalized
    : null
}

export async function listProfessors(
  gymId: string,
  query: ListProfessorsQuery,
) {
  const {
    page,
    limit,
    search,
    active,
  } = query

  const where: Prisma.ProfessorWhereInput =
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
            OR: [
              {
                name: {
                  contains:
                    search,
                  mode:
                    'insensitive',
                },
              },

              {
                email: {
                  contains:
                    search,
                  mode:
                    'insensitive',
                },
              },

              {
                phone: {
                  contains:
                    search,
                },
              },
            ],
          }
        : {}),
    }

  const [
    professors,
    total,
  ] =
    await prisma.$transaction([
      prisma.professor.findMany({
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

        select: {
          id: true,
          gymId: true,
          userId: true,

          name: true,
          email: true,
          phone: true,
          birthDate: true,

          bio: true,
          notes: true,
          hireDate: true,

          active: true,

          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.professor.count({
        where,
      }),
    ])

  return {
    professors,

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

export async function getProfessorById(
  gymId: string,
  professorId: string,
) {
  const professor =
    await prisma.professor.findFirst({
      where: {
        id:
          professorId,

        gymId,
      },

      select: {
        id: true,
        gymId: true,
        userId: true,

        name: true,
        email: true,
        phone: true,
        birthDate: true,

        bio: true,
        notes: true,
        hireDate: true,

        active: true,

        createdAt: true,
        updatedAt: true,
      },
    })

  if (!professor) {
    throw new AppError(
      'PROFESSOR_NOT_FOUND',
      404,
      'Professor não encontrado.',
    )
  }

  return professor
}

export async function createProfessor(
  gymId: string,
  input: CreateProfessorInput,
) {
  const professor =
    await prisma.professor.create({
      data: {
        gymId,

        name:
          input.name.trim(),

        email:
          normalizeOptionalText(
            input.email,
          ),

        phone:
          normalizeOptionalText(
            input.phone,
          ),

        birthDate:
          parseOptionalDate(
            input.birthDate,
          ),

        bio:
          normalizeOptionalText(
            input.bio,
          ),

        notes:
          normalizeOptionalText(
            input.notes,
          ),

        hireDate:
          parseOptionalDate(
            input.hireDate,
          ),
      },

      select: {
        id: true,
        gymId: true,
        userId: true,

        name: true,
        email: true,
        phone: true,
        birthDate: true,

        bio: true,
        notes: true,
        hireDate: true,

        active: true,

        createdAt: true,
        updatedAt: true,
      },
    })

  return professor
}