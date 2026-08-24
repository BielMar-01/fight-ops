import Fastify from 'fastify'

import { env } from './config/env.js'
import { registerErrorHandlers } from './http/error-handler.js'
import { registerSecurityPlugins } from './plugins/security.js'
import { registerSwagger } from './plugins/swagger.js'
import { databaseTestRoutes } from './routes/database-test.routes.js'
import { healthRoutes } from './routes/health.routes.js'

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,

      redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers.set-cookie'],

        censor: '[REDACTED]',
      },
    },
  })

  registerErrorHandlers(app)

  app.register(registerSecurityPlugins)
  app.register(registerSwagger)

  app.register(healthRoutes)
  app.register(databaseTestRoutes)

  return app
}
