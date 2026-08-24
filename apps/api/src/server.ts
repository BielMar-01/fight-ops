import { buildApp } from './application.js'
import { env } from './config/env.js'

const app = buildApp()

async function start() {
  try {
    await app.listen({
      port: env.API_PORT,
      host: '0.0.0.0',
    })

    app.log.info(
      {
        port: env.API_PORT,
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