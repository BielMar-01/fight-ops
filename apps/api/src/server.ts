import Fastify from 'fastify'

const app = Fastify({
  logger: true,
})

app.get('/', async () => {
  return {
    status: 'ok',
    service: 'fightops-api',
    environment: 'vercel',
  }
})

app.get('/health', async () => {
  return {
    status: 'ok',
    service: 'fightops-api',
  }
})

export default app