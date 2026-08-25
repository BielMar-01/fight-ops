import {
  createHash,
  randomBytes,
  randomInt,
} from 'node:crypto'

import { env } from '../../config/env.js'
import { prisma } from '../../database/prisma.js'
import { AppError } from '../../http/app-error.js'

import { sendPasswordResetCode } from './email.service.js'
import { hashPassword } from './password.js'

import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyPasswordResetInput,
} from './auth.schemas.js'

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function generateCode() {
  return randomInt(100000, 1000000).toString()
}

function generateResetToken() {
  return randomBytes(64).toString('hex')
}

function getCodeExpirationDate() {
  const expiresAt = new Date()

  expiresAt.setMinutes(
    expiresAt.getMinutes() + env.PASSWORD_RESET_CODE_EXPIRATION_MINUTES,
  )

  return expiresAt
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })

  if (!user || !user.active) {
    return
  }

  await prisma.passwordReset.deleteMany({
    where: {
      userId: user.id,
      usedAt: null,
    },
  })

  const code = generateCode()

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      codeHash: hashValue(code),
      expiresAt: getCodeExpirationDate(),
    },
  })

  await sendPasswordResetCode({
    email: user.email,
    name: user.name,
    code,
  })
}

export async function verifyPasswordResetCode(input: VerifyPasswordResetInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })

  if (!user) {
    throw new AppError(
      'INVALID_RESET_CODE',
      400,
      'Código inválido ou expirado.',
    )
  }

  const passwordReset = await prisma.passwordReset.findFirst({
    where: {
      userId: user.id,
      usedAt: null,
    },

    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!passwordReset || passwordReset.expiresAt <= new Date()) {
    throw new AppError(
      'INVALID_RESET_CODE',
      400,
      'Código inválido ou expirado.',
    )
  }

  if (passwordReset.attempts >= env.PASSWORD_RESET_MAX_ATTEMPTS) {
    throw new AppError(
      'RESET_CODE_ATTEMPTS_EXCEEDED',
      429,
      'Número máximo de tentativas excedido. Solicite um novo código.',
    )
  }

  const codeHash = hashValue(input.code)

  if (codeHash !== passwordReset.codeHash) {
    await prisma.passwordReset.update({
      where: {
        id: passwordReset.id,
      },

      data: {
        attempts: {
          increment: 1,
        },
      },
    })

    throw new AppError(
      'INVALID_RESET_CODE',
      400,
      'Código inválido ou expirado.',
    )
  }

  const resetToken = generateResetToken()

  await prisma.passwordReset.update({
    where: {
      id: passwordReset.id,
    },

    data: {
      verifiedAt: new Date(),
      resetTokenHash: hashValue(resetToken),
    },
  })

  return {
    resetToken,
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const resetTokenHash = hashValue(input.resetToken)

  const passwordReset = await prisma.passwordReset.findUnique({
    where: {
      resetTokenHash,
    },
  })

  if (
    !passwordReset ||
    !passwordReset.verifiedAt ||
    passwordReset.usedAt ||
    passwordReset.expiresAt <= new Date()
  ) {
    throw new AppError(
      'INVALID_RESET_TOKEN',
      400,
      'Token de redefinição inválido ou expirado.',
    )
  }

  const passwordHash = await hashPassword(input.newPassword)

  const now = new Date()

  await prisma.$transaction([
    prisma.user.update({
      where: {
        id: passwordReset.userId,
      },

      data: {
        passwordHash,
      },
    }),

    prisma.passwordReset.update({
      where: {
        id: passwordReset.id,
      },

      data: {
        usedAt: now,
      },
    }),

    prisma.userSession.updateMany({
      where: {
        userId: passwordReset.userId,
        revokedAt: null,
      },

      data: {
        revokedAt: now,
      },
    }),
  ])
}