import {
  z,
} from 'zod'

export const professorListParamsSchema =
  z.object({
    gymId:
      z
        .string()
        .uuid(
          'Identificador da academia inválido.',
        ),
  })

export const professorParamsSchema =
  z.object({
    gymId:
      z
        .string()
        .uuid(
          'Identificador da academia inválido.',
        ),

    professorId:
      z
        .string()
        .uuid(
          'Identificador do professor inválido.',
        ),
  })

export const listProfessorsQuerySchema =
  z.object({
    page:
      z.coerce
        .number()
        .int()
        .min(
          1,
        )
        .default(
          1,
        ),

    limit:
      z.coerce
        .number()
        .int()
        .min(
          1,
        )
        .max(
          100,
        )
        .default(
          20,
        ),

    search:
      z
        .string()
        .trim()
        .min(
          1,
        )
        .max(
          150,
        )
        .optional(),

    active:
      z
        .preprocess(
          (
            value,
          ) => {
            if (
              value ===
              'true'
            ) {
              return true
            }

            if (
              value ===
              'false'
            ) {
              return false
            }

            return value
          },

          z
            .boolean()
            .optional(),
        ),
  })

const professorNameSchema =
  z
    .string()
    .trim()
    .min(
      2,
      'O nome deve possuir pelo menos 2 caracteres.',
    )
    .max(
      150,
      'O nome deve possuir no máximo 150 caracteres.',
    )

const professorEmailSchema =
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

const professorPhoneSchema =
  z
    .string()
    .trim()
    .min(
      8,
      'Informe um telefone válido.',
    )
    .max(
      30,
      'O telefone deve possuir no máximo 30 caracteres.',
    )
    .optional()

const professorDateSchema =
  z
    .string()
    .date(
      'Informe uma data válida no formato YYYY-MM-DD.',
    )
    .optional()

const professorBioSchema =
  z
    .string()
    .trim()
    .max(
      2000,
      'A biografia deve possuir no máximo 2000 caracteres.',
    )
    .optional()

const professorNotesSchema =
  z
    .string()
    .trim()
    .max(
      5000,
      'As observações devem possuir no máximo 5000 caracteres.',
    )
    .optional()

export const createProfessorBodySchema =
  z.object({
    name:
      professorNameSchema,

    email:
      professorEmailSchema,

    phone:
      professorPhoneSchema,

    birthDate:
      professorDateSchema,

    bio:
      professorBioSchema,

    notes:
      professorNotesSchema,

    hireDate:
      professorDateSchema,
  })

export const updateProfessorBodySchema =
  z.object({
    name:
      professorNameSchema,

    email:
      professorEmailSchema,

    phone:
      professorPhoneSchema,

    birthDate:
      professorDateSchema,

    bio:
      professorBioSchema,

    notes:
      professorNotesSchema,

    hireDate:
      professorDateSchema,
  })

export const updateProfessorStatusBodySchema =
  z.object({
    active:
      z.boolean(),
  })

export type ProfessorListParams =
  z.infer<
    typeof professorListParamsSchema
  >

export type ProfessorParams =
  z.infer<
    typeof professorParamsSchema
  >

export type ListProfessorsQuery =
  z.infer<
    typeof listProfessorsQuerySchema
  >

export type CreateProfessorBody =
  z.infer<
    typeof createProfessorBodySchema
  >

export type UpdateProfessorBody =
  z.infer<
    typeof updateProfessorBodySchema
  >

export type UpdateProfessorStatusBody =
  z.infer<
    typeof updateProfessorStatusBodySchema
  >