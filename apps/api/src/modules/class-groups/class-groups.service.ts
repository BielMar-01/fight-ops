import type { Prisma } from '../../generated/prisma/client.js'

import { prisma } from '../../database/prisma.js'

import { AppError } from '../../http/app-error.js'

import type {
  CreateClassGroupBody,
  ListClassGroupsQuery,
  UpdateClassGroupBody,
  UpdateClassGroupStatusBody,
} from './class-groups.types.js'

function normalizeOptionalText(value?: string) {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

const classGroupSelect = {
  id: true,
  gymId: true,
  modalityId: true,
  name: true,
  description: true,
  level: true,
  minimumAge: true,
  maximumAge: true,
  maxStudents: true,
  durationMinutes: true,
  active: true,
  createdAt: true,
  updatedAt: true,

  modality: {
    select: {
      id: true,
      name: true,
      color: true,
      active: true,
    },
  },

  professors: {
    orderBy: [
      {
        role: 'asc',
      },

      {
        professor: {
          name: 'asc',
        },
      },
    ],

    select: {
      id: true,
      role: true,
      createdAt: true,

      professor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          active: true,
        },
      },
    },
  },
} satisfies Prisma.ClassGroupSelect

type SelectedClassGroup = Prisma.ClassGroupGetPayload<{
  select: typeof classGroupSelect
}>

function serializeClassGroup(classGroup: SelectedClassGroup) {
  const primaryProfessorRelation = classGroup.professors.find(
    (relation) => relation.role === 'PRIMARY',
  )

  const assistantProfessorRelations = classGroup.professors.filter(
    (relation) => relation.role === 'ASSISTANT',
  )

  return {
    id: classGroup.id,
    gymId: classGroup.gymId,
    modalityId: classGroup.modalityId,
    name: classGroup.name,
    description: classGroup.description,
    level: classGroup.level,
    minimumAge: classGroup.minimumAge,
    maximumAge: classGroup.maximumAge,
    maxStudents: classGroup.maxStudents,
    durationMinutes: classGroup.durationMinutes,
    active: classGroup.active,
    createdAt: classGroup.createdAt,
    updatedAt: classGroup.updatedAt,

    modality: classGroup.modality,

    primaryProfessor: primaryProfessorRelation
      ? {
          relationId: primaryProfessorRelation.id,
          assignedAt: primaryProfessorRelation.createdAt,

          ...primaryProfessorRelation.professor,
        }
      : null,

    assistantProfessors: assistantProfessorRelations.map(
      (relation) => ({
        relationId: relation.id,
        assignedAt: relation.createdAt,

        ...relation.professor,
      }),
    ),

    totalProfessors: classGroup.professors.length,
  }
}

