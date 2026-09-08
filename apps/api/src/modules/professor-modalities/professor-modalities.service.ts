import type { Prisma } from '../../generated/prisma/client.js'

import { prisma } from '../../database/prisma.js'

import { AppError } from '../../http/app-error.js'

const professorModalitySelect = {
  id: true,
  gymId: true,
  professorId: true,
  modalityId: true,
  createdAt: true,

  modality: {
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      active: true,
    },
  },
} satisfies Prisma.ProfessorModalitySelect

async function ensureProfessorBelongsToGym(gymId: string, professorId: string) {
  const professor = await prisma.professor.findFirst({
    where: {
      id: professorId,
      gymId,
    },

    select: {
      id: true,
    },
  })

  if (!professor) {
    throw new AppError('PROFESSOR_NOT_FOUND', 404, 'Professor não encontrado.')
  }
}

async function getModalityFromGym(gymId: string, modalityId: string) {
  const modality = await prisma.modality.findFirst({
    where: {
      id: modalityId,
      gymId,
    },

    select: {
      id: true,
      active: true,
    },
  })

  if (!modality) {
    throw new AppError('MODALITY_NOT_FOUND', 404, 'Modalidade não encontrada.')
  }

  return modality
}

export async function listProfessorModalities(gymId: string, professorId: string) {
  await ensureProfessorBelongsToGym(gymId, professorId)

  const professorModalities = await prisma.professorModality.findMany({
    where: {
      gymId,
      professorId,
    },

    orderBy: {
      modality: {
        name: 'asc',
      },
    },

    select: professorModalitySelect,
  })

  return professorModalities
}

export async function createProfessorModality(
  gymId: string,
  professorId: string,
  modalityId: string,
) {
  await ensureProfessorBelongsToGym(gymId, professorId)

  const modality = await getModalityFromGym(gymId, modalityId)

  if (!modality.active) {
    throw new AppError(
      'MODALITY_INACTIVE',
      409,
      'Não é possível vincular uma modalidade inativa.',
    )
  }

  const existingProfessorModality = await prisma.professorModality.findUnique({
    where: {
      professorId_modalityId: {
        professorId,
        modalityId,
      },
    },

    select: {
      id: true,
    },
  })

  if (existingProfessorModality) {
    throw new AppError(
      'PROFESSOR_MODALITY_ALREADY_EXISTS',
      409,
      'O professor já está vinculado a esta modalidade.',
    )
  }

  const professorModality = await prisma.professorModality.create({
    data: {
      gymId,
      professorId,
      modalityId,
    },

    select: professorModalitySelect,
  })

  return professorModality
}

export async function deleteProfessorModality(
  gymId: string,
  professorId: string,
  modalityId: string,
) {
  await ensureProfessorBelongsToGym(gymId, professorId)

  await getModalityFromGym(gymId, modalityId)

  const professorModality = await prisma.professorModality.findFirst({
    where: {
      gymId,
      professorId,
      modalityId,
    },

    select: professorModalitySelect,
  })

  if (!professorModality) {
    throw new AppError(
      'PROFESSOR_MODALITY_NOT_FOUND',
      404,
      'Vínculo entre professor e modalidade não encontrado.',
    )
  }

  await prisma.professorModality.delete({
    where: {
      id: professorModality.id,
    },
  })

  return professorModality
}