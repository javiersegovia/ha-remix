import { prisma } from '~/db.server'

export const getJobDepartments = async () => {
  return prisma.jobDepartment.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}
