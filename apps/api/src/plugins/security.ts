import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

import type {
  FastifyInstance,
} from 'fastify'

import {
  env,
} from '../config/env.js'

function isLocalDevelopmentOrigin(
  origin: string,
) {
  if (
    env.NODE_ENV !==
    'development'
  ) {
    return false
  }

  try {
    const url =
      new URL(origin)

    return (
      url.protocol ===
        'http:' &&
      (
        url.hostname ===
          'localhost' ||
        url.hostname ===
          '127.0.0.1'
      )
    )
  } catch {
    return false
  }
}

export async function registerSecurityPlugins(
  app: FastifyInstance,
) {
  await app.register(
    helmet,
  )

  const allowedOrigins = [
    env.FRONTEND_URL,
  ].filter(Boolean)

  await app.register(
    cors,
    {
      origin(
        origin,
        callback,
      ) {
        if (!origin) {
          callback(
            null,
            true,
          )

          return
        }

        if (
          allowedOrigins.includes(
            origin,
          )
        ) {
          callback(
            null,
            true,
          )

          return
        }

        if (
          isLocalDevelopmentOrigin(
            origin,
          )
        ) {
          callback(
            null,
            true,
          )

          return
        }

        callback(
          new Error(
            `Origin ${origin} is not allowed by CORS.`,
          ),
          false,
        )
      },

      credentials:
        true,

      methods: [
        'GET',
        'HEAD',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ],

      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
      ],
    },
  )

  await app.register(
    rateLimit,
    {
      global:
        true,

      max:
        100,

      timeWindow:
        '1 minute',
    },
  )
}