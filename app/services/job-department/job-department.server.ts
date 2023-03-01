import type { JobDepartment } from '@prisma/client'
import type { JobDepartmentInputSchema } from './job-department.schema'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'

export const getJobDepartments = async () => {
  return prisma.jobDepartment.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getJobDepartmentById = async (id: JobDepartment['id']) => {
  return prisma.jobDepartment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createJobDepartment = async (data: JobDepartmentInputSchema) => {
  const { name } = data
  return prisma.jobDepartment.create({
    data: { name },
  })
}

export const updateJobDepartmentById = async (
  id: JobDepartment['id'],
  data: JobDepartmentInputSchema
) => {
  const { name } = data
  try {
    return prisma.jobDepartment.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error, no se encontro el ID del Departamento',
      redirect: null,
    })
  }
}

export const deleteJobDepartmentById = async (id: JobDepartment['id']) => {
  try {
    const deletedJobDepartment = await prisma.jobDepartment.delete({
      where: {
        id,
      },
    })

    return deletedJobDepartment.id
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error, no se encontro el ID del Departamento',
      redirect: null,
    })
  }
}
