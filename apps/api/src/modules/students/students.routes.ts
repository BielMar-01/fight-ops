import type {
  FastifyInstance,
} from 'fastify'

import {
  authenticate,
} from '../auth/authenticate.js'

import {
  requireGymRole,
} from '../gyms/gym-access.js'

import {
  createStudentBodySchema,
  listStudentsQuerySchema,
  studentListParamsSchema,
  studentParamsSchema,
  updateStudentBodySchema,
  updateStudentStatusBodySchema,
} from './students.schemas.js'

import {
  createStudent,
  getStudentById,
  listStudents,
  updateStudent,
  updateStudentStatus,
} from './students.service.js'

const security = [
  {
    bearerAuth: [],
  },
]

const gymIdParamsSchema = {
  type:
    'object',

  required: [
    'gymId',
  ],

  properties: {
    gymId: {
      type:
        'string',

      format:
        'uuid',

      description:
        'Identificador da academia.',
    },
  },
}

const studentParamsOpenApiSchema = {
  type:
    'object',

  required: [
    'gymId',
    'studentId',
  ],

  properties: {
    gymId: {
      type:
        'string',

      format:
        'uuid',

      description:
        'Identificador da academia.',
    },

    studentId: {
      type:
        'string',

      format:
        'uuid',

      description:
        'Identificador do aluno.',
    },
  },
}

