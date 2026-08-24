import type { FastifyInstance } from 'fastify'

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],

        summary: 'Verificar disponibilidade da API',

        description: 'Retorna o estado atual da API FightOps.',

        response: {
          200: {
            type: 'object',

            properties: {
              status: {
                type: 'string',
                example: 'ok',
              },

              service: {
                type: 'string',
                example: 'fightops-api',
              },
            },

            required: ['status', 'service'],
          },
        },
      },
    },

    async () => {
      return {
        status: 'ok',
        service: 'fightops-api',
      }
    },
  )
}