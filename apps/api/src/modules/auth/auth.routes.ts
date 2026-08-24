import type { FastifyInstance } from 'fastify'

import { registerSchema } from './auth.schemas.js'
import { registerUser } from './auth.service.js'

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

  app.post(
    '/auth/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Cadastrar usuário',

        body: {
          type: 'object',
          required: ['name', 'email', 'password'],

          properties: {
            name: {
              type: 'string',
              minLength: 3,
              maxLength: 150,
            },

            email: {
              type: 'string',
              format: 'email',
              maxLength: 255,
            },

            password: {
              type: 'string',
              minLength: 8,
              maxLength: 128,
            },

            phone: {
              type: 'string',
              minLength: 8,
              maxLength: 30,
            },
          },
        },

        response: {
          201: {
            type: 'object',

            properties: {
              user: {
                type: 'object',

                properties: {
                  id: {
                    type: 'string',
                  },

                  name: {
                    type: 'string',
                  },

                  email: {
                    type: 'string',
                  },

                  phone: {
                    anyOf: [{ type: 'string' }, { type: 'null' }],
                  },

                  globalRole: {
                    type: 'string',
                  },

                  active: {
                    type: 'boolean',
                  },

                  createdAt: {
                    type: 'string',
                  },
                },

                required: [
                  'id',
                  'name',
                  'email',
                  'phone',
                  'globalRole',
                  'active',
                  'createdAt',
                ],
              },
            },

            required: ['user'],
          },

          400: {
            type: 'object',
            additionalProperties: true,
          },

          409: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },

    async (request, reply) => {
      const input = registerSchema.parse(request.body)

      const user = await registerUser(input)

      return reply.status(201).send({
        user,
      })
    },
  )
}