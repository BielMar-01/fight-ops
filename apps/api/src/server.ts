import { buildApp } from './app.js'

const app = buildApp()

const port = Number(process.env.API_PORT ?? 3333)
const host = '0.0.0.0'

async function start() {
  try {
    await app.listen({
      port,
      host,
    })

    app.log.info(`FightOps API running on port ${port}`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void start()
