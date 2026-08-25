import Fastify from 'fastify'

import type { FastifyInstance } from 'fastify'

import { env } from './config/env.js'
import { registerErrorHandlers } from './http/error-handler.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { registerCookiePlugin } from './plugins/cookie.js'
import { registerSecurityPlugins } from './plugins/security.js'
import { registerSwagger } from './plugins/swagger.js'
import { databaseTestRoutes } from './routes/database-test.routes.js'
import { healthRoutes } from './routes/health.routes.js'

export function getFastifyOptions() {
  return {
    logger: {
      level: env.LOG_LEVEL,

      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers.set-cookie',
        ],

        censor: '[REDACTED]',
      },
    },
  }
}

export function configureApp(
  app: FastifyInstance,
) {
  registerErrorHandlers(app)

  registerCookiePlugin(app)
  registerSecurityPlugins(app)
  registerSwagger(app)

  app.get('/', async () => {
    return {
      status: 'ok',
      service: 'fightops-api',
      environment: env.NODE_ENV,
    }
  })

  app.register(healthRoutes)
  app.register(databaseTestRoutes)
  app.register(authRoutes)

  return app
}

export function buildApp() {
  const app = Fastify(
    getFastifyOptions(),
  )

  return configureApp(app)
}