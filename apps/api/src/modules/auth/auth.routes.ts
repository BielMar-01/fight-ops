import type {
  FastifyInstance,
  FastifyRequest,
} from 'fastify'

import {
  AppError,
} from '../../http/app-error.js'

import {
  createAuditLog,
} from '../audit/audit.service.js'

import {
  authenticate,
} from './authenticate.js'

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyPasswordResetSchema,
} from './auth.schemas.js'

import {
  authenticateUser,
  getAuthenticatedUser,
  registerUser,
} from './auth.service.js'

import {
  requestPasswordReset,
  resetPassword,
  verifyPasswordResetCode,
} from './password-reset.service.js'

import {
  clearRefreshTokenCookie,
  REFRESH_TOKEN_COOKIE_NAME,
  setRefreshTokenCookie,
} from './refresh-cookie.js'

import {
  createSession,
  revokeSession,
  rotateSession,
} from './session.js'

import {
  signAccessToken,
} from './token.js'

function getRequestContext(
  request: FastifyRequest,
) {
  return {
    ipAddress:
      request.ip,

    userAgent:
      request.headers[
        'user-agent'
      ] ??
      null,
  }
}

export async function authRoutes(
  app: FastifyInstance,
) {
  app.get(
    '/auth/status',
    {
      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Verificar disponibilidade do módulo de autenticação',
      },
    },

    async () => {
      return {
        status:
          'ok',

        module:
          'auth',
      }
    },
  )

  app.post(
    '/auth/register',
    {
      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Cadastrar usuário',

        body: {
          type:
            'object',

          required: [
            'name',
            'email',
            'password',
          ],

          properties: {
            name: {
              type:
                'string',

              minLength:
                3,

              maxLength:
                150,
            },

            email: {
              type:
                'string',

              format:
                'email',

              maxLength:
                255,
            },

            password: {
              type:
                'string',

              minLength:
                8,

              maxLength:
                128,
            },

            phone: {
              type:
                'string',

              minLength:
                8,

              maxLength:
                30,
            },
          },
        },

        response: {
          201: {
            type:
              'object',

            properties: {
              user: {
                type:
                  'object',

                properties: {
                  id: {
                    type:
                      'string',
                  },

                  name: {
                    type:
                      'string',
                  },

                  email: {
                    type:
                      'string',
                  },

                  phone: {
                    anyOf: [
                      {
                        type:
                          'string',
                      },

                      {
                        type:
                          'null',
                      },
                    ],
                  },

                  globalRole: {
                    type:
                      'string',
                  },

                  active: {
                    type:
                      'boolean',
                  },

                  createdAt: {
                    type:
                      'string',
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

            required: [
              'user',
            ],
          },
        },
      },
    },

    async (
      request,
      reply,
    ) => {
      const input =
        registerSchema.parse(
          request.body,
        )

      const user =
        await registerUser(
          input,
        )

      return reply
        .status(201)
        .send({
          user,
        })
    },
  )

  app.post(
    '/auth/login',
    {
      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Autenticar usuário',

        body: {
          type:
            'object',

          required: [
            'email',
            'password',
          ],

          properties: {
            email: {
              type:
                'string',

              format:
                'email',
            },

            password: {
              type:
                'string',

              minLength:
                1,
            },
          },
        },

        response: {
          200: {
            type:
              'object',

            properties: {
              accessToken: {
                type:
                  'string',
              },

              user: {
                type:
                  'object',

                properties: {
                  id: {
                    type:
                      'string',
                  },

                  name: {
                    type:
                      'string',
                  },

                  email: {
                    type:
                      'string',
                  },

                  globalRole: {
                    type:
                      'string',
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

    async (
      request,
      reply,
    ) => {
      const input =
        loginSchema.parse(
          request.body,
        )

      const user =
        await authenticateUser(
          input,
        )

      const accessToken =
        await signAccessToken({
          userId:
            user.id,

          email:
            user.email,

          globalRole:
            user.globalRole,
        })

      const refreshToken =
        await createSession({
          userId:
            user.id,

          userAgent:
            request.headers[
              'user-agent'
            ],

          ipAddress:
            request.ip,
        })

      setRefreshTokenCookie(
        reply,
        refreshToken,
      )

      const requestContext =
        getRequestContext(
          request,
        )

      await createAuditLog({
        userId:
          user.id,

        action:
          'LOGIN',

        entity:
          'AUTH',

        entityId:
          user.id,

        metadata: {
          source:
            'auth-login',
        },

        ipAddress:
          requestContext.ipAddress,

        userAgent:
          requestContext.userAgent,
      })

      return reply
        .status(200)
        .send({
          accessToken,
          user,
        })
    },
  )

  app.post(
    '/auth/refresh',
    {
      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Renovar token de acesso',

        response: {
          200: {
            type:
              'object',

            properties: {
              accessToken: {
                type:
                  'string',
              },

              user: {
                type:
                  'object',

                properties: {
                  id: {
                    type:
                      'string',
                  },

                  name: {
                    type:
                      'string',
                  },

                  email: {
                    type:
                      'string',
                  },

                  globalRole: {
                    type:
                      'string',
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

    async (
      request,
      reply,
    ) => {
      const refreshToken =
        request.cookies[
          REFRESH_TOKEN_COOKIE_NAME
        ]

      if (!refreshToken) {
        throw new AppError(
          'REFRESH_TOKEN_REQUIRED',
          401,
          'Token de renovação não informado.',
        )
      }

      const result =
        await rotateSession(
          refreshToken,
        )

      const accessToken =
        await signAccessToken({
          userId:
            result.user.id,

          email:
            result.user.email,

          globalRole:
            result.user.globalRole,
        })

      setRefreshTokenCookie(
        reply,
        result.refreshToken,
      )

      return reply
        .status(200)
        .send({
          accessToken,

          user:
            result.user,
        })
    },
  )

  app.post(
    '/auth/logout',
    {
      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Encerrar sessão do usuário',

        response: {
          204: {
            type:
              'null',
          },
        },
      },
    },

    async (
      request,
      reply,
    ) => {
      const refreshToken =
        request.cookies[
          REFRESH_TOKEN_COOKIE_NAME
        ]

      if (refreshToken) {
        const revokedSession =
          await revokeSession(
            refreshToken,
          )

        if (
          revokedSession
        ) {
          const requestContext =
            getRequestContext(
              request,
            )

          await createAuditLog({
            userId:
              revokedSession.userId,

            action:
              'LOGOUT',

            entity:
              'AUTH',

            entityId:
              revokedSession.userId,

            metadata: {
              source:
                'auth-logout',
            },

            ipAddress:
              requestContext.ipAddress,

            userAgent:
              requestContext.userAgent,
          })
        }
      }

      clearRefreshTokenCookie(
        reply,
      )

      return reply
        .status(204)
        .send()
    },
  )

  app.get(
    '/auth/me',
    {
      preHandler:
        authenticate,

      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Consultar usuário autenticado',

        security: [
          {
            bearerAuth:
              [],
          },
        ],

        response: {
          200: {
            type:
              'object',

            properties: {
              user: {
                type:
                  'object',

                properties: {
                  id: {
                    type:
                      'string',
                  },

                  name: {
                    type:
                      'string',
                  },

                  email: {
                    type:
                      'string',
                  },

                  phone: {
                    anyOf: [
                      {
                        type:
                          'string',
                      },

                      {
                        type:
                          'null',
                      },
                    ],
                  },

                  avatarUrl: {
                    anyOf: [
                      {
                        type:
                          'string',
                      },

                      {
                        type:
                          'null',
                      },
                    ],
                  },

                  globalRole: {
                    type:
                      'string',
                  },

                  active: {
                    type:
                      'boolean',
                  },

                  emailVerifiedAt: {
                    anyOf: [
                      {
                        type:
                          'string',
                      },

                      {
                        type:
                          'null',
                      },
                    ],
                  },

                  createdAt: {
                    type:
                      'string',
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

            required: [
              'user',
            ],
          },
        },
      },
    },

    async (
      request,
      reply,
    ) => {
      const authenticatedUser =
        request.user

      if (
        !authenticatedUser
      ) {
        throw new AppError(
          'UNAUTHENTICATED',
          401,
          'Usuário não autenticado.',
        )
      }

      const user =
        await getAuthenticatedUser(
          authenticatedUser.id,
        )

      return reply
        .status(200)
        .send({
          user,
        })
    },
  )

  app.post(
    '/auth/password/forgot',
    {
      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Solicitar recuperação de senha',

        body: {
          type:
            'object',

          required: [
            'email',
          ],

          properties: {
            email: {
              type:
                'string',

              format:
                'email',
            },
          },
        },

        response: {
          202: {
            type:
              'object',

            properties: {
              message: {
                type:
                  'string',
              },
            },

            required: [
              'message',
            ],
          },
        },
      },
    },

    async (
      request,
      reply,
    ) => {
      const input =
        forgotPasswordSchema.parse(
          request.body,
        )

      const result =
        await requestPasswordReset(
          input,
        )

      if (result) {
        const requestContext =
          getRequestContext(
            request,
          )

        await createAuditLog({
          userId:
            result.userId,

          action:
            'PASSWORD_RESET_REQUESTED',

          entity:
            'AUTH',

          entityId:
            result.userId,

          metadata: {
            source:
              'password-forgot',
          },

          ipAddress:
            requestContext.ipAddress,

          userAgent:
            requestContext.userAgent,
        })
      }

      return reply
        .status(202)
        .send({
          message:
            'Se o e-mail estiver cadastrado, enviaremos um código para redefinição da senha.',
        })
    },
  )

  app.post(
    '/auth/password/verify',
    {
      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Validar código de recuperação de senha',

        body: {
          type:
            'object',

          required: [
            'email',
            'code',
          ],

          properties: {
            email: {
              type:
                'string',

              format:
                'email',
            },

            code: {
              type:
                'string',

              minLength:
                6,

              maxLength:
                6,
            },
          },
        },

        response: {
          200: {
            type:
              'object',

            properties: {
              resetToken: {
                type:
                  'string',
              },
            },

            required: [
              'resetToken',
            ],
          },
        },
      },
    },

    async (
      request,
      reply,
    ) => {
      const input =
        verifyPasswordResetSchema.parse(
          request.body,
        )

      const result =
        await verifyPasswordResetCode(
          input,
        )

      return reply
        .status(200)
        .send(
          result,
        )
    },
  )

  app.post(
    '/auth/password/reset',
    {
      schema: {
        tags: [
          'Auth',
        ],

        summary:
          'Definir nova senha',

        body: {
          type:
            'object',

          required: [
            'resetToken',
            'newPassword',
          ],

          properties: {
            resetToken: {
              type:
                'string',
            },

            newPassword: {
              type:
                'string',

              minLength:
                8,

              maxLength:
                128,
            },
          },
        },

        response: {
          204: {
            type:
              'null',
          },
        },
      },
    },

    async (
      request,
      reply,
    ) => {
      const input =
        resetPasswordSchema.parse(
          request.body,
        )

      const result =
        await resetPassword(
          input,
        )

      const requestContext =
        getRequestContext(
          request,
        )

      await createAuditLog({
        userId:
          result.userId,

        action:
          'PASSWORD_RESET_COMPLETED',

        entity:
          'AUTH',

        entityId:
          result.userId,

        metadata: {
          source:
            'password-reset',
        },

        ipAddress:
          requestContext.ipAddress,

        userAgent:
          requestContext.userAgent,
      })

      return reply
        .status(204)
        .send()
    },
  )
}