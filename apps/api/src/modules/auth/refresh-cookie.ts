import type { FastifyReply } from 'fastify'

import { env } from '../../config/env.js'

export const REFRESH_TOKEN_COOKIE_NAME = 'fightops_refresh_token'

function getRefreshCookieOptions() {
  const isProduction = env.NODE_ENV === 'production'

  return {
    path: '/auth',
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
  }
}

export function setRefreshTokenCookie(
  reply: FastifyReply,
  refreshToken: string,
) {
  const maxAge =
    env.JWT_REFRESH_EXPIRATION_DAYS *
    24 *
    60 *
    60

  reply.setCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    {
      ...getRefreshCookieOptions(),
      maxAge,
    },
  )
}

export function clearRefreshTokenCookie(
  reply: FastifyReply,
) {
  reply.clearCookie(
    REFRESH_TOKEN_COOKIE_NAME,
    getRefreshCookieOptions(),
  )
}