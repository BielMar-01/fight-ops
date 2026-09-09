import type { Prisma } from '../../generated/prisma/client.js'

import { prisma } from '../../database/prisma.js'

import { AppError } from '../../http/app-error.js'

import type {
  CreateClassScheduleBody,
  ListClassSchedulesQuery,
  UpdateClassScheduleBody,
  UpdateClassScheduleStatusBody,
} from './class-schedules.types.js'

function normalizeOptionalText(value?: string) {
  const normalized = value?.trim()

  return normalized ? normalized : null
}

function normalizeRoom(value?: string | null) {
  const normalized = value?.trim().toLocaleLowerCase('pt-BR')

  return normalized || null
}

function parseTime(value: string) {
  return new Date(`1970-01-01T${value}:00.000Z`)
}

function serializeTime(value: Date) {
  return value.toISOString().slice(11, 16)
}

function parseDate(value?: string | null) {
  if (!value) {
    return null
  }

  return new Date(`${value}T00:00:00.000Z`)
}

function serializeDate(value?: Date | null) {
  if (!value) {
    return null
  }

  return value.toISOString().slice(0, 10)
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
      (relation) => relation.role === 'PRIMARY',
    )

  const assistantProfessorRelations =
    classSchedule.classGroup.professors.filter(
      (relation) => relation.role === 'ASSISTANT',
    )

  return {
    id: classSchedule.id,
    gymId: classSchedule.gymId,
    classGroupId: classSchedule.classGroupId,
    weekday: classSchedule.weekday,
    startTime: serializeTime(classSchedule.startTime),
    endTime: serializeTime(classSchedule.endTime),
    room: classSchedule.room,
    notes: classSchedule.notes,
    validFrom: serializeDate(classSchedule.validFrom),
    validUntil: serializeDate(classSchedule.validUntil),
    active: classSchedule.active,
    createdAt: classSchedule.createdAt,
    updatedAt: classSchedule.updatedAt,

    classGroup: {
      id: classSchedule.classGroup.id,
      modalityId: classSchedule.classGroup.modalityId,
      name: classSchedule.classGroup.name,
      level: classSchedule.classGroup.level,
      durationMinutes:
        classSchedule.classGroup.durationMinutes,
      active: classSchedule.classGroup.active,

      modality: classSchedule.classGroup.modality,

      primaryProfessor: primaryProfessorRelation
        ? {
            relationId: primaryProfessorRelation.id,
            assignedAt: primaryProfessorRelation.createdAt,

            ...primaryProfessorRelation.professor,
          }
        : null,

      assistantProfessors:
        assistantProfessorRelations.map(
          (relation) => ({
            relationId: relation.id,
            assignedAt: relation.createdAt,

            ...relation.professor,
          }),
        ),

      totalProfessors:
        classSchedule.classGroup.professors.length,
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
        name: true,
        active: true,

        professors: {
          select: {
            professorId: true,

            professor: {
              select: {
                id: true,
                name: true,
                active: true,
              },
            },
          },
        },
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
  const classGroup = await getClassGroupFromGym(
    gymId,
    classGroupId,
  )

  if (!classGroup.active) {
    throw new AppError(
      'CLASS_GROUP_INACTIVE',
      409,
      'Não é possível cadastrar um horário para uma turma inativa.',
    )
  }

  return classGroup
}

interface EnsureNoScheduleConflictInput {
  gymId: string
  classGroupId: string
  weekday:
    | 'SUNDAY'
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
  startTime: string
  endTime: string
  room?: string | null
  validFrom?: string | null
  validUntil?: string | null
  ignoredClassScheduleId?: string
}

async function ensureNoScheduleConflict(
  input: EnsureNoScheduleConflictInput,
) {
  const classGroup = await getClassGroupFromGym(
    input.gymId,
    input.classGroupId,
  )

  const startTime = parseTime(input.startTime)
  const endTime = parseTime(input.endTime)
  const validFrom = parseDate(input.validFrom)
  const validUntil = parseDate(input.validUntil)

  const validityConditions: Prisma.ClassScheduleWhereInput[] =
    []

  /*
   * Um período possui conflito quando:
   *
   * - o início existente é anterior ou igual ao fim novo;
   * - o fim existente é posterior ou igual ao início novo.
   *
   * Datas nulas são tratadas como períodos sem limite.
   */

  if (validUntil) {
    validityConditions.push({
      OR: [
        {
          validFrom: null,
        },

        {
          validFrom: {
            lte: validUntil,
          },
        },
      ],
    })
  }

  if (validFrom) {
    validityConditions.push({
      OR: [
        {
          validUntil: null,
        },

        {
          validUntil: {
            gte: validFrom,
          },
        },
      ],
    })
  }

  const conflictingSchedules =
    await prisma.classSchedule.findMany({
      where: {
        gymId: input.gymId,
        active: true,
        weekday: input.weekday,

        ...(input.ignoredClassScheduleId
          ? {
              id: {
                not: input.ignoredClassScheduleId,
              },
            }
          : {}),

        /*
         * Conflito de intervalo:
         *
         * horário existente começa antes do novo terminar
         * e termina depois do novo começar.
         */

        startTime: {
          lt: endTime,
        },

        endTime: {
          gt: startTime,
        },

        ...(validityConditions.length > 0
          ? {
              AND: validityConditions,
            }
          : {}),
      },

      select: {
        id: true,
        classGroupId: true,
        weekday: true,
        startTime: true,
        endTime: true,
        room: true,
        validFrom: true,
        validUntil: true,

        classGroup: {
          select: {
            id: true,
            name: true,

            professors: {
              select: {
                professorId: true,

                professor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

  /*
   * =========================================================
   * CONFLITO DA MESMA TURMA
   * =========================================================
   */

  const classGroupConflict =
    conflictingSchedules.find(
      (schedule) =>
        schedule.classGroupId === input.classGroupId,
    )

  if (classGroupConflict) {
    throw new AppError(
      'CLASS_SCHEDULE_GROUP_CONFLICT',
      409,
      `A turma já possui um horário conflitante entre ${serializeTime(
        classGroupConflict.startTime,
      )} e ${serializeTime(
        classGroupConflict.endTime,
      )}.`,
    )
  }

  /*
   * =========================================================
   * CONFLITO DO MESMO LOCAL
   * =========================================================
   */

  const normalizedRoom = normalizeRoom(input.room)

  if (normalizedRoom) {
    const roomConflict =
      conflictingSchedules.find(
        (schedule) =>
          normalizeRoom(schedule.room) ===
          normalizedRoom,
      )

    if (roomConflict) {
      throw new AppError(
        'CLASS_SCHEDULE_ROOM_CONFLICT',
        409,
        `O local "${input.room?.trim()}" já está sendo utilizado pela turma "${roomConflict.classGroup.name}" entre ${serializeTime(
          roomConflict.startTime,
        )} e ${serializeTime(
          roomConflict.endTime,
        )}.`,
      )
    }
  }

  /*
   * =========================================================
   * CONFLITO DE PROFESSOR
   * =========================================================
   */

  const professorIds = new Set(
    classGroup.professors.map(
      (relation) => relation.professorId,
    ),
  )

  if (professorIds.size === 0) {
    return
  }

  for (const schedule of conflictingSchedules) {
    const conflictingProfessor =
      schedule.classGroup.professors.find(
        (relation) =>
          professorIds.has(relation.professorId),
      )

    if (conflictingProfessor) {
      throw new AppError(
        'CLASS_SCHEDULE_PROFESSOR_CONFLICT',
        409,
        `O professor "${conflictingProfessor.professor.name}" já está vinculado à turma "${schedule.classGroup.name}" entre ${serializeTime(
          schedule.startTime,
        )} e ${serializeTime(
          schedule.endTime,
        )}.`,
      )
    }
  }
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

  const validOnDate = parseDate(validOn)

  const where: Prisma.ClassScheduleWhereInput = {
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

    /*
     * Os filtros de modalidade e professor precisam
     * permanecer no mesmo objeto classGroup.
     */

    ...(modalityId || professorId
      ? {
          classGroup: {
            ...(modalityId
              ? {
                  modalityId,
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
          },
        }
      : {}),

    ...(validOnDate
      ? {
          AND: [
            {
              OR: [
                {
                  validFrom: null,
                },

                {
                  validFrom: {
                    lte: validOnDate,
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
                    gte: validOnDate,
                  },
                },
              ],
            },
          ],
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

            {
              classGroup: {
                professors: {
                  some: {
                    professor: {
                      name: {
                        contains: search,
                        mode: 'insensitive',
                      },
                    },
                  },
                },
              },
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
    classSchedules: classSchedules.map(
      serializeClassSchedule,
    ),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function listClassGroupSchedules(
  gymId: string,
  classGroupId: string,
) {
  await getClassGroupFromGym(
    gymId,
    classGroupId,
  )

  const classSchedules =
    await prisma.classSchedule.findMany({
      where: {
        gymId,
        classGroupId,
      },

      orderBy: [
        {
          active: 'desc',
        },

        {
          weekday: 'asc',
        },

        {
          startTime: 'asc',
        },
      ],

      select: classScheduleSelect,
    })

  return classSchedules.map(
    serializeClassSchedule,
  )
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

  return serializeClassSchedule(classSchedule)
}

export async function createClassSchedule(
  gymId: string,
  input: CreateClassScheduleBody,
) {
  await ensureActiveClassGroup(
    gymId,
    input.classGroupId,
  )

  await ensureNoScheduleConflict({
    gymId,
    classGroupId: input.classGroupId,
    weekday: input.weekday,
    startTime: input.startTime,
    endTime: input.endTime,
    room: input.room,
    validFrom: input.validFrom,
    validUntil: input.validUntil,
  })

  const classSchedule =
    await prisma.classSchedule.create({
      data: {
        gymId,
        classGroupId: input.classGroupId,
        weekday: input.weekday,
        startTime: parseTime(input.startTime),
        endTime: parseTime(input.endTime),
        room: normalizeOptionalText(input.room),
        notes: normalizeOptionalText(input.notes),
        validFrom: parseDate(input.validFrom),
        validUntil: parseDate(input.validUntil),
      },

      select: classScheduleSelect,
    })

  return serializeClassSchedule(classSchedule)
}

export async function updateClassSchedule(
  gymId: string,
  classScheduleId: string,
  input: UpdateClassScheduleBody,
) {
  const currentClassSchedule =
    await getClassScheduleById(
      gymId,
      classScheduleId,
    )

  await ensureActiveClassGroup(
    gymId,
    input.classGroupId,
  )

  /*
   * Horários inativos podem ser editados livremente.
   * O conflito será validado quando forem reativados.
   */

  if (currentClassSchedule.active) {
    await ensureNoScheduleConflict({
      gymId,
      classGroupId: input.classGroupId,
      weekday: input.weekday,
      startTime: input.startTime,
      endTime: input.endTime,
      room: input.room,
      validFrom: input.validFrom,
      validUntil: input.validUntil,
      ignoredClassScheduleId:
        classScheduleId,
    })
  }

  const classSchedule =
    await prisma.classSchedule.update({
      where: {
        id: classScheduleId,
      },

      data: {
        classGroupId: input.classGroupId,
        weekday: input.weekday,
        startTime: parseTime(input.startTime),
        endTime: parseTime(input.endTime),
        room: normalizeOptionalText(input.room),
        notes: normalizeOptionalText(input.notes),
        validFrom: parseDate(input.validFrom),
        validUntil: parseDate(input.validUntil),
      },

      select: classScheduleSelect,
    })

  return serializeClassSchedule(classSchedule)
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

  if (
    input.active &&
    !currentClassSchedule.active
  ) {
    await ensureActiveClassGroup(
      gymId,
      currentClassSchedule.classGroupId,
    )

    await ensureNoScheduleConflict({
      gymId,
      classGroupId:
        currentClassSchedule.classGroupId,
      weekday: currentClassSchedule.weekday,
      startTime:
        currentClassSchedule.startTime,
      endTime: currentClassSchedule.endTime,
      room: currentClassSchedule.room,
      validFrom:
        currentClassSchedule.validFrom,
      validUntil:
        currentClassSchedule.validUntil,
      ignoredClassScheduleId:
        classScheduleId,
    })
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

  return serializeClassSchedule(classSchedule)
}