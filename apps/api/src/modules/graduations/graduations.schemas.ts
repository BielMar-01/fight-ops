import { z } from 'zod'

const graduationNameSchema = z
  .string()
  .trim()
  .min(2, 'O nome da graduação deve ter pelo menos 2 caracteres.')
  .max(100, 'O nome da graduação deve ter no máximo 100 caracteres.')

const graduationDescriptionSchema = z
  .string()
  .trim()
  .max(1000, 'A descrição deve ter no máximo 1000 caracteres.')
  .optional()

const graduationColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'A cor deve estar no formato hexadecimal #RRGGBB.')
  .optional()

const graduationTextColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, 'A cor do texto deve estar no formato hexadecimal #RRGGBB.')
  .optional()

const graduationOrderSchema = z.coerce
  .number()
  .int('A ordem deve ser um número inteiro.')
  .min(1, 'A ordem deve ser maior ou igual a 1.')

export const listGraduationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().min(1).max(100).optional(),

  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
})

export const createGraduationBodySchema = z.object({
  name: graduationNameSchema,

  description: graduationDescriptionSchema,

  color: graduationColorSchema,

  textColor: graduationTextColorSchema,

  order: graduationOrderSchema,
})

export const updateGraduationBodySchema = z.object({
  name: graduationNameSchema,

  description: graduationDescriptionSchema,

  color: graduationColorSchema,

  textColor: graduationTextColorSchema,

  order: graduationOrderSchema,
})

export const updateGraduationStatusBodySchema = z.object({
  active: z.boolean(),
})

export const graduationParamsSchema = z.object({
  gymId: z.string().uuid(),

  modalityId: z.string().uuid(),

  graduationId: z.string().uuid(),
})

export const modalityGraduationsParamsSchema = z.object({
  gymId: z.string().uuid(),

  modalityId: z.string().uuid(),
})
