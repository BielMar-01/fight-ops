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
          'Confirma a comunicação entre a API FightOps, Prisma e PostgreSQL e consulta as tabelas principais do núcleo multi-tenant.',

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

              users: {
                type: 'number',
                example: 0,
              },

              gyms: {
                type: 'number',
                example: 0,
              },

              memberships: {
                type: 'number',
                example: 0,
              },
            },

            required: ['status', 'database', 'users', 'gyms', 'memberships'],
          },
        },
      },
    },

    async () => {
      const [users, gyms, memberships] = await Promise.all([
        prisma.user.count(),
        prisma.gym.count(),
        prisma.gymMembership.count(),
      ])

      return {
        status: 'ok',
        database: 'connected',
        users,
        gyms,
        memberships,
      }
    },
  )
}