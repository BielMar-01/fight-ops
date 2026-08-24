import Fastify from 'fastify'

import {
  configureApp,
  getFastifyOptions,
} from './application.js'
import { env } from './config/env.js'

const app = Fastify(
  getFastifyOptions(),
)

configureApp(app)

async function start() {
  try {
    const port = Number(
      process.env.PORT ??
        env.API_PORT,
    )

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