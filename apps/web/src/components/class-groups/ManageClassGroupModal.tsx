import { type FormEvent, useEffect, useState } from "react";

import { ApiError } from "../../services/api";
import {
  createClassGroupProfessor,
  deleteClassGroupProfessor,
  getClassGroupById,
  getClassGroupProfessors,
  updateClassGroup,
  updateClassGroupStatus,
} from "../../services/class-group.service";
import { getModalities } from "../../services/modality.service";
import { getProfessors } from "../../services/professor.service";
import type {
  ClassGroup,
  ClassGroupLevel,
  ClassGroupProfessor,
  ClassGroupProfessorRole,
  UpdateClassGroupInput,
} from "../../types/class-group";
import type { Modality } from "../../types/modality";
import type { Professor } from "../../types/professor";

import "../../styles/class-groups-modal.css";

interface ManageClassGroupModalProps {
  gymId: string;
  classGroupId: string;
  canEdit: boolean;
  onClose: () => void;
  onUpdated: () => Promise<void>;
}

function optionalNumber(value: string) {
  return value === "" ? undefined : Number(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ManageClassGroupModal({
  gymId,
  classGroupId,
  canEdit,
  onClose,
  onUpdated,
}: ManageClassGroupModalProps) {
  const [classGroup, setClassGroup] = useState<ClassGroup | null>(null);
  const [modalities, setModalities] = useState<Modality[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [assignedProfessors, setAssignedProfessors] = useState<
    ClassGroupProfessor[]
  >([]);
  const [selectedProfessorId, setSelectedProfessorId] = useState("");
  const [professorRole, setProfessorRole] =
    useState<ClassGroupProfessorRole>("ASSISTANT");
  const [modalityId, setModalityId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState<ClassGroupLevel>("MIXED");
  const [minimumAge, setMinimumAge] = useState("");
  const [maximumAge, setMaximumAge] = useState("");
  const [maxStudents, setMaxStudents] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingStatus, setConfirmingStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssigningProfessor, setIsAssigningProfessor] = useState(false);
  const [removingProfessorId, setRemovingProfessorId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  function fillForm(current: ClassGroup) {
    setModalityId(current.modalityId);
    setName(current.name);
    setDescription(current.description ?? "");
    setLevel(current.level);
    setMinimumAge(
      current.minimumAge === null ? "" : String(current.minimumAge),
    );
    setMaximumAge(
      current.maximumAge === null ? "" : String(current.maximumAge),
    );
    setMaxStudents(
      current.maxStudents === null ? "" : String(current.maxStudents),
    );
    setDurationMinutes(String(current.durationMinutes));
  }

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [
        groupResponse,
        modalityResponse,
        professorsResponse,
        assignedResponse,
      ] = await Promise.all([
        getClassGroupById(gymId, classGroupId),
        getModalities(gymId, { page: 1, limit: 100 }),
        getProfessors(gymId, { page: 1, limit: 100, active: true }),
        getClassGroupProfessors(gymId, classGroupId),
      ]);
      setClassGroup(groupResponse.classGroup);
      setModalities(modalityResponse.modalities);
      setProfessors(professorsResponse.professors);
      setAssignedProfessors(assignedResponse.professors);
      fillForm(groupResponse.classGroup);
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível carregar a turma.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, [gymId, classGroupId]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || isSubmitting || isUpdatingStatus) return;
      if (confirmingStatus) return setConfirmingStatus(false);
      if (isEditing) {
        setIsEditing(false);
        if (classGroup) fillForm(classGroup);
        setError(null);
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    classGroup,
    confirmingStatus,
    isEditing,
    isSubmitting,
    isUpdatingStatus,
    onClose,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!classGroup) return;
    setError(null);

    const parsedMinimumAge = optionalNumber(minimumAge);
    const parsedMaximumAge = optionalNumber(maximumAge);
    const parsedMaxStudents = optionalNumber(maxStudents);
    const parsedDuration = Number(durationMinutes);

    if (!modalityId) return setError("Selecione uma modalidade.");
    if (name.trim().length < 2)
      return setError("Informe um nome com pelo menos 2 caracteres.");
    if (
      parsedMinimumAge !== undefined &&
      parsedMaximumAge !== undefined &&
      parsedMaximumAge < parsedMinimumAge
    ) {
      return setError("A idade máxima deve ser maior ou igual à idade mínima.");
    }
    if (
      !Number.isInteger(parsedDuration) ||
      parsedDuration < 15 ||
      parsedDuration > 300
    ) {
      return setError("A duração deve estar entre 15 e 300 minutos.");
    }

    const input: UpdateClassGroupInput = {
      modalityId,
      name: name.trim(),
      description: description.trim() || undefined,
      level,
      minimumAge: parsedMinimumAge,
      maximumAge: parsedMaximumAge,
      maxStudents: parsedMaxStudents,
      durationMinutes: parsedDuration,
    };

    try {
      setIsSubmitting(true);
      const response = await updateClassGroup(gymId, classGroupId, input);
      setClassGroup(response.classGroup);
      fillForm(response.classGroup);
      setIsEditing(false);
      await onUpdated();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível atualizar a turma.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange() {
    if (!classGroup) return;
    try {
      setIsUpdatingStatus(true);
      setError(null);
      const response = await updateClassGroupStatus(gymId, classGroupId, {
        active: !classGroup.active,
      });
      setClassGroup(response.classGroup);
      fillForm(response.classGroup);
      setConfirmingStatus(false);
      await onUpdated();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível alterar o status da turma.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function refreshProfessors() {
    const [groupResponse, assignedResponse] = await Promise.all([
      getClassGroupById(gymId, classGroupId),
      getClassGroupProfessors(gymId, classGroupId),
    ]);

    setClassGroup(groupResponse.classGroup);
    setAssignedProfessors(assignedResponse.professors);
    fillForm(groupResponse.classGroup);
    await onUpdated();
  }

  async function handleAssignProfessor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProfessorId || !canEdit) {
      setError("Selecione um professor.");
      return;
    }

    try {
      setIsAssigningProfessor(true);
      setError(null);
      await createClassGroupProfessor(gymId, classGroupId, {
        professorId: selectedProfessorId,
        role: professorRole,
      });
      setSelectedProfessorId("");
      setProfessorRole("ASSISTANT");
      await refreshProfessors();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível vincular o professor.",
      );
    } finally {
      setIsAssigningProfessor(false);
    }
  }

  async function handleRemoveProfessor(professorId: string) {
    if (!canEdit) return;

    try {
      setRemovingProfessorId(professorId);
      setError(null);
      await deleteClassGroupProfessor(gymId, classGroupId, professorId);
      await refreshProfessors();
    } catch (caughtError) {
      setError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "Não foi possível remover o professor.",
      );
    } finally {
      setRemovingProfessorId(null);
    }
  }

  const busy =
    isSubmitting ||
    isUpdatingStatus ||
    isAssigningProfessor ||
    removingProfessorId !== null;
  const availableProfessors = professors.filter(
    (professor) =>
      !assignedProfessors.some(
        (relation) => relation.professorId === professor.id,
      ),
  );

  return (
    <div
      className="class-group-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="class-group-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="class-group-manage-title"
      >
        <header className="class-group-modal-header">
          <div>
            <span className="class-groups-eyebrow">Gestão acadêmica</span>
            <h2 id="class-group-manage-title">
              {isEditing ? "Editar turma" : "Detalhes da turma"}
            </h2>
            <p>Consulte os dados acadêmicos e operacionais.</p>
          </div>
          <button
            type="button"
            className="class-group-modal-close"
            disabled={busy}
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {loading ? (
          <div className="class-group-modal-state">
            <div className="class-groups-loading-spinner" />
            <span>Carregando turma...</span>
          </div>
        ) : null}

        {!loading && !classGroup ? (
          <div className="class-group-modal-state class-group-modal-state-error">
            <strong>Não foi possível carregar a turma.</strong>
            {error ? <span>{error}</span> : null}
            <button
              type="button"
              className="class-groups-button class-groups-button-secondary"
              onClick={() => void loadData()}
            >
              Tentar novamente
            </button>
          </div>
        ) : null}

        {!loading && classGroup && isEditing ? (
          <form
            className="class-group-modal-form"
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="class-group-form-grid">
              <label className="class-group-form-field class-group-form-field-full">
                <span>Nome *</span>
                <input
                  value={name}
                  required
                  minLength={2}
                  maxLength={150}
                  disabled={isSubmitting}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>
              <label className="class-group-form-field">
                <span>Modalidade *</span>
                <select
                  value={modalityId}
                  disabled={isSubmitting}
                  onChange={(event) => setModalityId(event.target.value)}
                >
                  {modalities
                    .filter(
                      (item) =>
                        item.active || item.id === classGroup.modalityId,
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
              </label>
              <label className="class-group-form-field">
                <span>Nível *</span>
                <select
                  value={level}
                  disabled={isSubmitting}
                  onChange={(event) =>
                    setLevel(event.target.value as ClassGroupLevel)
                  }
                >
                  <option value="BEGINNER">Iniciante</option>
                  <option value="INTERMEDIATE">Intermediário</option>
                  <option value="ADVANCED">Avançado</option>
                  <option value="MIXED">Misto</option>
                </select>
              </label>
              <label className="class-group-form-field class-group-form-field-full">
                <span>Descrição</span>
                <textarea
                  value={description}
                  maxLength={5000}
                  rows={4}
                  disabled={isSubmitting}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>
              <label className="class-group-form-field">
                <span>Idade mínima</span>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={minimumAge}
                  disabled={isSubmitting}
                  onChange={(event) => setMinimumAge(event.target.value)}
                />
              </label>
              <label className="class-group-form-field">
                <span>Idade máxima</span>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={maximumAge}
                  disabled={isSubmitting}
                  onChange={(event) => setMaximumAge(event.target.value)}
                />
              </label>
              <label className="class-group-form-field">
                <span>Capacidade</span>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={maxStudents}
                  disabled={isSubmitting}
                  onChange={(event) => setMaxStudents(event.target.value)}
                />
              </label>
              <label className="class-group-form-field">
                <span>Duração (minutos) *</span>
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={durationMinutes}
                  required
                  disabled={isSubmitting}
                  onChange={(event) => setDurationMinutes(event.target.value)}
                />
              </label>
            </div>
            {error ? (
              <div className="class-group-form-error" role="alert">
                {error}
              </div>
            ) : null}
            <footer className="class-group-modal-actions">
              <button
                type="button"
                className="class-groups-button class-groups-button-secondary"
                disabled={isSubmitting}
                onClick={() => {
                  fillForm(classGroup);
                  setError(null);
                  setIsEditing(false);
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="class-groups-button class-groups-button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </button>
            </footer>
          </form>
        ) : null}

        {!loading && classGroup && !isEditing ? (
          <div className="class-group-modal-content">
            <div className="class-group-detail-heading">
              <div>
                <h3>{classGroup.name}</h3>
                <span>{classGroup.modality.name}</span>
              </div>
              <span
                className={
                  classGroup.active
                    ? "class-group-status class-group-status-active"
                    : "class-group-status class-group-status-inactive"
                }
              >
                {classGroup.active ? "Ativa" : "Inativa"}
              </span>
            </div>
            {classGroup.description ? (
              <p className="class-group-detail-description">
                {classGroup.description}
              </p>
            ) : null}
            <div className="class-group-detail-grid">
              <div>
                <span>Nível</span>
                <strong>{classGroup.level}</strong>
              </div>
              <div>
                <span>Duração</span>
                <strong>{classGroup.durationMinutes} minutos</strong>
              </div>
              <div>
                <span>Idade mínima</span>
                <strong>{classGroup.minimumAge ?? "Não definida"}</strong>
              </div>
              <div>
                <span>Idade máxima</span>
                <strong>{classGroup.maximumAge ?? "Não definida"}</strong>
              </div>
              <div>
                <span>Capacidade</span>
                <strong>{classGroup.maxStudents ?? "Sem limite"}</strong>
              </div>
              <div>
                <span>Professores</span>
                <strong>{classGroup.totalProfessors}</strong>
              </div>
            </div>
            <div className="class-group-detail-dates">
              <span>
                Criado em <strong>{formatDate(classGroup.createdAt)}</strong>
              </span>
              <span>
                Atualizado em{" "}
                <strong>{formatDate(classGroup.updatedAt)}</strong>
              </span>
            </div>
            <section className="class-group-professor-management">
              <div className="class-group-professor-management-header">
                <div>
                  <span className="class-groups-eyebrow">Equipe técnica</span>
                  <h3>Professores da turma</h3>
                </div>
                <small>{assignedProfessors.length} vinculado(s)</small>
              </div>

              {assignedProfessors.length === 0 ? (
                <p className="class-group-professor-empty">
                  Nenhum professor vinculado.
                </p>
              ) : (
                <div className="class-group-professor-list">
                  {assignedProfessors.map((relation) => (
                    <div
                      key={relation.id}
                      className="class-group-professor-item"
                    >
                      <div>
                        <strong>{relation.professor.name}</strong>
                        <span>
                          {relation.role === "PRIMARY"
                            ? "Professor principal"
                            : "Professor auxiliar"}
                        </span>
                      </div>
                      {canEdit ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void handleRemoveProfessor(relation.professorId)
                          }
                        >
                          {removingProfessorId === relation.professorId
                            ? "Removendo..."
                            : "Remover"}
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              {canEdit ? (
                <form
                  className="class-group-professor-form"
                  onSubmit={(event) => void handleAssignProfessor(event)}
                >
                  <label className="class-group-form-field">
                    <span>Professor</span>
                    <select
                      value={selectedProfessorId}
                      disabled={busy || availableProfessors.length === 0}
                      onChange={(event) =>
                        setSelectedProfessorId(event.target.value)
                      }
                    >
                      <option value="">Selecione</option>
                      {availableProfessors.map((professor) => (
                        <option key={professor.id} value={professor.id}>
                          {professor.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="class-group-form-field">
                    <span>Função</span>
                    <select
                      value={professorRole}
                      disabled={busy}
                      onChange={(event) =>
                        setProfessorRole(
                          event.target.value as ClassGroupProfessorRole,
                        )
                      }
                    >
                      <option value="PRIMARY">Principal</option>
                      <option value="ASSISTANT">Auxiliar</option>
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="class-groups-button class-groups-button-secondary"
                    disabled={busy || !selectedProfessorId}
                  >
                    {isAssigningProfessor
                      ? "Vinculando..."
                      : "Vincular professor"}
                  </button>
                  <small className="class-group-professor-hint">
                    O professor deve estar ativo e vinculado à modalidade{" "}
                    {classGroup.modality.name}.
                  </small>
                </form>
              ) : null}
            </section>
            {error ? (
              <div className="class-group-form-error" role="alert">
                {error}
              </div>
            ) : null}
            {confirmingStatus ? (
              <div className="class-group-status-confirmation">
                <strong>
                  {classGroup.active
                    ? "Inativar esta turma?"
                    : "Ativar esta turma?"}
                </strong>
                <p>
                  {classGroup.active
                    ? "A turma deixará de aparecer como disponível."
                    : "A turma voltará a ficar disponível."}
                </p>
                <div>
                  <button
                    type="button"
                    className="class-groups-button class-groups-button-secondary"
                    disabled={isUpdatingStatus}
                    onClick={() => setConfirmingStatus(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="class-groups-button class-groups-button-danger"
                    disabled={isUpdatingStatus}
                    onClick={() => void handleStatusChange()}
                  >
                    {isUpdatingStatus ? "Alterando..." : "Confirmar"}
                  </button>
                </div>
              </div>
            ) : null}
            <footer className="class-group-modal-actions">
              {canEdit && !confirmingStatus ? (
                <>
                  <button
                    type="button"
                    className="class-groups-button class-groups-button-primary"
                    onClick={() => {
                      setError(null);
                      setIsEditing(true);
                    }}
                  >
                    Editar turma
                  </button>
                  <button
                    type="button"
                    className="class-groups-button class-groups-button-danger-outline"
                    onClick={() => {
                      setError(null);
                      setConfirmingStatus(true);
                    }}
                  >
                    {classGroup.active ? "Inativar turma" : "Ativar turma"}
                  </button>
                </>
              ) : null}
              {!confirmingStatus ? (
                <button
                  type="button"
                  className="class-groups-button class-groups-button-secondary"
                  onClick={onClose}
                >
                  Fechar
                </button>
              ) : null}
            </footer>
          </div>
        ) : null}
      </section>
    </div>
  );
}
