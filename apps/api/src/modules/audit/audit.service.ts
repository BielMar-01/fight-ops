import type {
  Prisma,
} from '../../generated/prisma/client.js'

import {
  prisma,
} from '../../database/prisma.js'

import {
  sanitizeAuditData,
} from './audit.sanitizer.js'

import type {
  AuditJsonValue,
} from './audit.sanitizer.js'

import type {
  CreateAuditLogInput,
  ListAuditLogsInput,
} from './audit.types.js'

function toPrismaJson(
  value:
    | AuditJsonValue
    | undefined,
):
  | Prisma.InputJsonValue
  | undefined {
  if (
    value === undefined
  ) {
    return undefined
  }

  return value as Prisma.InputJsonValue
}

function parseStartDate(
  value?: string,
) {
  if (!value) {
    return undefined
  }

  return new Date(
    `${value}T00:00:00.000Z`,
  )
}

function parseEndDate(
  value?: string,
) {
  if (!value) {
    return undefined
  }

  return new Date(
    `${value}T23:59:59.999Z`,
  )
}

export async function createAuditLog(
  input: CreateAuditLogInput,
) {
  try {
    const oldValues =
      toPrismaJson(
        sanitizeAuditData(
          input.oldValues,
        ),
      )

    const newValues =
      toPrismaJson(
        sanitizeAuditData(
          input.newValues,
        ),
      )

    const metadata =
      toPrismaJson(
        sanitizeAuditData(
          input.metadata,
        ),
      )

    const auditLog =
      await prisma.auditLog.create({
        data: {
          gymId:
            input.gymId ??
            null,

          userId:
            input.userId ??
            null,

          action:
            input.action,

          entity:
            input.entity,

          entityId:
            input.entityId ??
            null,

          ...(oldValues !==
            undefined
            ? {
                oldValues,
              }
            : {}),

          ...(newValues !==
            undefined
            ? {
                newValues,
              }
            : {}),

          ...(metadata !==
            undefined
            ? {
                metadata,
              }
            : {}),

          ipAddress:
            input.ipAddress ??
            null,

          userAgent:
            input.userAgent ??
            null,
        },
      })

    return auditLog
  } catch (error) {
    console.error(
      'Failed to create audit log.',
      {
        action:
          input.action,

        entity:
          input.entity,

        entityId:
          input.entityId ??
          null,

        error,
      },
    )

    return null
  }
}

export async function listAuditLogs(
  gymId: string,
  input: ListAuditLogsInput,
) {
  const skip =
    (input.page - 1) *
    input.limit

  const startDate =
    parseStartDate(
      input.startDate,
    )

  const endDate =
    parseEndDate(
      input.endDate,
    )

  const where: Prisma.AuditLogWhereInput =
    {
      gymId,

      ...(input.action
        ? {
            action:
              input.action,
          }
        : {}),

      ...(input.entity
        ? {
            entity:
              input.entity,
          }
        : {}),

      ...(input.userId
        ? {
            userId:
              input.userId,
          }
        : {}),

      ...(
        startDate ||
        endDate
          ? {
              createdAt: {
                ...(startDate
                  ? {
                      gte:
                        startDate,
                    }
                  : {}),

                ...(endDate
                  ? {
                      lte:
                        endDate,
                    }
                  : {}),
              },
            }
          : {}
      ),
    }

  const [
    auditLogs,
    total,
  ] =
    await prisma.$transaction([
      prisma.auditLog.findMany({
        where,

        orderBy: {
          createdAt:
            'desc',
        },

        skip,

        take:
          input.limit,

        select: {
          id: true,
          gymId: true,
          userId: true,
          action: true,
          entity: true,
          entityId: true,
          oldValues: true,
          newValues: true,
          metadata: true,
          ipAddress: true,
          userAgent: true,
          createdAt: true,

          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),

      prisma.auditLog.count({
        where,
      }),
    ])

  return {
    auditLogs,

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