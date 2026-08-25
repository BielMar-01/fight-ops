import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

import type { FastifyInstance } from 'fastify'

import { env } from '../config/env.js'

export async function registerSecurityPlugins(
  app: FastifyInstance,
) {
  await app.register(helmet)

  const allowedOrigins = [
    'http://localhost:5173',
    env.FRONTEND_URL,
  ]

  await app.register(cors, {
    origin(origin, callback) {
      if (!origin) {
        callback(null, true)
        return
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true)
        return
      }

      callback(
        new Error(
          `Origin ${origin} is not allowed by CORS.`,
        ),
        false,
      )
    },

    credentials: true,
  })

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  })
}