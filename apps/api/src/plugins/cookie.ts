import cookie from '@fastify/cookie'

import type { FastifyInstance } from 'fastify'

export function registerCookiePlugin(app: FastifyInstance) {
  app.register(cookie)
}