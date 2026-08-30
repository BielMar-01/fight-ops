import {
  z,
} from 'zod'

const optionalEmailSchema =
  z
    .string()
    .trim()
    .email(
      'Informe um e-mail válido.',
    )
    .max(
      255,
      'O e-mail deve possuir no máximo 255 caracteres.',
    )
    .optional()
    .nullable()

const optionalPhoneSchema =
  z
    .string()
    .trim()
    .max(
      30,
      'O telefone deve possuir no máximo 30 caracteres.',
    )
    .optional()
    .nullable()

const optionalDateSchema =
  z
    .string()
    .date(
      'Informe uma data válida no formato YYYY-MM-DD.',
    )
    .optional()
    .nullable()

export const studentParamsSchema =
  z.object({
    gymId:
      z
        .string()
        .uuid(
          'Identificador da academia inválido.',
        ),

    studentId:
      z
        .string()
        .uuid(
          'Identificador do aluno inválido.',
        ),
  })

export const studentListParamsSchema =
  z.object({
    gymId:
      z
        .string()
        .uuid(
          'Identificador da academia inválido.',
        ),
  })

export const listStudentsQuerySchema =
  z.object({
    page:
      z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),

    search:
      z
        .string()
        .trim()
        .max(
          150,
          'A busca deve possuir no máximo 150 caracteres.',
        )
        .optional(),

    active:
      z
        .enum([
          'true',
          'false',
        ])
        .transform(
          (value) =>
            value === 'true',
        )
        .optional(),
  })

export const createStudentBodySchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          2,
          'O nome do aluno deve possuir pelo menos 2 caracteres.',
        )
        .max(
          150,
          'O nome do aluno deve possuir no máximo 150 caracteres.',
        ),

    email:
      optionalEmailSchema,

    phone:
      optionalPhoneSchema,

    birthDate:
      optionalDateSchema,

    emergencyContact:
      z
        .string()
        .trim()
        .max(
          150,
          'O contato de emergência deve possuir no máximo 150 caracteres.',
        )
        .optional()
        .nullable(),

    emergencyPhone:
      optionalPhoneSchema,

    notes:
      z
        .string()
        .trim()
        .max(
          5000,
          'As observações devem possuir no máximo 5000 caracteres.',
        )
        .optional()
        .nullable(),

    joinedAt:
      optionalDateSchema,
  })

export const updateStudentBodySchema =
  createStudentBodySchema

export const updateStudentStatusBodySchema =
  z.object({
    active:
      z.boolean(),
  })

export type StudentParams =
  z.infer<
    typeof studentParamsSchema
  >

export type StudentListParams =
  z.infer<
    typeof studentListParamsSchema
  >

export type ListStudentsQuery =
  z.infer<
    typeof listStudentsQuerySchema
  >

export type CreateStudentBody =
  z.infer<
    typeof createStudentBodySchema
  >

export type UpdateStudentBody =
  z.infer<
    typeof updateStudentBodySchema
  >

export type UpdateStudentStatusBody =
  z.infer<
    typeof updateStudentStatusBodySchema
  >