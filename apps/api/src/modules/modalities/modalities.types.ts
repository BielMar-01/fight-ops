import type {
  z,
} from 'zod'

import type {
  createModalityBodySchema,
  listModalitiesQuerySchema,
  modalityParamsSchema,
  gymParamsSchema,
  updateModalityBodySchema,
  updateModalityStatusBodySchema,
} from './modalities.schemas.ts'

export type ListModalitiesQuery =
  z.infer<
    typeof listModalitiesQuerySchema
  >

export type CreateModalityBody =
  z.infer<
    typeof createModalityBodySchema
  >

export type UpdateModalityBody =
  z.infer<
    typeof updateModalityBodySchema
  >

export type UpdateModalityStatusBody =
  z.infer<
    typeof updateModalityStatusBodySchema
  >

export type ModalityParams =
  z.infer<
    typeof modalityParamsSchema
  >

export type GymParams =
  z.infer<
    typeof gymParamsSchema
  >