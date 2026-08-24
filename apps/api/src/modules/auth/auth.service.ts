import { prisma } from '../../database/prisma.js'

import { hashPassword } from './password.js'

import type { RegisterInput } from './auth.schemas.js'

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  })

  if (existingUser) {
    throw new Error('USER_EMAIL_ALREADY_EXISTS')
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