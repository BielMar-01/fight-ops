import { prisma } from '../../database/prisma.js'
import { AppError } from '../../http/app-error.js'

import { hashPassword, verifyPassword } from './password.js'

import type { LoginInput, RegisterInput } from './auth.schemas.js'

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })

  if (existingUser) {
    throw new AppError(
      'USER_EMAIL_ALREADY_EXISTS',
      409,
      'Já existe um usuário cadastrado com este e-mail.',
    )
  }

  const passwordHash = await hashPassword(input.password)

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      globalRole: true,
      active: true,
      createdAt: true,
    },
  })

  return user
}

export async function authenticateUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })

  if (!user) {
    throw new AppError(
      'INVALID_CREDENTIALS',
      401,
      'E-mail ou senha inválidos.',
    )
  }

  const passwordMatches = await verifyPassword(
    user.passwordHash,
    input.password,
  )

  if (!passwordMatches) {
    throw new AppError(
      'INVALID_CREDENTIALS',
      401,
      'E-mail ou senha inválidos.',
    )
  }

  if (!user.active) {
    throw new AppError(
      'USER_INACTIVE',
      403,
      'Este usuário está inativo.',
    )
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    globalRole: user.globalRole,
  }
}

export async function getAuthenticatedUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatarUrl: true,
      globalRole: true,
      active: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new AppError(
      'USER_NOT_FOUND',
      404,
      'Usuário não encontrado.',
    )
  }

  if (!user.active) {
    throw new AppError(
      'USER_INACTIVE',
      403,
      'Este usuário está inativo.',
    )
  }

  return user
}