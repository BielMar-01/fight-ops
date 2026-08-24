import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'

import type { FastifyInstance } from 'fastify'

import { env } from '../config/env.js'

export async function registerSecurityPlugins(app: FastifyInstance) {
  await app.register(helmet)

  await app.register(cors, {
    origin: env.FRONTEND_URL,
    credentials: true,
  })

  await app.register(rateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
  })
}