import type { FastifyError, FastifyInstance } from 'fastify'

function isFastifyError(error: unknown): error is FastifyError {
  return error instanceof Error
}

export function registerErrorHandlers(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    request.log.warn(
      {
        requestId: request.id,
        method: request.method,
        url: request.url,
      },
      'Route not found',
    )

    return reply.status(404).send({
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'Rota não encontrada.',
      },
    })
  })

  app.setErrorHandler((error, request, reply) => {
    if (!isFastifyError(error)) {
      request.log.error(
        {
          err: error,
          requestId: request.id,
        },
        'Unknown request error',
      )

      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro interno do servidor.',
        },
      })
    }

    if (error.validation) {
      request.log.warn(
        {
          err: error,
          requestId: request.id,
        },
        'Request validation failed',
      )

      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Dados da requisição inválidos.',
        },
      })
    }

    const statusCode =
      typeof error.statusCode === 'number' && error.statusCode >= 400 ? error.statusCode : 500

    request.log.error(
      {
        err: error,
        requestId: request.id,
      },
      'Request failed',
    )

    if (statusCode >= 500) {
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erro interno do servidor.',
        },
      })
    }

    return reply.status(statusCode).send({
      error: {
        code: 'REQUEST_ERROR',
        message: error.message,
      },
    })
  })
}