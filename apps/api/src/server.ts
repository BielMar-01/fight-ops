import { buildApp } from './app.js'
import { env } from './config/env.js'

const app = buildApp()

const host = '0.0.0.0'

async function start() {
  try {
    await app.listen({
      port: env.API_PORT,
      host,
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