const studentProperties = {
  id: {
    type:
      'string',

    format:
      'uuid',
  },

  gymId: {
    type:
      'string',

    format:
      'uuid',
  },

  userId: {
    anyOf: [
      {
        type:
          'string',

        format:
          'uuid',
      },

      {
        type:
          'null',
      },
    ],
  },

  name: {
    type:
      'string',
  },

  email: {
    anyOf: [
      {
        type:
          'string',

        format:
          'email',
      },

      {
        type:
          'null',
      },
    ],
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

  birthDate: {
    anyOf: [
      {
        type:
          'string',

        format:
          'date-time',
      },

      {
        type:
          'null',
      },
    ],
  },

  emergencyContact: {
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

  emergencyPhone: {
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

  notes: {
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

  active: {
    type:
      'boolean',
  },

  joinedAt: {
    type:
      'string',

    format:
      'date-time',
  },

  createdAt: {
    type:
      'string',

    format:
      'date-time',
  },

  updatedAt: {
    type:
      'string',

    format:
      'date-time',
  },
}

const studentSchema = {
  type:
    'object',

  properties:
    studentProperties,
}

const studentResponseSchema = {
  type:
    'object',

  properties: {
    student:
      studentSchema,
  },
}

const studentBodyProperties = {
  name: {
    type:
      'string',

    minLength:
      2,

    maxLength:
      150,
  },

  email: {
    type:
      'string',

    format:
      'email',
  },

  phone: {
    type:
      'string',
  },

  birthDate: {
    type:
      'string',

    format:
      'date',
  },

  emergencyContact: {
    type:
      'string',
  },

  emergencyPhone: {
    type:
      'string',
  },

  notes: {
    type:
      'string',
  },

  joinedAt: {
    type:
      'string',

    format:
      'date',
  },
}

const studentBodySchema = {
  type:
    'object',

  required: [
    'name',
  ],

  properties:
    studentBodyProperties,
}

const errorResponseSchema = {
  type:
    'object',

  properties: {
    code: {
      type:
        'string',
    },

    message: {
      type:
        'string',
    },
  },
}

export async function studentRoutes(
  app: FastifyInstance,
) {
  app.get(
    '/gyms/:gymId/students',
    {
      schema: {
        tags: [
          'Students',
        ],

        summary:
          'Listar alunos',

        description:
          'Lista os alunos da academia com paginação, busca e filtro por status.',

        security,

        params:
          gymIdParamsSchema,

        querystring: {
          type:
            'object',

          properties: {
            page: {
              type:
                'integer',

              minimum:
                1,

              default:
                1,
            },

            limit: {
              type:
                'integer',

              minimum:
                1,

              maximum:
                100,

              default:
                20,
            },

            search: {
              type:
                'string',

              description:
                'Busca por nome, e-mail ou telefone.',
            },

            active: {
              type:
                'boolean',

              description:
                'Filtra alunos ativos ou inativos.',
            },
          },
        },

        response: {
          200: {
            type:
              'object',

            properties: {
              students: {
                type:
                  'array',

                items:
                  studentSchema,
              },

              pagination: {
                type:
                  'object',

                properties: {
                  page: {
                    type:
                      'integer',
                  },

                  limit: {
                    type:
                      'integer',
                  },

                  total: {
                    type:
                      'integer',
                  },

                  totalPages: {
                    type:
                      'integer',
                  },
                },
              },
            },
          },

          401:
            errorResponseSchema,

          403:
            errorResponseSchema,

          404:
            errorResponseSchema,
        },
      },

      preHandler: [
        authenticate,

        requireGymRole(
          'OWNER',
          'ADMIN',
          'RECEPTIONIST',
          'PROFESSOR',
        ),
      ],
    },

    async (
      request,
      reply,
    ) => {
      const params =
        studentListParamsSchema.parse(
          request.params,
        )

      const query =
        listStudentsQuerySchema.parse(
          request.query,
        )

      const result =
        await listStudents(
          params.gymId,
          query,
        )

      return reply.send(
        result,
      )
    },
  )

  app.get(
    '/gyms/:gymId/students/:studentId',
    {
      schema: {
        tags: [
          'Students',
        ],

        summary:
          'Consultar aluno',

        description:
          'Retorna os dados de um aluno pertencente à academia.',

        security,

        params:
          studentParamsOpenApiSchema,

        response: {
          200:
            studentResponseSchema,

          401:
            errorResponseSchema,

          403:
            errorResponseSchema,

          404:
            errorResponseSchema,
        },
      },

      preHandler: [
        authenticate,

        requireGymRole(
          'OWNER',
          'ADMIN',
          'RECEPTIONIST',
          'PROFESSOR',
        ),
      ],
    },

    async (
      request,
      reply,
    ) => {
      const params =
        studentParamsSchema.parse(
          request.params,
        )

      const student =
        await getStudentById(
          params.gymId,
          params.studentId,
        )

      return reply.send({
        student,
      })
    },
  )

  app.post(
    '/gyms/:gymId/students',
    {
      schema: {
        tags: [
          'Students',
        ],

        summary:
          'Cadastrar aluno',

        description:
          'Cadastra um novo aluno na academia.',

        security,

        params:
          gymIdParamsSchema,

        body:
          studentBodySchema,

        response: {
          201:
            studentResponseSchema,

          400:
            errorResponseSchema,

          401:
            errorResponseSchema,

          403:
            errorResponseSchema,

          404:
            errorResponseSchema,
        },
      },

      preHandler: [
        authenticate,

        requireGymRole(
          'OWNER',
          'ADMIN',
          'RECEPTIONIST',
        ),
      ],
    },

    async (
      request,
      reply,
    ) => {
      const params =
        studentListParamsSchema.parse(
          request.params,
        )

      const body =
        createStudentBodySchema.parse(
          request.body,
        )

      const student =
        await createStudent(
          params.gymId,
          body,
        )

      return reply
        .status(201)
        .send({
          student,
        })
    },
  )

  app.put(
    '/gyms/:gymId/students/:studentId',
    {
      schema: {
        tags: [
          'Students',
        ],

        summary:
          'Atualizar aluno',

        description:
          'Atualiza os dados cadastrais de um aluno da academia.',

        security,

        params:
          studentParamsOpenApiSchema,

        body:
          studentBodySchema,

        response: {
          200:
            studentResponseSchema,

          400:
            errorResponseSchema,

          401:
            errorResponseSchema,

          403:
            errorResponseSchema,

          404:
            errorResponseSchema,
        },
      },

      preHandler: [
        authenticate,

        requireGymRole(
          'OWNER',
          'ADMIN',
          'RECEPTIONIST',
        ),
      ],
    },

    async (
      request,
      reply,
    ) => {
      const params =
        studentParamsSchema.parse(
          request.params,
        )

      const body =
        updateStudentBodySchema.parse(
          request.body,
        )

      const student =
        await updateStudent(
          params.gymId,
          params.studentId,
          body,
        )

      return reply.send({
        student,
      })
    },
  )

  app.patch(
    '/gyms/:gymId/students/:studentId/status',
    {
      schema: {
        tags: [
          'Students',
        ],

        summary:
          'Alterar status do aluno',

        description:
          'Ativa ou inativa um aluno sem removê-lo do histórico da academia.',

        security,

        params:
          studentParamsOpenApiSchema,

        body: {
          type:
            'object',

          required: [
            'active',
          ],

          properties: {
            active: {
              type:
                'boolean',
            },
          },
        },

        response: {
          200:
            studentResponseSchema,

          400:
            errorResponseSchema,

          401:
            errorResponseSchema,

          403:
            errorResponseSchema,

          404:
            errorResponseSchema,

          409:
            errorResponseSchema,
        },
      },

      preHandler: [
        authenticate,

        requireGymRole(
          'OWNER',
          'ADMIN',
          'RECEPTIONIST',
        ),
      ],
    },

    async (
      request,
      reply,
    ) => {
      const params =
        studentParamsSchema.parse(
          request.params,
        )

      const body =
        updateStudentStatusBodySchema.parse(
          request.body,
        )

      const student =
        await updateStudentStatus(
          params.gymId,
          params.studentId,
          body,
        )

      return reply.send({
        student,
      })
    },
  )
}