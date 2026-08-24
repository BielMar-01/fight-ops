import type { FastifyInstance } from 'fastify'

import { prisma } from '../database/prisma.js'

export async function databaseTestRoutes(app: FastifyInstance) {
  app.get(
    '/database-test',
    {
      schema: {
        tags: ['Health'],

        summary: 'Verificar conexão com o PostgreSQL',

        description:
          'Executa uma consulta simples para confirmar a comunicação entre a API FightOps, Prisma e PostgreSQL.',

        response: {
          200: {
            type: 'object',

            properties: {
              status: {
                type: 'string',
                example: 'ok',
              },

              database: {
                type: 'string',
                example: 'connected',
              },
            },

            required: ['status', 'database'],
          },
        },
      },
    },

    async () => {
      await prisma.$queryRaw`SELECT 1`

      return {
        status: 'ok',
        database: 'connected',
      }
    },
  )
}