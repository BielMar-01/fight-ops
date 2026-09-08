import { z } from 'zod'

export const professorModalitiesParamsSchema = z.object({
  gymId: z.string().uuid('Identificador da academia inválido.'),

  professorId: z.string().uuid('Identificador do professor inválido.'),
})

export const professorModalityParamsSchema = z.object({
  gymId: z.string().uuid('Identificador da academia inválido.'),

  professorId: z.string().uuid('Identificador do professor inválido.'),

  modalityId: z.string().uuid('Identificador da modalidade inválido.'),
})

export const createProfessorModalityBodySchema = z.object({
  modalityId: z.string().uuid('Identificador da modalidade inválido.'),
})
