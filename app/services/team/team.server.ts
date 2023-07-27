import type { Company, Team } from '@prisma/client'
import type { TeamInputSchema } from './team.schema'
import type { EmployeeTableInput } from '../employee/employee.schema'
import { prisma } from '~/db.server'
import { badRequest } from 'remix-utils'

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
          employees: true,
        },
      },
      employees: {
        select: {
          TeamMember: { select: { isTeamLeader: true } },
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
          employees: true,
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

export const addEmployeesToEmployeeGroup = async (
  employeesIds: EmployeeTableInput,
  teamId: Team['id']
) => {
  try {
    return prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        employees: {
          connect: employeesIds.map((id) => ({ id })),
        },
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message:
        'Ha ocurrido un error al intentar agregar colaboradores al equipo',
      redirect: null,
    })
  }
}

export const removeEmployeesFromEmployeeGroup = async (
  employeesIds: EmployeeTableInput,
  teamId: Team['id']
) => {
  try {
    return prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        employees: {
          disconnect: employeesIds.map((id) => ({ id })),
        },
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message:
        'Ha ocurrido un error al intentar remover colaboradores del equipo',
      redirect: null,
    })
  }
}
