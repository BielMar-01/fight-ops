import type { z } from 'zod'

import type {
  createGraduationBodySchema,
  graduationParamsSchema,
  listGraduationsQuerySchema,
  modalityGraduationsParamsSchema,
  updateGraduationBodySchema,
  updateGraduationStatusBodySchema,
} from './graduations.schemas.ts'

export type ListGraduationsQuery = z.infer<typeof listGraduationsQuerySchema>

export type CreateGraduationBody = z.infer<typeof createGraduationBodySchema>

export type UpdateGraduationBody = z.infer<typeof updateGraduationBodySchema>

export type UpdateGraduationStatusBody = z.infer<typeof updateGraduationStatusBodySchema>

export type GraduationParams = z.infer<typeof graduationParamsSchema>

export type ModalityGraduationsParams = z.infer<typeof modalityGraduationsParamsSchema>
