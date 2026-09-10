import {
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  createClassSchedule,
  updateClassSchedule,
} from '../../services/class-schedule.service'

import type {
  ClassGroup,
} from '../../types/class-group'

import type {
  ClassSchedule,
  CreateClassScheduleInput,
  Weekday,
} from '../../types/class-schedule'

import '../../styles/class-schedule-modal.css'

interface ManageClassScheduleModalProps {
  gymId: string
  classGroups: ClassGroup[]
  classSchedule?: ClassSchedule | null
  onClose: () => void
  onSaved: (
    classSchedule: ClassSchedule,
  ) => void
}

interface ClassScheduleFormState {
  classGroupId: string
  weekday: Weekday
  startTime: string
  endTime: string
  room: string
  notes: string
  validFrom: string
  validUntil: string
}

const initialFormState: ClassScheduleFormState = {
  classGroupId: '',
  weekday: 'MONDAY',
  startTime: '',
  endTime: '',
  room: '',
  notes: '',
  validFrom: '',
  validUntil: '',
}

const weekdayOptions: Array<{
  value: Weekday
  label: string
}> = [
  {
    value: 'MONDAY',
    label: 'Segunda-feira',
  },
  {
    value: 'TUESDAY',
    label: 'Terça-feira',
  },
  {
    value: 'WEDNESDAY',
    label: 'Quarta-feira',
  },
  {
    value: 'THURSDAY',
    label: 'Quinta-feira',
  },
  {
    value: 'FRIDAY',
    label: 'Sexta-feira',
  },
  {
    value: 'SATURDAY',
    label: 'Sábado',
  },
  {
    value: 'SUNDAY',
    label: 'Domingo',
  },
]

function timeToMinutes(
  value: string,
) {
  const [
    hour,
    minute,
  ] = value
    .split(':')
    .map(Number)

  return hour * 60 + minute
}

function getErrorMessage(
  error: unknown,
) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Não foi possível salvar o horário.'
}

