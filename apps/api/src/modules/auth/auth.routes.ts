import type { FastifyInstance } from 'fastify'

import { AppError } from '../../http/app-error.js'

import { authenticate } from './authenticate.js'
import { loginSchema, registerSchema } from './auth.schemas.js'
import {
  authenticateUser,
  getAuthenticatedUser,
  registerUser,
} from './auth.service.js'
import { signAccessToken } from './token.js'

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
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
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

  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Autenticar usuário',

        body: {
          type: 'object',
          required: ['email', 'password'],

          properties: {
            email: {
              type: 'string',
              format: 'email',
            },

            password: {
              type: 'string',
              minLength: 1,
            },
          },
        },

        response: {
          200: {
            type: 'object',

            properties: {
              accessToken: {
                type: 'string',
              },

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

                  globalRole: {
                    type: 'string',
                  },
                },

                required: [
                  'id',
                  'name',
                  'email',
                  'globalRole',
                ],
              },
            },

            required: [
              'accessToken',
              'user',
            ],
          },
        },
      },
    },

    async (request, reply) => {
      const input = loginSchema.parse(request.body)

      const user = await authenticateUser(input)

      const accessToken = await signAccessToken({
        userId: user.id,
        email: user.email,
        globalRole: user.globalRole,
      })

      return reply.status(200).send({
        accessToken,
        user,
      })
    },
  )

  app.get(
    '/auth/me',
    {
      preHandler: authenticate,

      schema: {
        tags: ['Auth'],
        summary: 'Consultar usuário autenticado',

        security: [
          {
            bearerAuth: [],
          },
        ],

        response: {
          200: {
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
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                  },

                  avatarUrl: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
                  },

                  globalRole: {
                    type: 'string',
                  },

                  active: {
                    type: 'boolean',
                  },

                  emailVerifiedAt: {
                    anyOf: [
                      {
                        type: 'string',
                      },
                      {
                        type: 'null',
                      },
                    ],
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
                  'avatarUrl',
                  'globalRole',
                  'active',
                  'emailVerifiedAt',
                  'createdAt',
                ],
              },
            },

            required: ['user'],
          },

          401: {
            type: 'object',
            additionalProperties: true,
          },

          403: {
            type: 'object',
            additionalProperties: true,
          },

          404: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
    },

    async (request, reply) => {
      const authenticatedUser = request.user

      if (!authenticatedUser) {
        throw new AppError(
          'UNAUTHENTICATED',
          401,
          'Usuário não autenticado.',
        )
      }

      const user = await getAuthenticatedUser(
        authenticatedUser.id,
      )

      return reply.status(200).send({
        user,
      })
    },
  )
}