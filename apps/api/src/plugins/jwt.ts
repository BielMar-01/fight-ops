import jwt from '@fastify/jwt'

import type { FastifyInstance } from 'fastify'

import { env } from '../config/env.js'

export function registerJwt(app: FastifyInstance) {
  if (!env.JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is required to initialize authentication.')
  }

  app.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
  })
}