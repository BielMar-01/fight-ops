import type { z } from 'zod'

import type {
  createProfessorModalityBodySchema,
  professorModalitiesParamsSchema,
  professorModalityParamsSchema,
} from './professor-modalities.schemas.ts'

export type CreateProfessorModalityBody = z.infer<typeof createProfessorModalityBodySchema>

export type ProfessorModalitiesParams = z.infer<typeof professorModalitiesParamsSchema>

export type ProfessorModalityParams = z.infer<typeof professorModalityParamsSchema>
