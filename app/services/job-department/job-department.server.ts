import type { JobDepartment } from '@prisma/client'
import { prisma } from '~/db.server'

export const getJobDepartments = async () => {
  return prisma.jobDepartment.findMany({
    select: {
      id: true,
      name: true,
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

// todo: add createJobDepartment
// todo: add updateJobDepartmentById

export const deleteJobDepartmentById = async (id: JobDepartment['id']) => {
  return prisma.jobDepartment.delete({
    where: {
      id,
    },
  })
}
