type AuditJsonPrimitive =
  | string
  | number
  | boolean
  | null

export type AuditJsonValue =
  | AuditJsonPrimitive
  | AuditJsonValue[]
  | {
      [key: string]:
        AuditJsonValue
    }

const SENSITIVE_KEYS =
  new Set([
    'password',
    'passwordHash',

    'currentPassword',
    'newPassword',
    'confirmPassword',

    'token',
    'accessToken',
    'refreshToken',

    'tokenHash',

    'resetToken',
    'resetTokenHash',

    'code',
    'codeHash',

    'authorization',

    'jwt',
    'jwtSecret',

    'cookie',
    'cookies',

    'databaseUrl',
    'directUrl',

    'smtpPassword',
  ])

function normalizeKey(
  key: string,
) {
  return key
    .replace(
      /[_-]/g,
      '',
    )
    .toLowerCase()
}

const NORMALIZED_SENSITIVE_KEYS =
  new Set(
    Array.from(
      SENSITIVE_KEYS,
    ).map(
      normalizeKey,
    ),
  )

function isSensitiveKey(
  key: string,
) {
  return NORMALIZED_SENSITIVE_KEYS.has(
    normalizeKey(
      key,
    ),
  )
}

function isPlainObject(
  value: unknown,
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      'object' &&
    value !== null &&
    !Array.isArray(
      value,
    ) &&
    !(value instanceof Date)
  )
}

function sanitizeValue(
  value: unknown,
): AuditJsonValue {
  if (
    value === null ||
    value === undefined
  ) {
    return null
  }

  if (
    typeof value ===
    'string'
  ) {
    return value
  }

  if (
    typeof value ===
    'number'
  ) {
    if (
      Number.isFinite(
        value,
      )
    ) {
      return value
    }

    return String(
      value,
    )
  }

  if (
    typeof value ===
    'boolean'
  ) {
    return value
  }

  if (
    typeof value ===
    'bigint'
  ) {
    return value.toString()
  }

  if (
    value instanceof Date
  ) {
    return value.toISOString()
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return value.map(
      (item) =>
        sanitizeValue(
          item,
        ),
    )
  }

  if (
    isPlainObject(
      value,
    )
  ) {
    const sanitizedObject: {
      [key: string]:
        AuditJsonValue
    } = {}

    for (
      const [
        key,
        nestedValue,
      ] of Object.entries(
        value,
      )
    ) {
      if (
        isSensitiveKey(
          key,
        )
      ) {
        sanitizedObject[
          key
        ] =
          '[REDACTED]'

        continue
      }

      sanitizedObject[
        key
      ] =
        sanitizeValue(
          nestedValue,
        )
    }

    return sanitizedObject
  }

  return String(
    value,
  )
}

export function sanitizeAuditData(
  value: unknown,
):
  | AuditJsonValue
  | undefined {
  if (
    value === undefined ||
    value === null
  ) {
    return undefined
  }

  return sanitizeValue(
    value,
  )
}