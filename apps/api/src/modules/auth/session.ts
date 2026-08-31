import {
  createHash,
  randomBytes,
} from 'node:crypto'

import {
  env,
} from '../../config/env.js'

import {
  prisma,
} from '../../database/prisma.js'

import {
  AppError,
} from '../../http/app-error.js'

function hashRefreshToken(
  token: string,
) {
  return createHash(
    'sha256',
  )
    .update(token)
    .digest('hex')
}

function generateRefreshToken() {
  return randomBytes(
    64,
  ).toString('hex')
}

function getRefreshExpirationDate() {
  const expiresAt =
    new Date()

  expiresAt.setDate(
    expiresAt.getDate() +
      env.JWT_REFRESH_EXPIRATION_DAYS,
  )

  return expiresAt
}

interface CreateSessionInput {
  userId: string
  userAgent?: string
  ipAddress?: string
}

export async function createSession(
  input: CreateSessionInput,
) {
  const refreshToken =
    generateRefreshToken()

  const tokenHash =
    hashRefreshToken(
      refreshToken,
    )

  await prisma.userSession.create({
    data: {
      userId:
        input.userId,

      tokenHash,

      userAgent:
        input.userAgent,

      ipAddress:
        input.ipAddress,

      expiresAt:
        getRefreshExpirationDate(),
    },
  })

  return refreshToken
}

export async function rotateSession(
  refreshToken: string,
) {
  const tokenHash =
    hashRefreshToken(
      refreshToken,
    )

  const session =
    await prisma.userSession.findUnique({
      where: {
        tokenHash,
      },

      include: {
        user:
          true,
      },
    })

  if (!session) {
    throw new AppError(
      'INVALID_REFRESH_TOKEN',
      401,
      'Sessão inválida ou expirada.',
    )
  }

  if (
    session.revokedAt
  ) {
    throw new AppError(
      'SESSION_REVOKED',
      401,
      'Sessão revogada.',
    )
  }

  if (
    session.expiresAt <=
    new Date()
  ) {
    throw new AppError(
      'SESSION_EXPIRED',
      401,
      'Sessão expirada.',
    )
  }

  if (
    !session.user.active
  ) {
    throw new AppError(
      'USER_INACTIVE',
      403,
      'Este usuário está inativo.',
    )
  }

  const newRefreshToken =
    generateRefreshToken()

  const newTokenHash =
    hashRefreshToken(
      newRefreshToken,
    )

  await prisma.userSession.update({
    where: {
      id:
        session.id,
    },

    data: {
      tokenHash:
        newTokenHash,

      lastUsedAt:
        new Date(),

      expiresAt:
        getRefreshExpirationDate(),
    },
  })

  return {
    refreshToken:
      newRefreshToken,

    user: {
      id:
        session.user.id,

      name:
        session.user.name,

      email:
        session.user.email,

      globalRole:
        session.user.globalRole,
    },
  }
}

export async function revokeSession(
  refreshToken: string,
) {
  const tokenHash =
    hashRefreshToken(
      refreshToken,
    )

  const session =
    await prisma.userSession.findUnique({
      where: {
        tokenHash,
      },

      select: {
        id: true,
        userId: true,
        revokedAt: true,
      },
    })

  if (!session) {
    return null
  }

  if (
    !session.revokedAt
  ) {
    await prisma.userSession.update({
      where: {
        id:
          session.id,
      },

      data: {
        revokedAt:
          new Date(),
      },
    })
  }

  return {
    userId:
      session.userId,
  }
}