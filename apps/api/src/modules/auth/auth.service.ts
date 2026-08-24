import { prisma } from '../../database/prisma.js'
import { AppError } from '../../http/app-error.js'

import { hashPassword } from './password.js'

import type { RegisterInput } from './auth.schemas.js'

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