async function getModalityFromGym(
  gymId: string,
  modalityId: string,
) {
  const modality = await prisma.modality.findFirst({
    where: {
      id: modalityId,
      gymId,
    },

    select: {
      id: true,
      active: true,
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

async function ensureActiveModality(
  gymId: string,
  modalityId: string,
) {
  const modality = await getModalityFromGym(gymId, modalityId)

  if (!modality.active) {
    throw new AppError(
      'MODALITY_INACTIVE',
      409,
      'Não é possível utilizar uma modalidade inativa na turma.',
    )
  }

  return modality
}

async function ensureClassGroupNameAvailable(
  gymId: string,
  name: string,
  ignoredClassGroupId?: string,
) {
  const existingClassGroup = await prisma.classGroup.findFirst({
    where: {
      gymId,

      name: {
        equals: name.trim(),

        mode: 'insensitive',
      },

      ...(ignoredClassGroupId
        ? {
            id: {
              not: ignoredClassGroupId,
            },
          }
        : {}),
    },

    select: {
      id: true,
    },
  })

  if (existingClassGroup) {
    throw new AppError(
      'CLASS_GROUP_ALREADY_EXISTS',
      409,
      'Já existe uma turma com este nome nesta academia.',
    )
  }
}

async function ensureProfessorsSupportModalityChange(
  gymId: string,
  classGroupId: string,
  modalityId: string,
) {
  const incompatibleProfessor = await prisma.classGroupProfessor.findFirst({
    where: {
      gymId,
      classGroupId,

      professor: {
        modalities: {
          none: {
            gymId,
            modalityId,
          },
        },
      },
    },

    select: {
      professor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (incompatibleProfessor) {
    throw new AppError(
      'CLASS_GROUP_MODALITY_INCOMPATIBLE',
      409,
      `O professor ${incompatibleProfessor.professor.name} não está vinculado à nova modalidade.`,
    )
  }
}

export async function listClassGroups(
  gymId: string,
  query: ListClassGroupsQuery,
) {
  const {
    page,
    limit,
    search,
    active,
    modalityId,
    level,
    professorId,
  } = query

  const where: Prisma.ClassGroupWhereInput = {
    gymId,

    ...(active !== undefined
      ? {
          active,
        }
      : {}),

    ...(modalityId
      ? {
          modalityId,
        }
      : {}),

    ...(level
      ? {
          level,
        }
      : {}),

    ...(professorId
      ? {
          professors: {
            some: {
              gymId,
              professorId,
            },
          },
        }
      : {}),

    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,

                mode: 'insensitive',
              },
            },

            {
              description: {
                contains: search,

                mode: 'insensitive',
              },
            },

            {
              modality: {
                name: {
                  contains: search,

                  mode: 'insensitive',
                },
              },
            },
          ],
        }
      : {}),
  }

  const [classGroups, total] = await prisma.$transaction([
    prisma.classGroup.findMany({
      where,

      orderBy: [
        {
          active: 'desc',
        },

        {
          name: 'asc',
        },
      ],

      skip: (page - 1) * limit,

      take: limit,

      select: classGroupSelect,
    }),

    prisma.classGroup.count({
      where,
    }),
  ])

  return {
    classGroups: classGroups.map(serializeClassGroup),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getClassGroupById(
  gymId: string,
  classGroupId: string,
) {
  const classGroup = await prisma.classGroup.findFirst({
    where: {
      id: classGroupId,
      gymId,
    },

    select: classGroupSelect,
  })

  if (!classGroup) {
    throw new AppError(
      'CLASS_GROUP_NOT_FOUND',
      404,
      'Turma não encontrada.',
    )
  }

  return serializeClassGroup(classGroup)
}

export async function createClassGroup(
  gymId: string,
  input: CreateClassGroupBody,
) {
  await ensureActiveModality(gymId, input.modalityId)

  const name = input.name.trim()

  await ensureClassGroupNameAvailable(gymId, name)

  const classGroup = await prisma.classGroup.create({
    data: {
      gymId,
      modalityId: input.modalityId,
      name,
      description: normalizeOptionalText(input.description),
      level: input.level,
      minimumAge: input.minimumAge ?? null,
      maximumAge: input.maximumAge ?? null,
      maxStudents: input.maxStudents ?? null,
      durationMinutes: input.durationMinutes,
    },

    select: classGroupSelect,
  })

  return serializeClassGroup(classGroup)
}

export async function updateClassGroup(
  gymId: string,
  classGroupId: string,
  input: UpdateClassGroupBody,
) {
  const currentClassGroup = await getClassGroupById(
    gymId,
    classGroupId,
  )

  await ensureActiveModality(gymId, input.modalityId)

  const name = input.name.trim()

  await ensureClassGroupNameAvailable(
    gymId,
    name,
    classGroupId,
  )

  if (currentClassGroup.modalityId !== input.modalityId) {
    await ensureProfessorsSupportModalityChange(
      gymId,
      classGroupId,
      input.modalityId,
    )
  }

  const classGroup = await prisma.classGroup.update({
    where: {
      id: classGroupId,
    },

    data: {
      modalityId: input.modalityId,
      name,
      description: normalizeOptionalText(input.description),
      level: input.level,
      minimumAge: input.minimumAge ?? null,
      maximumAge: input.maximumAge ?? null,
      maxStudents: input.maxStudents ?? null,
      durationMinutes: input.durationMinutes,
    },

    select: classGroupSelect,
  })

  return serializeClassGroup(classGroup)
}

export async function updateClassGroupStatus(
  gymId: string,
  classGroupId: string,
  input: UpdateClassGroupStatusBody,
) {
  await getClassGroupById(gymId, classGroupId)

  const classGroup = await prisma.classGroup.update({
    where: {
      id: classGroupId,
    },

    data: {
      active: input.active,
    },

    select: classGroupSelect,
  })

  return serializeClassGroup(classGroup)
}