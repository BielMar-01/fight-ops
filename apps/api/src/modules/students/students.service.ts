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
  CreateStudentInput,
  ListStudentsInput,
  UpdateStudentInput,
  UpdateStudentStatusInput,
} from './students.types.js'

interface StudentAuditContext {
  userId: string
  ipAddress?: string | null
  userAgent?: string | null
}

function normalizeOptionalText(
  value?: string | null,
) {
  const normalized =
    value?.trim()

  return normalized ||
    null
}

function parseOptionalDate(
  value?: string | null,
) {
  if (!value) {
    return null
  }

  return new Date(
    `${value}T00:00:00.000Z`,
  )
}

function parseJoinedAt(
  value?: string | null,
) {
  if (!value) {
    return new Date()
  }

  return new Date(
    `${value}T00:00:00.000Z`,
  )
}

function parseOptionalJoinedAt(
  value?: string | null,
) {
  if (!value) {
    return undefined
  }

  return new Date(
    `${value}T00:00:00.000Z`,
  )
}

export async function listStudents(
  gymId: string,
  input: ListStudentsInput,
) {
  const skip =
    (input.page - 1) *
    input.limit

  const search =
    input.search?.trim()

  const where = {
    gymId,

    ...(typeof input.active ===
    'boolean'
      ? {
          active:
            input.active,
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
                  'insensitive' as const,
              },
            },

            {
              email: {
                contains:
                  search,

                mode:
                  'insensitive' as const,
              },
            },

            {
              phone: {
                contains:
                  search,

                mode:
                  'insensitive' as const,
              },
            },
          ],
        }
      : {}),
  }

  const [
    students,
    total,
  ] =
    await prisma.$transaction([
      prisma.student.findMany({
        where,

        orderBy: {
          name:
            'asc',
        },

        skip,

        take:
          input.limit,

        select: {
          id: true,
          gymId: true,
          userId: true,
          name: true,
          email: true,
          phone: true,
          birthDate: true,
          emergencyContact: true,
          emergencyPhone: true,
          notes: true,
          active: true,
          joinedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),

      prisma.student.count({
        where,
      }),
    ])

  return {
    students,

    pagination: {
      page:
        input.page,

      limit:
        input.limit,

      total,

      totalPages:
        Math.ceil(
          total /
            input.limit,
        ),
    },
  }
}

export async function getStudentById(
  gymId: string,
  studentId: string,
) {
  const student =
    await prisma.student.findFirst({
      where: {
        id:
          studentId,

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
        emergencyContact: true,
        emergencyPhone: true,
        notes: true,
        active: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

  if (!student) {
    throw new AppError(
      'STUDENT_NOT_FOUND',
      404,
      'Aluno não encontrado.',
    )
  }

  return student
}

export async function createStudent(
  gymId: string,
  input: CreateStudentInput,
  auditContext: StudentAuditContext,
) {
  const student =
    await prisma.student.create({
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

        emergencyContact:
          normalizeOptionalText(
            input.emergencyContact,
          ),

        emergencyPhone:
          normalizeOptionalText(
            input.emergencyPhone,
          ),

        notes:
          normalizeOptionalText(
            input.notes,
          ),

        joinedAt:
          parseJoinedAt(
            input.joinedAt,
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
        emergencyContact: true,
        emergencyPhone: true,
        notes: true,
        active: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

  await createAuditLog({
    gymId,

    userId:
      auditContext.userId,

    action:
      'CREATE',

    entity:
      'STUDENT',

    entityId:
      student.id,

    newValues:
      student,

    metadata: {
      source:
        'students',
    },

    ipAddress:
      auditContext.ipAddress,

    userAgent:
      auditContext.userAgent,
  })

  return student
}

export async function updateStudent(
  gymId: string,
  studentId: string,
  input: UpdateStudentInput,
  auditContext: StudentAuditContext,
) {
  const currentStudent =
    await getStudentById(
      gymId,
      studentId,
    )

  const joinedAt =
    parseOptionalJoinedAt(
      input.joinedAt,
    )

  const student =
    await prisma.student.update({
      where: {
        id:
          studentId,
      },

      data: {
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

        emergencyContact:
          normalizeOptionalText(
            input.emergencyContact,
          ),

        emergencyPhone:
          normalizeOptionalText(
            input.emergencyPhone,
          ),

        notes:
          normalizeOptionalText(
            input.notes,
          ),

        ...(joinedAt
          ? {
              joinedAt,
            }
          : {}),
      },

      select: {
        id: true,
        gymId: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        emergencyContact: true,
        emergencyPhone: true,
        notes: true,
        active: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

  await createAuditLog({
    gymId,

    userId:
      auditContext.userId,

    action:
      'UPDATE',

    entity:
      'STUDENT',

    entityId:
      student.id,

    oldValues:
      currentStudent,

    newValues:
      student,

    metadata: {
      source:
        'students',
    },

    ipAddress:
      auditContext.ipAddress,

    userAgent:
      auditContext.userAgent,
  })

  return student
}

export async function updateStudentStatus(
  gymId: string,
  studentId: string,
  input: UpdateStudentStatusInput,
  auditContext: StudentAuditContext,
) {
  const currentStudent =
    await getStudentById(
      gymId,
      studentId,
    )

  if (
    currentStudent.active ===
    input.active
  ) {
    throw new AppError(
      input.active
        ? 'STUDENT_ALREADY_ACTIVE'
        : 'STUDENT_ALREADY_INACTIVE',
      409,
      input.active
        ? 'O aluno já está ativo.'
        : 'O aluno já está inativo.',
    )
  }

  const student =
    await prisma.student.update({
      where: {
        id:
          studentId,
      },

      data: {
        active:
          input.active,
      },

      select: {
        id: true,
        gymId: true,
        userId: true,
        name: true,
        email: true,
        phone: true,
        birthDate: true,
        emergencyContact: true,
        emergencyPhone: true,
        notes: true,
        active: true,
        joinedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })

  await createAuditLog({
    gymId,

    userId:
      auditContext.userId,

    action:
      'STATUS_CHANGE',

    entity:
      'STUDENT',

    entityId:
      student.id,

    oldValues: {
      active:
        currentStudent.active,
    },

    newValues: {
      active:
        student.active,
    },

    metadata: {
      source:
        'students',

      studentName:
        student.name,
    },

    ipAddress:
      auditContext.ipAddress,

    userAgent:
      auditContext.userAgent,
  })

  return student
}