export function ManageClassScheduleModal({
  gymId,
  classGroups,
  classSchedule,
  onClose,
  onSaved,
}: ManageClassScheduleModalProps) {
  const isEditing =
    Boolean(classSchedule)

  const [
    form,
    setForm,
  ] = useState<ClassScheduleFormState>(
    initialFormState,
  )

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(null)

  const activeClassGroups =
    useMemo(() => {
      return classGroups.filter(
        (classGroup) =>
          classGroup.active ||
          classGroup.id ===
            classSchedule?.classGroupId,
      )
    }, [
      classGroups,
      classSchedule?.classGroupId,
    ])

  useEffect(() => {
    if (classSchedule) {
      setForm({
        classGroupId:
          classSchedule.classGroupId,

        weekday:
          classSchedule.weekday,

        startTime:
          classSchedule.startTime,

        endTime:
          classSchedule.endTime,

        room:
          classSchedule.room || '',

        notes:
          classSchedule.notes || '',

        validFrom:
          classSchedule.validFrom || '',

        validUntil:
          classSchedule.validUntil || '',
      })

      return
    }

    setForm({
      ...initialFormState,

      classGroupId:
        activeClassGroups[0]?.id || '',
    })
  }, [
    activeClassGroups,
    classSchedule,
  ])

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key === 'Escape' &&
        !saving
      ) {
        onClose()
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown,
    )

    const previousOverflow =
      document.body.style.overflow

    document.body.style.overflow =
      'hidden'

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      document.body.style.overflow =
        previousOverflow
    }
  }, [
    onClose,
    saving,
  ])

  function updateForm<
    Field extends keyof ClassScheduleFormState,
  >(
    field: Field,
    value: ClassScheduleFormState[Field],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))

    setError(null)
  }

  function validateForm() {
    if (!form.classGroupId) {
      return 'Selecione uma turma.'
    }

    if (!form.startTime) {
      return 'Informe o horário inicial.'
    }

    if (!form.endTime) {
      return 'Informe o horário final.'
    }

    if (
      timeToMinutes(form.endTime) <=
      timeToMinutes(form.startTime)
    ) {
      return 'O horário final deve ser posterior ao horário inicial.'
    }

    if (
      form.validFrom &&
      form.validUntil &&
      form.validUntil < form.validFrom
    ) {
      return 'A data final deve ser igual ou posterior à data inicial.'
    }

    if (
      form.room.trim().length > 150
    ) {
      return 'O local deve possuir no máximo 150 caracteres.'
    }

    if (
      form.notes.trim().length > 5000
    ) {
      return 'As observações devem possuir no máximo 5000 caracteres.'
    }

    return null
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (saving) {
      return
    }

    const validationError =
      validateForm()

    if (validationError) {
      setError(validationError)

      return
    }

    const input: CreateClassScheduleInput = {
      classGroupId:
        form.classGroupId,

      weekday:
        form.weekday,

      startTime:
        form.startTime,

      endTime:
        form.endTime,

      room:
        form.room.trim() ||
        undefined,

      notes:
        form.notes.trim() ||
        undefined,

      validFrom:
        form.validFrom ||
        undefined,

      validUntil:
        form.validUntil ||
        undefined,
    }

    setSaving(true)
    setError(null)

    try {
      const response =
        classSchedule
          ? await updateClassSchedule(
              gymId,
              classSchedule.id,
              input,
            )
          : await createClassSchedule(
              gymId,
              input,
            )

      onSaved(
        response.classSchedule,
      )
    } catch (saveError) {
      setError(
        getErrorMessage(saveError),
      )
    } finally {
      setSaving(false)
    }
  }

  function handleBackdropClick(
    event: React.MouseEvent<HTMLDivElement>,
  ) {
    if (
      event.target ===
        event.currentTarget &&
      !saving
    ) {
      onClose()
    }
  }

  return (
    <div
      className="class-schedule-modal-backdrop"
      role="presentation"
      onMouseDown={
        handleBackdropClick
      }
    >
      <section
        className="class-schedule-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-schedule-modal-title"
      >
        <header className="class-schedule-modal-header">
          <div>
            <span className="class-schedule-modal-eyebrow">
              Grade de horários
            </span>

            <h2 id="class-schedule-modal-title">
              {isEditing
                ? 'Editar horário'
                : 'Novo horário'}
            </h2>

            <p>
              {isEditing
                ? 'Atualize a turma, o período e as informações do horário.'
                : 'Cadastre um novo horário recorrente para uma turma.'}
            </p>
          </div>

          <button
            className="class-schedule-modal-close"
            type="button"
            aria-label="Fechar modal"
            disabled={saving}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <form
          className="class-schedule-modal-form"
          onSubmit={handleSubmit}
        >
          <div className="class-schedule-form-grid">
            <label className="class-schedule-form-field class-schedule-form-field-full">
              <span>
                Turma *
              </span>

              <select
                required
                value={
                  form.classGroupId
                }
                disabled={
                  saving ||
                  activeClassGroups.length ===
                    0
                }
                onChange={(event) =>
                  updateForm(
                    'classGroupId',
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Selecione uma turma
                </option>

                {activeClassGroups.map(
                  (classGroup) => (
                    <option
                      key={classGroup.id}
                      value={classGroup.id}
                    >
                      {classGroup.name}
                      {' — '}
                      {
                        classGroup
                          .modality.name
                      }
                    </option>
                  ),
                )}
              </select>

              {activeClassGroups.length ===
                0 && (
                <small>
                  Nenhuma turma ativa está
                  disponível.
                </small>
              )}
            </label>

            <label className="class-schedule-form-field">
              <span>
                Dia da semana *
              </span>

              <select
                required
                value={form.weekday}
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'weekday',
                    event.target
                      .value as Weekday,
                  )
                }
              >
                {weekdayOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>

            <div className="class-schedule-form-spacer" />

            <label className="class-schedule-form-field">
              <span>
                Horário inicial *
              </span>

              <input
                required
                type="time"
                value={
                  form.startTime
                }
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'startTime',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="class-schedule-form-field">
              <span>
                Horário final *
              </span>

              <input
                required
                type="time"
                value={form.endTime}
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'endTime',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="class-schedule-form-field class-schedule-form-field-full">
              <span>
                Local
              </span>

              <input
                type="text"
                maxLength={150}
                value={form.room}
                disabled={saving}
                placeholder="Ex.: Tatame principal"
                onChange={(event) =>
                  updateForm(
                    'room',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="class-schedule-form-field">
              <span>
                Vigência inicial
              </span>

              <input
                type="date"
                value={form.validFrom}
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'validFrom',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="class-schedule-form-field">
              <span>
                Vigência final
              </span>

              <input
                type="date"
                min={
                  form.validFrom ||
                  undefined
                }
                value={form.validUntil}
                disabled={saving}
                onChange={(event) =>
                  updateForm(
                    'validUntil',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="class-schedule-form-field class-schedule-form-field-full">
              <span>
                Observações
              </span>

              <textarea
                rows={4}
                maxLength={5000}
                value={form.notes}
                disabled={saving}
                placeholder="Informações adicionais sobre o horário."
                onChange={(event) =>
                  updateForm(
                    'notes',
                    event.target.value,
                  )
                }
              />

              <small>
                {form.notes.length}
                /5000 caracteres
              </small>
            </label>
          </div>

          {error && (
            <div
              className="class-schedule-form-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <footer className="class-schedule-modal-actions">
            <button
              className="class-schedule-modal-button class-schedule-modal-button-secondary"
              type="button"
              disabled={saving}
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              className="class-schedule-modal-button class-schedule-modal-button-primary"
              type="submit"
              disabled={
                saving ||
                activeClassGroups.length ===
                  0
              }
            >
              {saving
                ? 'Salvando...'
                : isEditing
                  ? 'Salvar alterações'
                  : 'Cadastrar horário'}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}