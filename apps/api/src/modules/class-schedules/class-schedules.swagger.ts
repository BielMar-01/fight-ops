const security = [
  {
    bearerAuth: [],
  },
]

const nullableStringSchema = {
  anyOf: [
    {
      type: 'string',
    },
    {
      type: 'null',
    },
  ],
}

const nullableDateSchema = {
  anyOf: [
    {
      type: 'string',
      format: 'date',
    },
    {
      type: 'null',
    },
  ],
}

const errorResponseSchema = {
  type: 'object',

  properties: {
    error: {
      type: 'object',

      properties: {
        code: {
          type: 'string',
        },

        message: {
          type: 'string',
        },
      },

      required: [
        'code',
        'message',
      ],
    },
  },

  required: [
    'error',
  ],
}

const gymParamsSchema = {
  type: 'object',

  properties: {
    gymId: {
      type: 'string',
      format: 'uuid',
      description:
        'Identificador da academia.',
    },
  },

  required: [
    'gymId',
  ],
}

const classScheduleParamsSchema = {
  type: 'object',

  properties: {
    gymId: {
      type: 'string',
      format: 'uuid',
      description:
        'Identificador da academia.',
    },

    classScheduleId: {
      type: 'string',
      format: 'uuid',
      description:
        'Identificador do horário.',
    },
  },

  required: [
    'gymId',
    'classScheduleId',
  ],
}

const classGroupSchedulesParamsSchema = {
  type: 'object',

  properties: {
    gymId: {
      type: 'string',
      format: 'uuid',
      description:
        'Identificador da academia.',
    },

    classGroupId: {
      type: 'string',
      format: 'uuid',
      description:
        'Identificador da turma.',
    },
  },

  required: [
    'gymId',
    'classGroupId',
  ],
}

const weekdaySchema = {
  type: 'string',

  enum: [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ],
}

const classGroupLevelSchema = {
  type: 'string',

  enum: [
    'BEGINNER',
    'INTERMEDIATE',
    'ADVANCED',
    'MIXED',
  ],
}

const modalitySummarySchema = {
  type: 'object',

  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },

    name: {
      type: 'string',
    },

    color: nullableStringSchema,

    active: {
      type: 'boolean',
    },
  },

  required: [
    'id',
    'name',
    'color',
    'active',
  ],
}

const professorSummarySchema = {
  type: 'object',

  properties: {
    relationId: {
      type: 'string',
      format: 'uuid',
    },

    assignedAt: {
      type: 'string',
      format: 'date-time',
    },

    id: {
      type: 'string',
      format: 'uuid',
    },

    name: {
      type: 'string',
    },

    email: nullableStringSchema,

    phone: nullableStringSchema,

    active: {
      type: 'boolean',
    },
  },

  required: [
    'relationId',
    'assignedAt',
    'id',
    'name',
    'email',
    'phone',
    'active',
  ],
}

const nullableProfessorSummarySchema = {
  anyOf: [
    professorSummarySchema,

    {
      type: 'null',
    },
  ],
}

const classGroupSummarySchema = {
  type: 'object',

  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },

    modalityId: {
      type: 'string',
      format: 'uuid',
    },

    name: {
      type: 'string',
    },

    level: classGroupLevelSchema,

    durationMinutes: {
      type: 'integer',
    },

    active: {
      type: 'boolean',
    },

    modality: modalitySummarySchema,

    primaryProfessor:
      nullableProfessorSummarySchema,

    assistantProfessors: {
      type: 'array',
      items: professorSummarySchema,
    },

    totalProfessors: {
      type: 'integer',
    },
  },

  required: [
    'id',
    'modalityId',
    'name',
    'level',
    'durationMinutes',
    'active',
    'modality',
    'primaryProfessor',
    'assistantProfessors',
    'totalProfessors',
  ],
}

const classScheduleSchema = {
  type: 'object',

  properties: {
    id: {
      type: 'string',
      format: 'uuid',
    },

    gymId: {
      type: 'string',
      format: 'uuid',
    },

    classGroupId: {
      type: 'string',
      format: 'uuid',
    },

    weekday: weekdaySchema,

    startTime: {
      type: 'string',
      pattern:
        '^([01]\\d|2[0-3]):[0-5]\\d$',
    },

    endTime: {
      type: 'string',
      pattern:
        '^([01]\\d|2[0-3]):[0-5]\\d$',
    },

    room: nullableStringSchema,

    notes: nullableStringSchema,

    validFrom: nullableDateSchema,

    validUntil: nullableDateSchema,

    active: {
      type: 'boolean',
    },

    createdAt: {
      type: 'string',
      format: 'date-time',
    },

    updatedAt: {
      type: 'string',
      format: 'date-time',
    },

    classGroup:
      classGroupSummarySchema,
  },

  required: [
    'id',
    'gymId',
    'classGroupId',
    'weekday',
    'startTime',
    'endTime',
    'room',
    'notes',
    'validFrom',
    'validUntil',
    'active',
    'createdAt',
    'updatedAt',
    'classGroup',
  ],
}

