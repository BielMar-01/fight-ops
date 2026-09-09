import type { z } from 'zod'

import type {
  classGroupSchedulesParamsSchema,
  classScheduleListParamsSchema,
  classScheduleParamsSchema,
  createClassScheduleBodySchema,
  listClassSchedulesQuerySchema,
  updateClassScheduleBodySchema,
  updateClassScheduleStatusBodySchema,
  weekdaySchema,
} from './class-schedules.schemas.js'

export type Weekday = z.infer<
  typeof weekdaySchema
>

export type ClassScheduleListParams =
  z.infer<
    typeof classScheduleListParamsSchema
  >

export type ClassScheduleParams =
  z.infer<
    typeof classScheduleParamsSchema
  >

export type ClassGroupSchedulesParams =
  z.infer<
    typeof classGroupSchedulesParamsSchema
  >

export type ListClassSchedulesQuery =
  z.infer<
    typeof listClassSchedulesQuerySchema
  >

export type CreateClassScheduleBody =
  z.infer<
    typeof createClassScheduleBodySchema
  >

export type UpdateClassScheduleBody =
  z.infer<
    typeof updateClassScheduleBodySchema
  >

export type UpdateClassScheduleStatusBody =
  z.infer<
    typeof updateClassScheduleStatusBodySchema
  >