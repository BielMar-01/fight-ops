import type { Prisma } from '../../generated/prisma/client.js'

import { prisma } from '../../database/prisma.js'

import { AppError } from '../../http/app-error.js'

import type {
  CreateClassScheduleBody,
  ListClassSchedulesQuery,
  UpdateClassScheduleBody,
  UpdateClassScheduleStatusBody,
} from './class-schedules.types.js'

function normalizeOptionalText(
  value?: string,
) {
  const normalized = value?.trim()

  return normalized
    ? normalized
    : null
}

function parseTime(value: string) {
  return new Date(
    `1970-01-01T${value}:00.000Z`,
  )
}

function serializeTime(value: Date) {
  return value
    .toISOString()
    .slice(11, 16)
}

function parseDate(value?: string) {
  if (!value) {
    return null
  }

  return new Date(
    `${value}T00:00:00.000Z`,
  )
}

function serializeDate(
  value: Date | null,
) {
  if (!value) {
    return null
  }

  return value
    .toISOString()
    .slice(0, 10)
}

const classScheduleSelect = {
  id: true,
  gymId: true,
  classGroupId: true,
  weekday: true,
  startTime: true,
  endTime: true,
  room: true,
  notes: true,
  validFrom: true,
  validUntil: true,
  active: true,
  createdAt: true,
  updatedAt: true,

  classGroup: {
    select: {
      id: true,
      gymId: true,
      modalityId: true,
      name: true,
      level: true,
      durationMinutes: true,
      active: true,

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
    },
  },
} satisfies Prisma.ClassScheduleSelect

type SelectedClassSchedule =
  Prisma.ClassScheduleGetPayload<{
    select: typeof classScheduleSelect
  }>

function serializeClassSchedule(
  classSchedule: SelectedClassSchedule,
) {
  const primaryProfessorRelation =
    classSchedule.classGroup.professors.find(
      (relation) =>
        relation.role === 'PRIMARY',
    )

  const assistantProfessorRelations =
    classSchedule.classGroup.professors.filter(
      (relation) =>
        relation.role === 'ASSISTANT',
    )

  return {
    id: classSchedule.id,
    gymId: classSchedule.gymId,
    classGroupId:
      classSchedule.classGroupId,
    weekday: classSchedule.weekday,
    startTime: serializeTime(
      classSchedule.startTime,
    ),
    endTime: serializeTime(
      classSchedule.endTime,
    ),
    room: classSchedule.room,
    notes: classSchedule.notes,
    validFrom: serializeDate(
      classSchedule.validFrom,
    ),
    validUntil: serializeDate(
      classSchedule.validUntil,
    ),
    active: classSchedule.active,
    createdAt: classSchedule.createdAt,
    updatedAt: classSchedule.updatedAt,

    classGroup: {
      id: classSchedule.classGroup.id,
      gymId:
        classSchedule.classGroup.gymId,
      modalityId:
        classSchedule.classGroup
          .modalityId,
      name: classSchedule.classGroup.name,
      level:
        classSchedule.classGroup.level,
      durationMinutes:
        classSchedule.classGroup
          .durationMinutes,
      active:
        classSchedule.classGroup.active,

      modality:
        classSchedule.classGroup.modality,

      primaryProfessor:
        primaryProfessorRelation
          ? {
              relationId:
                primaryProfessorRelation.id,

              ...primaryProfessorRelation
                .professor,
            }
          : null,

      assistantProfessors:
        assistantProfessorRelations.map(
          (relation) => ({
            relationId: relation.id,

            ...relation.professor,
          }),
        ),

      totalProfessors:
        classSchedule.classGroup
          .professors.length,
    },
  }
}

async function getClassGroupFromGym(
  gymId: string,
  classGroupId: string,
) {
  const classGroup =
    await prisma.classGroup.findFirst({
      where: {
        id: classGroupId,
        gymId,
      },

      select: {
        id: true,
        active: true,
        modalityId: true,
      },
    })

  if (!classGroup) {
    throw new AppError(
      'CLASS_GROUP_NOT_FOUND',
      404,
      'Turma não encontrada.',
    )
  }

  return classGroup
}

async function ensureActiveClassGroup(
  gymId: string,
  classGroupId: string,
) {
  const classGroup =
    await getClassGroupFromGym(
      gymId,
      classGroupId,
    )

  if (!classGroup.active) {
    throw new AppError(
      'CLASS_GROUP_INACTIVE',
      409,
      'Não é possível cadastrar horários em uma turma inativa.',
    )
  }

  return classGroup
}

