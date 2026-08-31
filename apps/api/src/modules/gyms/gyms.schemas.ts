import {
  z,
} from 'zod'

export const gymRoleSchema =
  z.enum([
    'OWNER',
    'ADMIN',
    'RECEPTIONIST',
    'PROFESSOR',
    'STUDENT',
  ])

export const manageableGymRoleSchema =
  z.enum([
    'ADMIN',
    'RECEPTIONIST',
    'PROFESSOR',
    'STUDENT',
  ])

export const createGymBodySchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          3,
          'O nome da academia deve possuir pelo menos 3 caracteres.',
        )
        .max(
          150,
          'O nome da academia deve possuir no máximo 150 caracteres.',
        ),

    description:
      z
        .string()
        .trim()
        .max(
          2000,
          'A descrição deve possuir no máximo 2000 caracteres.',
        )
        .optional(),

    phone:
      z
        .string()
        .trim()
        .max(
          30,
          'O telefone deve possuir no máximo 30 caracteres.',
        )
        .optional(),

    email:
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
        .optional(),
  })

export const gymParamsSchema =
  z.object({
    gymId:
      z
        .string()
        .uuid(
          'Identificador da academia inválido.',
        ),
  })

export const gymMemberParamsSchema =
  z.object({
    gymId:
      z
        .string()
        .uuid(
          'Identificador da academia inválido.',
        ),

    memberId:
      z
        .string()
        .uuid(
          'Identificador do membro inválido.',
        ),
  })

export const addGymMemberBodySchema =
  z.object({
    email:
      z
        .string()
        .trim()
        .email(
          'Informe um e-mail válido.',
        ),

    role:
      manageableGymRoleSchema,
  })

export const updateGymMemberRoleBodySchema =
  z.object({
    role:
      gymRoleSchema,
  })

export const updateGymMemberStatusBodySchema =
  z.object({
    active:
      z.boolean(),
  })

export const resetGymMemberPasswordBodySchema =
  z
    .object({
      password:
        z
          .string()
          .min(
            8,
            'A senha deve possuir pelo menos 8 caracteres.',
          )
          .max(
            128,
            'A senha deve possuir no máximo 128 caracteres.',
          )
          .regex(
            /[a-z]/,
            'A senha deve possuir pelo menos uma letra minúscula.',
          )
          .regex(
            /[A-Z]/,
            'A senha deve possuir pelo menos uma letra maiúscula.',
          )
          .regex(
            /\d/,
            'A senha deve possuir pelo menos um número.',
          ),

      confirmPassword:
        z.string(),
    })
    .refine(
      (data) =>
        data.password ===
        data.confirmPassword,
      {
        message:
          'As senhas não coincidem.',

        path: [
          'confirmPassword',
        ],
      },
    )

export type CreateGymBody =
  z.infer<
    typeof createGymBodySchema
  >

export type GymParams =
  z.infer<
    typeof gymParamsSchema
  >

export type GymMemberParams =
  z.infer<
    typeof gymMemberParamsSchema
  >

export type AddGymMemberBody =
  z.infer<
    typeof addGymMemberBodySchema
  >

export type UpdateGymMemberRoleBody =
  z.infer<
    typeof updateGymMemberRoleBodySchema
  >

export type UpdateGymMemberStatusBody =
  z.infer<
    typeof updateGymMemberStatusBodySchema
  >

export type ResetGymMemberPasswordBody =
  z.infer<
    typeof resetGymMemberPasswordBodySchema
  >