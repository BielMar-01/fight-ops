import { SignJWT, jwtVerify } from 'jose'

import { env } from '../../config/env.js'
import { AppError } from '../../http/app-error.js'

import type { GlobalRole } from '../../generated/prisma/enums.js'

const textEncoder = new TextEncoder()

function getAccessTokenSecret() {
  if (!env.JWT_ACCESS_SECRET) {
    throw new AppError(
      'AUTH_NOT_CONFIGURED',
      503,
      'O serviço de autenticação não está configurado.',
    )
  }

  return textEncoder.encode(
    env.JWT_ACCESS_SECRET,
  )
}

interface AccessTokenPayload {
  userId: string
  email: string
  globalRole: GlobalRole
}

export async function signAccessToken(
  payload: AccessTokenPayload,
) {
  return new SignJWT({
    email: payload.email,
    globalRole: payload.globalRole,
  })
    .setProtectedHeader({
      alg: 'HS256',
      typ: 'JWT',
    })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(
      env.JWT_ACCESS_EXPIRATION,
    )
    .sign(
      getAccessTokenSecret(),
    )
}

export async function verifyAccessToken(
  token: string,
) {
  try {
    const { payload } = await jwtVerify(
      token,
      getAccessTokenSecret(),
    )

    return payload
  } catch {
    throw new AppError(
      'INVALID_ACCESS_TOKEN',
      401,
      'Token de acesso inválido ou expirado.',
    )
  }
}