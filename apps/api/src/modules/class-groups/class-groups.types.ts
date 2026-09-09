import type { z } from 'zod'

import type {
  classGroupLevelSchema,
  classGroupListParamsSchema,
  classGroupParamsSchema,
  classGroupProfessorParamsSchema,
  classGroupProfessorRoleSchema,
  classGroupProfessorsParamsSchema,
  createClassGroupBodySchema,
  createClassGroupProfessorBodySchema,
  listClassGroupsQuerySchema,
  updateClassGroupBodySchema,
  updateClassGroupStatusBodySchema,
} from './class-groups.schemas.js'

export type ClassGroupLevel = z.infer<
  typeof classGroupLevelSchema
>

export type ClassGroupProfessorRole = z.infer<
  typeof classGroupProfessorRoleSchema
>

export type ClassGroupListParams = z.infer<
  typeof classGroupListParamsSchema
>

export type ClassGroupParams = z.infer<
  typeof classGroupParamsSchema
>

export type ClassGroupProfessorsParams = z.infer<
  typeof classGroupProfessorsParamsSchema
>

export type ClassGroupProfessorParams = z.infer<
  typeof classGroupProfessorParamsSchema
>

export type ListClassGroupsQuery = z.infer<
  typeof listClassGroupsQuerySchema
>

export type CreateClassGroupBody = z.infer<
  typeof createClassGroupBodySchema
>

export type UpdateClassGroupBody = z.infer<
  typeof updateClassGroupBodySchema
>

export type UpdateClassGroupStatusBody = z.infer<
  typeof updateClassGroupStatusBodySchema
>

export type CreateClassGroupProfessorBody = z.infer<
  typeof createClassGroupProfessorBodySchema
>