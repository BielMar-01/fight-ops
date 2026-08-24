import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_PORT: z.coerce.number().int().positive().max(65535).default(3333),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
})

const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('Invalid environment variables:')
  console.error(z.treeifyError(parsedEnv.error))

  process.exit(1)
}

export const env = parsedEnv.data
