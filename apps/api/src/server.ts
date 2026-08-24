import Fastify from 'fastify'

import { env } from './config/env.js'
import { registerErrorHandlers } from './http/error-handler.js'
import { registerSecurityPlugins } from './plugins/security.js'
import { registerSwagger } from './plugins/swagger.js'
import { healthRoutes } from './routes/health.routes.js'

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

async function start() {
  try {
    const port = Number(process.env.PORT ?? env.API_PORT)

    await app.listen({
      port,
      host: '0.0.0.0',
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void start()