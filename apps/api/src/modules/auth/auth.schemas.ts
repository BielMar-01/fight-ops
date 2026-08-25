import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(8)
  .max(128)
  .regex(/[a-z]/, 'A senha deve possuir pelo menos uma letra minúscula.')
  .regex(/[A-Z]/, 'A senha deve possuir pelo menos uma letra maiúscula.')
  .regex(/[0-9]/, 'A senha deve possuir pelo menos um número.')

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(150),

  email: z.string().trim().email().max(255).transform((value) => value.toLowerCase()),

  password: passwordSchema,

  phone: z.string().trim().min(8).max(30).optional(),
})

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),

  password: z.string().min(1),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
})

export const verifyPasswordResetSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),

  code: z.string().regex(/^\d{6}$/, 'O código deve possuir 6 dígitos.'),
})

export const resetPasswordSchema = z.object({
  resetToken: z.string().min(32),

  newPassword: passwordSchema,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type VerifyPasswordResetInput = z.infer<typeof verifyPasswordResetSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>