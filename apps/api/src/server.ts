import Fastify from 'fastify'

import { env } from './config/env.js'
import { registerErrorHandlers } from './http/error-handler.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { registerSecurityPlugins } from './plugins/security.js'
import { registerSwagger } from './plugins/swagger.js'
import { databaseTestRoutes } from './routes/database-test.routes.js'
import { healthRoutes } from './routes/health.routes.js'

const app = Fastify({
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
})

// Tratamento global de erros
registerErrorHandlers(app)

// Plugins globais
registerSecurityPlugins(app)
registerSwagger(app)

// Rota raiz
app.get('/', async () => {
  return {
    status: 'ok',
    service: 'fightops-api',
    environment: env.NODE_ENV,
  }
})

// Rotas da aplicação
app.register(healthRoutes)
app.register(databaseTestRoutes)
app.register(authRoutes)

async function start() {
  try {
    const port = Number(process.env.PORT ?? env.API_PORT)

    await app.listen({
      port,
      host: '0.0.0.0',
    })

    app.log.info(
      {
        port,
        environment: env.NODE_ENV,
      },
      'FightOps API started',
    )
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void start()