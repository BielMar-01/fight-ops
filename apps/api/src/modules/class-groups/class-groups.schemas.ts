import { z } from 'zod'

export const classGroupLevelSchema = z.enum([
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'MIXED',
])

export const classGroupProfessorRoleSchema = z.enum([
  'PRIMARY',
  'ASSISTANT',
])

const classGroupNameSchema = z
  .string()
  .trim()
  .min(2, 'O nome da turma deve possuir pelo menos 2 caracteres.')
  .max(150, 'O nome da turma deve possuir no máximo 150 caracteres.')

const classGroupDescriptionSchema = z
  .string()
  .trim()
  .max(5000, 'A descrição deve possuir no máximo 5000 caracteres.')
  .optional()

const optionalAgeSchema = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined
    }

    return value
  },

  z.coerce
    .number()
    .int('A idade deve ser um número inteiro.')
    .min(0, 'A idade não pode ser menor que zero.')
    .max(120, 'A idade não pode ser maior que 120.')
    .optional(),
)

const maxStudentsSchema = z.preprocess(
  (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined
    }

    return value
  },

  z.coerce
    .number()
    .int('A capacidade deve ser um número inteiro.')
    .min(1, 'A capacidade deve ser maior ou igual a 1.')
    .max(1000, 'A capacidade deve ser menor ou igual a 1000.')
    .optional(),
)

const durationMinutesSchema = z.coerce
  .number()
  .int('A duração deve ser um número inteiro.')
  .min(15, 'A duração deve ser de pelo menos 15 minutos.')
  .max(300, 'A duração deve ser de no máximo 300 minutos.')

const classGroupBodySchema = z
  .object({
    modalityId: z
      .string()
      .uuid('Identificador da modalidade inválido.'),

    name: classGroupNameSchema,

    description: classGroupDescriptionSchema,

    level: classGroupLevelSchema,

    minimumAge: optionalAgeSchema,

    maximumAge: optionalAgeSchema,

    maxStudents: maxStudentsSchema,

    durationMinutes: durationMinutesSchema,
  })
  .superRefine((input, context) => {
    if (
      input.minimumAge !== undefined &&
      input.maximumAge !== undefined &&
      input.maximumAge < input.minimumAge
    ) {
      context.addIssue({
        code: 'custom',

        path: ['maximumAge'],

        message:
          'A idade máxima deve ser maior ou igual à idade mínima.',
      })
    }
  })

export const classGroupListParamsSchema = z.object({
  gymId: z.string().uuid('Identificador da academia inválido.'),
})

export const classGroupParamsSchema = z.object({
  gymId: z.string().uuid('Identificador da academia inválido.'),

  classGroupId: z.string().uuid('Identificador da turma inválido.'),
})

export const classGroupProfessorsParamsSchema = z.object({
  gymId: z.string().uuid('Identificador da academia inválido.'),

  classGroupId: z.string().uuid('Identificador da turma inválido.'),
})

export const classGroupProfessorParamsSchema = z.object({
  gymId: z.string().uuid('Identificador da academia inválido.'),

  classGroupId: z.string().uuid('Identificador da turma inválido.'),

  professorId: z.string().uuid('Identificador do professor inválido.'),
})

export const listClassGroupsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int('A página deve ser um número inteiro.')
    .min(1, 'A página deve ser maior ou igual a 1.')
    .default(1),

  limit: z.coerce
    .number()
    .int('O limite deve ser um número inteiro.')
    .min(1, 'O limite deve ser maior ou igual a 1.')
    .max(100, 'O limite deve ser menor ou igual a 100.')
    .default(20),

  search: z
    .string()
    .trim()
    .min(1, 'A busca deve possuir pelo menos 1 caractere.')
    .max(150, 'A busca deve possuir no máximo 150 caracteres.')
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

  modalityId: z
    .string()
    .uuid('Identificador da modalidade inválido.')
    .optional(),

  level: classGroupLevelSchema.optional(),

  professorId: z
    .string()
    .uuid('Identificador do professor inválido.')
    .optional(),
})

export const createClassGroupBodySchema = classGroupBodySchema

export const updateClassGroupBodySchema = classGroupBodySchema

export const updateClassGroupStatusBodySchema = z.object({
  active: z.boolean({
    error: 'O status da turma deve ser informado.',
  }),
})

export const createClassGroupProfessorBodySchema = z.object({
  professorId: z
    .string()
    .uuid('Identificador do professor inválido.'),

  role: classGroupProfessorRoleSchema,
})