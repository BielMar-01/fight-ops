export interface ProfessorModalityDetails {
  id: string
  name: string
  description: string | null
  color: string | null
  active: boolean
}

export interface ProfessorModality {
  id: string
  gymId: string
  professorId: string
  modalityId: string
  createdAt: string

  modality: ProfessorModalityDetails
}

export interface ProfessorModalitiesResponse {
  professorModalities: ProfessorModality[]
}

export interface ProfessorModalityResponse {
  professorModality: ProfessorModality
}

export interface CreateProfessorModalityInput {
  modalityId: string
}