import {
  z,
} from 'zod'

export const auditGymParamsSchema =
  z.object({
    gymId:
      z.string().uuid(),
  })

export const listAuditLogsQuerySchema =
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

    action:
      z.string()
        .trim()
        .min(1)
        .optional(),

    entity:
      z.string()
        .trim()
        .min(1)
        .optional(),

    userId:
      z.string()
        .uuid()
        .optional(),

    startDate:
      z.string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
        )
        .optional(),

    endDate:
      z.string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
        )
        .optional(),
  })