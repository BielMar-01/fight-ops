import type { FastifyReply, FastifyRequest } from 'fastify'

import { AppError } from '../../http/app-error.js'

import { verifyAccessToken } from './token.js'

export interface AuthRequestUser {
  id: string
  email: string
  globalRole: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthRequestUser
  }
}

export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
) {
  const authorization = request.headers.authorization

  if (!authorization) {
    throw new AppError(
      'AUTH_TOKEN_REQUIRED',
      401,
      'Token de acesso não informado.',
    )
  }

  const [scheme, token] = authorization.split(' ')

  if (scheme !== 'Bearer' || !token) {
    throw new AppError(
      'INVALID_AUTH_HEADER',
      401,
      'Formato do token de acesso inválido.',
    )
  }

  const payload = await verifyAccessToken(token)

  if (
    !payload.sub ||
    typeof payload.email !== 'string' ||
    typeof payload.globalRole !== 'string'
  ) {
    throw new AppError(
      'INVALID_ACCESS_TOKEN',
      401,
      'Token de acesso inválido ou expirado.',
    )
  }

  request.user = {
    id: payload.sub,
    email: payload.email,
    globalRole: payload.globalRole,
  }
}