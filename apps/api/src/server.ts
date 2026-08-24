import Fastify from 'fastify'

const app = Fastify({
  logger: true,
})

app.get('/', async () => {
  return {
    status: 'ok',
    service: 'fightops-api',
    environment: process.env.NODE_ENV ?? 'development',
  }
})

app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'fightops-api',
  }
})

async function start() {
  try {
    await app.listen({
      port: Number(process.env.PORT ?? 3000),
      host: '0.0.0.0',
    })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

void start()