import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(150),

  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),

  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[a-z]/, 'A senha deve possuir pelo menos uma letra minúscula.')
    .regex(/[A-Z]/, 'A senha deve possuir pelo menos uma letra maiúscula.')
    .regex(/[0-9]/, 'A senha deve possuir pelo menos um número.'),

  phone: z.string().trim().min(8).max(30).optional(),
})

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),

  password: z.string().min(1),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>