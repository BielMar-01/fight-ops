import { useMemo } from 'react'

import type {
  ClassSchedule,
  Weekday,
} from '../../types/class-schedule'

import '../../styles/weekly-class-schedule.css'

interface WeeklyClassScheduleViewProps {
  classSchedules: ClassSchedule[]
  canManage: boolean
  updatingStatusId: string | null
  onEdit: (
    classSchedule: ClassSchedule,
  ) => void
  onUpdateStatus: (
    classSchedule: ClassSchedule,
  ) => void
}

interface WeekdayOption {
  value: Weekday
  shortLabel: string
  label: string
}

const weekdays: WeekdayOption[] = [
  {
    value: 'MONDAY',
    shortLabel: 'SEG',
    label: 'Segunda-feira',
  },
  {
    value: 'TUESDAY',
    shortLabel: 'TER',
    label: 'Terça-feira',
  },
  {
    value: 'WEDNESDAY',
    shortLabel: 'QUA',
    label: 'Quarta-feira',
  },
  {
    value: 'THURSDAY',
    shortLabel: 'QUI',
    label: 'Quinta-feira',
  },
  {
    value: 'FRIDAY',
    shortLabel: 'SEX',
    label: 'Sexta-feira',
  },
  {
    value: 'SATURDAY',
    shortLabel: 'SÁB',
    label: 'Sábado',
  },
  {
    value: 'SUNDAY',
    shortLabel: 'DOM',
    label: 'Domingo',
  },
]

function getProfessorNames(
  classSchedule: ClassSchedule,
) {
  const names: string[] = []

  if (
    classSchedule.classGroup
      .primaryProfessor
  ) {
    names.push(
      classSchedule.classGroup
        .primaryProfessor.name,
    )
  }

  for (
    const professor of
    classSchedule.classGroup
      .assistantProfessors
  ) {
    names.push(professor.name)
  }

  return names.length > 0
    ? names.join(', ')
    : 'Sem professor'
}

export function WeeklyClassScheduleView({
  classSchedules,
  canManage,
  updatingStatusId,
  onEdit,
  onUpdateStatus,
}: WeeklyClassScheduleViewProps) {
  const schedulesByWeekday =
    useMemo(() => {
      const grouped = new Map<
        Weekday,
        ClassSchedule[]
      >()

      for (const weekday of weekdays) {
        grouped.set(
          weekday.value,
          [],
        )
      }

      for (
        const classSchedule of
        classSchedules
      ) {
        const weekdaySchedules =
          grouped.get(
            classSchedule.weekday,
          ) || []

        weekdaySchedules.push(
          classSchedule,
        )

        grouped.set(
          classSchedule.weekday,
          weekdaySchedules,
        )
      }

      for (
        const weekdaySchedules of
        grouped.values()
      ) {
        weekdaySchedules.sort(
          (first, second) =>
            first.startTime.localeCompare(
              second.startTime,
            ),
        )
      }

      return grouped
    }, [classSchedules])

  return (
    <section className="weekly-schedule">
      <div className="weekly-schedule-scroll">
        <div className="weekly-schedule-grid">
          {weekdays.map((weekday) => {
            const schedules =
              schedulesByWeekday.get(
                weekday.value,
              ) || []

            return (
              <section
                className="weekly-schedule-day"
                key={weekday.value}
              >
                <header className="weekly-schedule-day-header">
                  <span>
                    {weekday.shortLabel}
                  </span>

                  <strong>
                    {weekday.label}
                  </strong>

                  <small>
                    {schedules.length}
                    {' '}
                    {schedules.length === 1
                      ? 'horário'
                      : 'horários'}
                  </small>
                </header>

                <div className="weekly-schedule-day-content">
                  {schedules.length ===
                    0 && (
                    <div className="weekly-schedule-empty">
                      Sem horários
                    </div>
                  )}

                  {schedules.map(
                    (classSchedule) => {
                      const updatingStatus =
                        updatingStatusId ===
                        classSchedule.id

                      return (
                        <article
                          className={`weekly-schedule-card ${
                            classSchedule.active
                              ? ''
                              : 'weekly-schedule-card-inactive'
                          }`}
                          key={
                            classSchedule.id
                          }
                        >
                          <div className="weekly-schedule-card-time">
                            <strong>
                              {
                                classSchedule.startTime
                              }
                            </strong>

                            <span>
                              até
                            </span>

                            <strong>
                              {
                                classSchedule.endTime
                              }
                            </strong>
                          </div>

                          <div className="weekly-schedule-card-heading">
                            <span
                              style={{
                                backgroundColor:
                                  classSchedule
                                    .classGroup
                                    .modality
                                    .color ||
                                  '#ef4444',
                              }}
                            />

                            <h3>
                              {
                                classSchedule
                                  .classGroup
                                  .name
                              }
                            </h3>
                          </div>

                          <p className="weekly-schedule-card-modality">
                            {
                              classSchedule
                                .classGroup
                                .modality.name
                            }
                          </p>

                          <dl className="weekly-schedule-card-information">
                            <div>
                              <dt>
                                Professor
                              </dt>

                              <dd>
                                {getProfessorNames(
                                  classSchedule,
                                )}
                              </dd>
                            </div>

                            <div>
                              <dt>
                                Local
                              </dt>

                              <dd>
                                {classSchedule.room ||
                                  'Não informado'}
                              </dd>
                            </div>
                          </dl>

                          <span
                            className={`weekly-schedule-card-status ${
                              classSchedule.active
                                ? 'weekly-schedule-card-status-active'
                                : 'weekly-schedule-card-status-inactive'
                            }`}
                          >
                            {classSchedule.active
                              ? 'Ativo'
                              : 'Inativo'}
                          </span>

                          {canManage && (
                            <div className="weekly-schedule-card-actions">
                              <button
                                type="button"
                                disabled={
                                  updatingStatus
                                }
                                onClick={() =>
                                  onEdit(
                                    classSchedule,
                                  )
                                }
                              >
                                Editar
                              </button>

                              <button
                                type="button"
                                disabled={
                                  updatingStatus
                                }
                                onClick={() =>
                                  onUpdateStatus(
                                    classSchedule,
                                  )
                                }
                              >
                                {updatingStatus
                                  ? 'Salvando...'
                                  : classSchedule.active
                                    ? 'Inativar'
                                    : 'Ativar'}
                              </button>
                            </div>
                          )}
                        </article>
                      )
                    },
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}