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