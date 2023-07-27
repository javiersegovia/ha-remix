import type { Company, Team } from '@prisma/client'
import type { TeamInputSchema } from './team.schema'

import { badRequest } from 'remix-utils'
import { prisma } from '~/db.server'

export const getTeamsByCompanyId = async (companyId: Company['id']) => {
  return prisma.team.findMany({
    where: {
      companyId,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          members: true,
        },
      },
      members: {
        where: {
          isTeamLeader: {
            equals: true,
          },
        },
        select: {
          id: true,
          employee: {
            select: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

export const getTeamById = async (id: Team['id']) => {
  return prisma.team.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          members: true,
        },
      },
    },
  })
}

export const createTeam = async (
  data: TeamInputSchema,
  companyId: Company['id']
) => {
  const { name } = data

  try {
    return prisma.team.create({
      data: {
        name,
        companyId,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error en la creación del equipo',
      redirect: null,
    })
  }
}

export const updateTeamById = async (data: TeamInputSchema, id: Team['id']) => {
  const { name } = data

  try {
    return prisma.team.update({
      where: {
        id,
      },
      data: {
        name,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error durante la actualización del equipo',
      redirect: null,
    })
  }
}

export const deleteTeamById = async (id: Team['id']) => {
  try {
    return prisma.team.delete({
      where: {
        id,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'No se pudo eliminar el equipo',
      redirect: null,
    })
  }
}

// export const addEmployeesToEmployeeGroup = async (
//   employeesIds: EmployeeTableInput,
//   teamId: Team['id']
// ) => {
//   try {
//     return prisma.team.update({
//       where: {
//         id: teamId,
//       },
//       data: {
//         members: {
//           connect: employeesIds.map((id) => ({ id })),
//         },
//       },
//     })
//   } catch (e) {
//     console.error(e)
//     throw badRequest({
//       message:
//         'Ha ocurrido un error al intentar agregar colaboradores al equipo',
//       redirect: null,
//     })
//   }
// }

// export const removeEmployeesFromEmployeeGroup = async (
//   employeesIds: EmployeeTableInput,
//   teamId: Team['id']
// ) => {
//   try {
//     return prisma.team.update({
//       where: {
//         id: teamId,
//       },
//       data: {
//         employees: {
//           disconnect: employeesIds.map((id) => ({ id })),
//         },
//       },
//     })
//   } catch (e) {
//     console.error(e)
//     throw badRequest({
//       message:
//         'Ha ocurrido un error al intentar remover colaboradores del equipo',
//       redirect: null,
//     })
//   }
// }