const classScheduleBodySchema = {
  type: 'object',

  additionalProperties: false,

  properties: {
    classGroupId: {
      type: 'string',
      format: 'uuid',
      description:
        'Identificador da turma.',
    },

    weekday: weekdaySchema,

    startTime: {
      type: 'string',
      pattern:
        '^([01]\\d|2[0-3]):[0-5]\\d$',
    },

    endTime: {
      type: 'string',
      pattern:
        '^([01]\\d|2[0-3]):[0-5]\\d$',
    },

    room: {
      type: 'string',
      maxLength: 150,
    },

    notes: {
      type: 'string',
      maxLength: 5000,
    },

    validFrom: {
      type: 'string',
      format: 'date',
    },

    validUntil: {
      type: 'string',
      format: 'date',
    },
  },

  required: [
    'classGroupId',
    'weekday',
    'startTime',
    'endTime',
  ],
}

const listClassSchedulesQuerySchema = {
  type: 'object',

  properties: {
    page: {
      type: 'integer',
      minimum: 1,
      default: 1,
    },

    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 100,
      default: 20,
    },

    search: {
      type: 'string',
      minLength: 1,
      maxLength: 150,
    },

    active: {
      type: 'boolean',
    },

    weekday: weekdaySchema,

    classGroupId: {
      type: 'string',
      format: 'uuid',
    },

    modalityId: {
      type: 'string',
      format: 'uuid',
    },

    professorId: {
      type: 'string',
      format: 'uuid',
    },

    validOn: {
      type: 'string',
      format: 'date',
    },
  },
}

const classScheduleResponseSchema = {
  type: 'object',

  properties: {
    classSchedule:
      classScheduleSchema,
  },

  required: [
    'classSchedule',
  ],
}

const classScheduleListResponseSchema = {
  type: 'object',

  properties: {
    classSchedules: {
      type: 'array',
      items: classScheduleSchema,
    },

    pagination: {
      type: 'object',

      properties: {
        page: {
          type: 'integer',
        },

        limit: {
          type: 'integer',
        },

        total: {
          type: 'integer',
        },

        totalPages: {
          type: 'integer',
        },
      },

      required: [
        'page',
        'limit',
        'total',
        'totalPages',
      ],
    },
  },

  required: [
    'classSchedules',
    'pagination',
  ],
}

const classGroupScheduleListResponseSchema = {
  type: 'object',

  properties: {
    classSchedules: {
      type: 'array',
      items: classScheduleSchema,
    },
  },

  required: [
    'classSchedules',
  ],
}

export const listClassSchedulesRouteSchema = {
  tags: [
    'Class Schedules',
  ],

  summary:
    'Listar horários da academia',

  description:
    'Lista os horários recorrentes da academia com paginação e filtros.',

  security,

  params: gymParamsSchema,

  querystring:
    listClassSchedulesQuerySchema,

  response: {
    200:
      classScheduleListResponseSchema,

    400: errorResponseSchema,

    401: errorResponseSchema,

    403: errorResponseSchema,
  },
}

export const listClassGroupSchedulesRouteSchema = {
  tags: [
    'Class Schedules',
  ],

  summary:
    'Listar horários da turma',

  description:
    'Lista todos os horários vinculados a uma turma específica.',

  security,

  params:
    classGroupSchedulesParamsSchema,

  response: {
    200:
      classGroupScheduleListResponseSchema,

    400: errorResponseSchema,

    401: errorResponseSchema,

    403: errorResponseSchema,

    404: errorResponseSchema,
  },
}

export const getClassScheduleRouteSchema = {
  tags: [
    'Class Schedules',
  ],

  summary:
    'Consultar horário',

  description:
    'Retorna os detalhes de um horário recorrente.',

  security,

  params:
    classScheduleParamsSchema,

  response: {
    200:
      classScheduleResponseSchema,

    400: errorResponseSchema,

    401: errorResponseSchema,

    403: errorResponseSchema,

    404: errorResponseSchema,
  },
}

export const createClassScheduleRouteSchema = {
  tags: [
    'Class Schedules',
  ],

  summary:
    'Cadastrar horário',

  description:
    'Cadastra um horário recorrente e valida conflitos de turma, local e professor.',

  security,

  params: gymParamsSchema,

  body:
    classScheduleBodySchema,

  response: {
    201:
      classScheduleResponseSchema,

    400: errorResponseSchema,

    401: errorResponseSchema,

    403: errorResponseSchema,

    404: errorResponseSchema,

    409: errorResponseSchema,
  },
}

export const updateClassScheduleRouteSchema = {
  tags: [
    'Class Schedules',
  ],

  summary:
    'Atualizar horário',

  description:
    'Atualiza um horário recorrente e verifica possíveis conflitos.',

  security,

  params:
    classScheduleParamsSchema,

  body:
    classScheduleBodySchema,

  response: {
    200:
      classScheduleResponseSchema,

    400: errorResponseSchema,

    401: errorResponseSchema,

    403: errorResponseSchema,

    404: errorResponseSchema,

    409: errorResponseSchema,
  },
}

export const updateClassScheduleStatusRouteSchema = {
  tags: [
    'Class Schedules',
  ],

  summary:
    'Atualizar status do horário',

  description:
    'Ativa ou inativa um horário. Ao reativar, os conflitos são verificados novamente.',

  security,

  params:
    classScheduleParamsSchema,

  body: {
    type: 'object',

    additionalProperties: false,

    properties: {
      active: {
        type: 'boolean',
      },
    },

    required: [
      'active',
    ],
  },

  response: {
    200:
      classScheduleResponseSchema,

    400: errorResponseSchema,

    401: errorResponseSchema,

    403: errorResponseSchema,

    404: errorResponseSchema,

    409: errorResponseSchema,
  },
}