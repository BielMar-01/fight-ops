import { prisma } from '../../database/prisma.js'

import { AppError } from '../../http/app-error.js'

import { getClassGroupById } from './class-groups.service.js'

import type {
  ClassGroupProfessorRole,
  CreateClassGroupProfessorBody,
} from './class-groups.types.js'

const classGroupProfessorSelect = {
  id: true,
  gymId: true,
  classGroupId: true,
  professorId: true,
  role: true,
  createdAt: true,
  updatedAt: true,

  professor: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      active: true,
    },
  },
} as const

async function getProfessorFromGym(
  gymId: string,
  professorId: string,
) {
  const professor =
    await prisma.professor.findFirst({
      where: {
        id: professorId,
        gymId,
      },

      select: {
        id: true,
        name: true,
        active: true,
      },
    })

  if (!professor) {
    throw new AppError(
      'PROFESSOR_NOT_FOUND',
      404,
      'Professor não encontrado.',
    )
  }

  return professor
}

async function ensureProfessorIsActive(
  gymId: string,
  professorId: string,
) {
  const professor = await getProfessorFromGym(
    gymId,
    professorId,
  )

  if (!professor.active) {
    throw new AppError(
      'PROFESSOR_INACTIVE',
      409,
      'Não é possível vincular um professor inativo à turma.',
    )
  }

  return professor
}

async function ensureProfessorSupportsModality(
  gymId: string,
  professorId: string,
  modalityId: string,
) {
  const professorModality =
    await prisma.professorModality.findFirst({
      where: {
        gymId,
        professorId,
        modalityId,
      },

      select: {
        id: true,
      },
    })

  if (!professorModality) {
    throw new AppError(
      'PROFESSOR_MODALITY_NOT_FOUND',
      409,
      'O professor não está vinculado à modalidade da turma.',
    )
  }
}

async function ensureProfessorNotAssigned(
  gymId: string,
  classGroupId: string,
  professorId: string,
) {
  const existingRelation =
    await prisma.classGroupProfessor.findFirst({
      where: {
        gymId,
        classGroupId,
        professorId,
      },

      select: {
        id: true,
      },
    })

  if (existingRelation) {
    throw new AppError(
      'CLASS_GROUP_PROFESSOR_ALREADY_EXISTS',
      409,
      'O professor já está vinculado a esta turma.',
    )
  }
}

async function ensurePrimaryProfessorAvailable(
  gymId: string,
  classGroupId: string,
  role: ClassGroupProfessorRole,
) {
  if (role !== 'PRIMARY') {
    return
  }

  const existingPrimaryProfessor =
    await prisma.classGroupProfessor.findFirst({
      where: {
        gymId,
        classGroupId,
        role: 'PRIMARY',
      },

      select: {
        id: true,
      },
    })

  if (existingPrimaryProfessor) {
    throw new AppError(
      'CLASS_GROUP_PRIMARY_PROFESSOR_ALREADY_EXISTS',
      409,
      'A turma já possui um professor principal.',
    )
  }
}

export async function listClassGroupProfessors(
  gymId: string,
  classGroupId: string,
) {
  await getClassGroupById(
    gymId,
    classGroupId,
  )

  const professors =
    await prisma.classGroupProfessor.findMany({
      where: {
        gymId,
        classGroupId,
      },

      orderBy: [
        {
          role: 'asc',
        },
        {
          professor: {
            name: 'asc',
          },
        },
      ],

      select: classGroupProfessorSelect,
    })

  return professors
}

export async function createClassGroupProfessor(
  gymId: string,
  classGroupId: string,
  input: CreateClassGroupProfessorBody,
) {
  const classGroup = await getClassGroupById(
    gymId,
    classGroupId,
  )

  await ensureProfessorIsActive(
    gymId,
    input.professorId,
  )

  await ensureProfessorSupportsModality(
    gymId,
    input.professorId,
    classGroup.modalityId,
  )

  await ensureProfessorNotAssigned(
    gymId,
    classGroupId,
    input.professorId,
  )

  await ensurePrimaryProfessorAvailable(
    gymId,
    classGroupId,
    input.role,
  )

  return prisma.classGroupProfessor.create({
    data: {
      gymId,
      classGroupId,
      professorId: input.professorId,
      role: input.role,
    },

    select: classGroupProfessorSelect,
  })
}

export async function deleteClassGroupProfessor(
  gymId: string,
  classGroupId: string,
  professorId: string,
) {
  await getClassGroupById(
    gymId,
    classGroupId,
  )

  const relation =
    await prisma.classGroupProfessor.findFirst({
      where: {
        gymId,
        classGroupId,
        professorId,
      },

      select: classGroupProfessorSelect,
    })

  if (!relation) {
    throw new AppError(
      'CLASS_GROUP_PROFESSOR_NOT_FOUND',
      404,
      'Vínculo do professor com a turma não encontrado.',
    )
  }

  await prisma.classGroupProfessor.delete({
    where: {
      id: relation.id,
    },
  })

  return relation
}