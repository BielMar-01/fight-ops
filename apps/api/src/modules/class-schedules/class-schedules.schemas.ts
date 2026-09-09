import { z } from 'zod'

export const weekdaySchema = z.enum([
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
])

const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    'Informe um horário válido no formato HH:mm.',
  )

function timeToMinutes(value: string) {
  const [hour = '0', minute = '0'] =
    value.split(':')

  return (
    Number(hour) * 60 +
    Number(minute)
  )
}

const optionalTextSchema = (
  maximumLength: number,
  message: string,
) =>
  z.preprocess(
    (value) => {
      if (
        value === '' ||
        value === null ||
        value === undefined
      ) {
        return undefined
      }

      return value
    },

    z
      .string()
      .trim()
      .max(maximumLength, message)
      .optional(),
  )

const optionalDateSchema = z.preprocess(
  (value) => {
    if (
      value === '' ||
      value === null ||
      value === undefined
    ) {
      return undefined
    }

    return value
  },

  z
    .string()
    .date(
      'Informe uma data válida no formato YYYY-MM-DD.',
    )
    .optional(),
)

const classScheduleBodySchema = z
  .object({
    classGroupId: z
      .string()
      .uuid(
        'Identificador da turma inválido.',
      ),

    weekday: weekdaySchema,

    startTime: timeSchema,

    endTime: timeSchema,

    room: optionalTextSchema(
      150,
      'O local deve possuir no máximo 150 caracteres.',
    ),

    notes: optionalTextSchema(
      5000,
      'As observações devem possuir no máximo 5000 caracteres.',
    ),

    validFrom: optionalDateSchema,

    validUntil: optionalDateSchema,
  })
  .superRefine((input, context) => {
    const startTotalMinutes =
      timeToMinutes(input.startTime)

    const endTotalMinutes =
      timeToMinutes(input.endTime)

    if (
      endTotalMinutes <=
      startTotalMinutes
    ) {
      context.addIssue({
        code: 'custom',

        path: ['endTime'],

        message:
          'O horário final deve ser posterior ao horário inicial.',
      })
    }

    if (
      input.validFrom &&
      input.validUntil &&
      input.validUntil <
        input.validFrom
    ) {
      context.addIssue({
        code: 'custom',

        path: ['validUntil'],

        message:
          'A data final deve ser igual ou posterior à data inicial.',
      })
    }
  })

export const classScheduleListParamsSchema =
  z.object({
    gymId: z
      .string()
      .uuid(
        'Identificador da academia inválido.',
      ),
  })

export const classScheduleParamsSchema =
  z.object({
    gymId: z
      .string()
      .uuid(
        'Identificador da academia inválido.',
      ),

    classScheduleId: z
      .string()
      .uuid(
        'Identificador do horário inválido.',
      ),
  })

export const classGroupSchedulesParamsSchema =
  z.object({
    gymId: z
      .string()
      .uuid(
        'Identificador da academia inválido.',
      ),

    classGroupId: z
      .string()
      .uuid(
        'Identificador da turma inválido.',
      ),
  })

export const listClassSchedulesQuerySchema =
  z.object({
    page: z.coerce
      .number()
      .int(
        'A página deve ser um número inteiro.',
      )
      .min(
        1,
        'A página deve ser maior ou igual a 1.',
      )
      .default(1),

    limit: z.coerce
      .number()
      .int(
        'O limite deve ser um número inteiro.',
      )
      .min(
        1,
        'O limite deve ser maior ou igual a 1.',
      )
      .max(
        100,
        'O limite deve ser menor ou igual a 100.',
      )
      .default(20),

    search: z
      .string()
      .trim()
      .min(
        1,
        'A busca deve possuir pelo menos 1 caractere.',
      )
      .max(
        150,
        'A busca deve possuir no máximo 150 caracteres.',
      )
      .optional(),

    active: z.preprocess(
      (value) => {
        if (value === 'true') {
          return true
        }

        if (value === 'false') {
          return false
        }

        return value
      },

      z.boolean().optional(),
    ),

    weekday:
      weekdaySchema.optional(),

    classGroupId: z
      .string()
      .uuid(
        'Identificador da turma inválido.',
      )
      .optional(),

    modalityId: z
      .string()
      .uuid(
        'Identificador da modalidade inválido.',
      )
      .optional(),

    professorId: z
      .string()
      .uuid(
        'Identificador do professor inválido.',
      )
      .optional(),

    validOn: z
      .string()
      .date(
        'Informe uma data válida no formato YYYY-MM-DD.',
      )
      .optional(),
  })

export const createClassScheduleBodySchema =
  classScheduleBodySchema

export const updateClassScheduleBodySchema =
  classScheduleBodySchema

export const updateClassScheduleStatusBodySchema =
  z.object({
    active: z.boolean({
      error:
        'O status do horário deve ser informado.',
    }),
  })