import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { config } from 'dotenv'
import { z } from 'zod'

const currentDirectory = dirname(fileURLToPath(import.meta.url))

const rootEnvPath = resolve(currentDirectory, '../../../../.env')

config({
  path: rootEnvPath,
})

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_PORT: z.coerce.number().int().positive().max(65535).default(3333),

  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required'),

  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),

  SUPABASE_PUBLISHABLE_KEY: z.string().min(1, 'SUPABASE_PUBLISHABLE_KEY is required'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must have at least 32 characters'),

  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must have at least 32 characters'),

  JWT_ACCESS_EXPIRATION: z.string().default('15m'),

  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().int().positive().default(7),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables:')
  console.error(z.treeifyError(parsedEnv.error))

  process.exit(1)
}

export const env = parsedEnv.data