export async function listClassSchedules(
  gymId: string,
  query: ListClassSchedulesQuery,
) {
  const {
    page,
    limit,
    search,
    active,
    weekday,
    classGroupId,
    modalityId,
    professorId,
    validOn,
  } = query

  const validityDate = validOn
    ? parseDate(validOn)
    : null

  const where: Prisma.ClassScheduleWhereInput =
    {
      gymId,

      ...(active !== undefined
        ? {
            active,
          }
        : {}),

      ...(weekday
        ? {
            weekday,
          }
        : {}),

      ...(classGroupId
        ? {
            classGroupId,
          }
        : {}),

      ...(modalityId
        ? {
            classGroup: {
              modalityId,
            },
          }
        : {}),

      ...(professorId
        ? {
            classGroup: {
              professors: {
                some: {
                  gymId,
                  professorId,
                },
              },
            },
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                room: {
                  contains: search,

                  mode: 'insensitive',
                },
              },

              {
                notes: {
                  contains: search,

                  mode: 'insensitive',
                },
              },

              {
                classGroup: {
                  name: {
                    contains: search,

                    mode: 'insensitive',
                  },
                },
              },

              {
                classGroup: {
                  modality: {
                    name: {
                      contains: search,

                      mode: 'insensitive',
                    },
                  },
                },
              },
            ],
          }
        : {}),

      ...(validityDate
        ? {
            AND: [
              {
                OR: [
                  {
                    validFrom: null,
                  },

                  {
                    validFrom: {
                      lte: validityDate,
                    },
                  },
                ],
              },

              {
                OR: [
                  {
                    validUntil: null,
                  },

                  {
                    validUntil: {
                      gte: validityDate,
                    },
                  },
                ],
              },
            ],
          }
        : {}),
    }

  const [classSchedules, total] =
    await prisma.$transaction([
      prisma.classSchedule.findMany({
        where,

        orderBy: [
          {
            weekday: 'asc',
          },

          {
            startTime: 'asc',
          },

          {
            classGroup: {
              name: 'asc',
            },
          },
        ],

        skip: (page - 1) * limit,

        take: limit,

        select: classScheduleSelect,
      }),

      prisma.classSchedule.count({
        where,
      }),
    ])

  return {
    classSchedules:
      classSchedules.map(
        serializeClassSchedule,
      ),

    pagination: {
      page,
      limit,
      total,
      totalPages:
        Math.ceil(total / limit),
    },
  }
}

export async function listClassGroupSchedules(
  gymId: string,
  classGroupId: string,
  query: Omit<
    ListClassSchedulesQuery,
    'classGroupId'
  >,
) {
  await getClassGroupFromGym(
    gymId,
    classGroupId,
  )

  return listClassSchedules(gymId, {
    ...query,
    classGroupId,
  })
}

export async function getClassScheduleById(
  gymId: string,
  classScheduleId: string,
) {
  const classSchedule =
    await prisma.classSchedule.findFirst({
      where: {
        id: classScheduleId,
        gymId,
      },

      select: classScheduleSelect,
    })

  if (!classSchedule) {
    throw new AppError(
      'CLASS_SCHEDULE_NOT_FOUND',
      404,
      'Horário não encontrado.',
    )
  }

  return serializeClassSchedule(
    classSchedule,
  )
}

export async function createClassSchedule(
  gymId: string,
  input: CreateClassScheduleBody,
) {
  await ensureActiveClassGroup(
    gymId,
    input.classGroupId,
  )

  const classSchedule =
    await prisma.classSchedule.create({
      data: {
        gymId,

        classGroupId:
          input.classGroupId,

        weekday: input.weekday,

        startTime: parseTime(
          input.startTime,
        ),

        endTime: parseTime(
          input.endTime,
        ),

        room: normalizeOptionalText(
          input.room,
        ),

        notes: normalizeOptionalText(
          input.notes,
        ),

        validFrom: parseDate(
          input.validFrom,
        ),

        validUntil: parseDate(
          input.validUntil,
        ),
      },

      select: classScheduleSelect,
    })

  return serializeClassSchedule(
    classSchedule,
  )
}

export async function updateClassSchedule(
  gymId: string,
  classScheduleId: string,
  input: UpdateClassScheduleBody,
) {
  await getClassScheduleById(
    gymId,
    classScheduleId,
  )

  await ensureActiveClassGroup(
    gymId,
    input.classGroupId,
  )

  const classSchedule =
    await prisma.classSchedule.update({
      where: {
        id: classScheduleId,
      },

      data: {
        classGroupId:
          input.classGroupId,

        weekday: input.weekday,

        startTime: parseTime(
          input.startTime,
        ),

        endTime: parseTime(
          input.endTime,
        ),

        room: normalizeOptionalText(
          input.room,
        ),

        notes: normalizeOptionalText(
          input.notes,
        ),

        validFrom: parseDate(
          input.validFrom,
        ),

        validUntil: parseDate(
          input.validUntil,
        ),
      },

      select: classScheduleSelect,
    })

  return serializeClassSchedule(
    classSchedule,
  )
}

export async function updateClassScheduleStatus(
  gymId: string,
  classScheduleId: string,
  input: UpdateClassScheduleStatusBody,
) {
  const currentClassSchedule =
    await getClassScheduleById(
      gymId,
      classScheduleId,
    )

  if (input.active) {
    await ensureActiveClassGroup(
      gymId,
      currentClassSchedule.classGroupId,
    )
  }

  const classSchedule =
    await prisma.classSchedule.update({
      where: {
        id: classScheduleId,
      },

      data: {
        active: input.active,
      },

      select: classScheduleSelect,
    })

  return serializeClassSchedule(
    classSchedule,
  )
}