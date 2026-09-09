import { type FormEvent, useEffect, useState } from 'react'

import { ApiError } from '../../services/api'
import { createClassGroup } from '../../services/class-group.service'
import { getModalities } from '../../services/modality.service'
import type { ClassGroupLevel, CreateClassGroupInput } from '../../types/class-group'
import type { Modality } from '../../types/modality'

import '../../styles/class-groups-modal.css'

interface AddClassGroupModalProps {
  gymId: string
  onClose: () => void
  onCreated: () => Promise<void>
}

function optionalNumber(value: string) {
  return value === '' ? undefined : Number(value)
}

export function AddClassGroupModal({ gymId, onClose, onCreated }: AddClassGroupModalProps) {
  const [modalities, setModalities] = useState<Modality[]>([])
  const [modalityId, setModalityId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState<ClassGroupLevel>('MIXED')
  const [minimumAge, setMinimumAge] = useState('')
  const [maximumAge, setMaximumAge] = useState('')
  const [maxStudents, setMaxStudents] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('60')
  const [loadingModalities, setLoadingModalities] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadModalities() {
      try {
        setLoadingModalities(true)
        const response = await getModalities(gymId, { page: 1, limit: 100, active: true })
        setModalities(response.modalities)
        setModalityId(response.modalities[0]?.id ?? '')
      } catch {
        setError('Não foi possível carregar as modalidades.')
      } finally {
        setLoadingModalities(false)
      }
    }

    void loadModalities()
  }, [gymId])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isSubmitting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSubmitting, onClose])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsedMinimumAge = optionalNumber(minimumAge)
    const parsedMaximumAge = optionalNumber(maximumAge)
    const parsedMaxStudents = optionalNumber(maxStudents)
    const parsedDuration = Number(durationMinutes)

    if (!modalityId) return setError('Selecione uma modalidade.')
    if (name.trim().length < 2) return setError('Informe um nome com pelo menos 2 caracteres.')
    if (parsedMinimumAge !== undefined && parsedMaximumAge !== undefined && parsedMaximumAge < parsedMinimumAge) {
      return setError('A idade máxima deve ser maior ou igual à idade mínima.')
    }
    if (!Number.isInteger(parsedDuration) || parsedDuration < 15 || parsedDuration > 300) {
      return setError('A duração deve estar entre 15 e 300 minutos.')
    }

    const input: CreateClassGroupInput = {
      modalityId,
      name: name.trim(),
      description: description.trim() || undefined,
      level,
      minimumAge: parsedMinimumAge,
      maximumAge: parsedMaximumAge,
      maxStudents: parsedMaxStudents,
      durationMinutes: parsedDuration,
    }

    try {
      setIsSubmitting(true)
      await createClassGroup(gymId, input)
      await onCreated()
      onClose()
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.message : 'Não foi possível cadastrar a turma.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="class-group-modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSubmitting) onClose()
    }}>
      <section className="class-group-modal" role="dialog" aria-modal="true" aria-labelledby="class-group-add-title">
        <header className="class-group-modal-header">
          <div>
            <span className="class-groups-eyebrow">Gestão acadêmica</span>
            <h2 id="class-group-add-title">Nova turma</h2>
            <p>Cadastre uma nova turma para a academia selecionada.</p>
          </div>
          <button type="button" className="class-group-modal-close" disabled={isSubmitting} onClick={onClose}>×</button>
        </header>

        <form className="class-group-modal-form" onSubmit={(event) => void handleSubmit(event)}>
          <div className="class-group-form-grid">
            <label className="class-group-form-field class-group-form-field-full">
              <span>Nome *</span>
              <input value={name} minLength={2} maxLength={150} required disabled={isSubmitting} placeholder="Ex.: Jiu-Jitsu Adulto" onChange={(event) => setName(event.target.value)} />
            </label>

            <label className="class-group-form-field">
              <span>Modalidade *</span>
              <select value={modalityId} required disabled={loadingModalities || isSubmitting} onChange={(event) => setModalityId(event.target.value)}>
                <option value="">Selecione</option>
                {modalities.map((modality) => <option key={modality.id} value={modality.id}>{modality.name}</option>)}
              </select>
            </label>

            <label className="class-group-form-field">
              <span>Nível *</span>
              <select value={level} disabled={isSubmitting} onChange={(event) => setLevel(event.target.value as ClassGroupLevel)}>
                <option value="BEGINNER">Iniciante</option>
                <option value="INTERMEDIATE">Intermediário</option>
                <option value="ADVANCED">Avançado</option>
                <option value="MIXED">Misto</option>
              </select>
            </label>

            <label className="class-group-form-field class-group-form-field-full">
              <span>Descrição</span>
              <textarea value={description} maxLength={5000} rows={4} disabled={isSubmitting} placeholder="Descrição opcional da turma" onChange={(event) => setDescription(event.target.value)} />
            </label>

            <label className="class-group-form-field"><span>Idade mínima</span><input type="number" min={0} max={120} value={minimumAge} disabled={isSubmitting} onChange={(event) => setMinimumAge(event.target.value)} /></label>
            <label className="class-group-form-field"><span>Idade máxima</span><input type="number" min={0} max={120} value={maximumAge} disabled={isSubmitting} onChange={(event) => setMaximumAge(event.target.value)} /></label>
            <label className="class-group-form-field"><span>Capacidade</span><input type="number" min={1} max={1000} value={maxStudents} disabled={isSubmitting} placeholder="Sem limite" onChange={(event) => setMaxStudents(event.target.value)} /></label>
            <label className="class-group-form-field"><span>Duração (minutos) *</span><input type="number" min={15} max={300} value={durationMinutes} required disabled={isSubmitting} onChange={(event) => setDurationMinutes(event.target.value)} /></label>
          </div>

          {error ? <div className="class-group-form-error" role="alert">{error}</div> : null}

          <footer className="class-group-modal-actions">
            <button type="button" className="class-groups-button class-groups-button-secondary" disabled={isSubmitting} onClick={onClose}>Cancelar</button>
            <button type="submit" className="class-groups-button class-groups-button-primary" disabled={isSubmitting || loadingModalities || modalities.length === 0}>{isSubmitting ? 'Salvando...' : 'Cadastrar turma'}</button>
          </footer>
        </form>
      </section>
    </div>
  )
}
