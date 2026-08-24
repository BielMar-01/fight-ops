import type { FastifyInstance } from 'fastify'

export async function authRoutes(app: FastifyInstance) {
  app.get(
    '/auth/status',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Verificar disponibilidade do módulo de autenticação',
      },
    },
    async () => {
      return {
        status: 'ok',
        module: 'auth',
      }
    },
  )
}