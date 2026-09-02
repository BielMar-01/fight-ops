import { z } from 'zod'

const modalityNameSchema = z
  .string()
  .trim()
  .min(2, 'O nome da modalidade deve ter pelo menos 2 caracteres.')
  .max(100, 'O nome da modalidade deve ter no máximo 100 caracteres.')

const modalityDescriptionSchema = z
  .string()
  .trim()
  .max(1000, 'A descrição deve ter no máximo 1000 caracteres.')
  .optional()

const modalityColorSchema = z
  .string()
  .trim()
  .regex(
    /^#[0-9A-Fa-f]{6}$/,
    'A cor deve estar no formato hexadecimal #RRGGBB.',
  )
  .optional()

export const listModalitiesQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20),

  search: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .optional(),

  active: z
    .enum([
      'true',
      'false',
    ])
    .transform(
      (value) =>
        value ===
        'true',
    )
    .optional(),
})

export const createModalityBodySchema = z.object({
  name:
    modalityNameSchema,

  description:
    modalityDescriptionSchema,

  color:
    modalityColorSchema,
})

export const updateModalityBodySchema = z.object({
  name:
    modalityNameSchema,

  description:
    modalityDescriptionSchema,

  color:
    modalityColorSchema,
})

export const updateModalityStatusBodySchema = z.object({
  active:
    z.boolean(),
})

export const modalityParamsSchema = z.object({
  gymId:
    z.string().uuid(),

  modalityId:
    z.string().uuid(),
})

export const gymParamsSchema = z.object({
  gymId:
    z.string().uuid(),
})