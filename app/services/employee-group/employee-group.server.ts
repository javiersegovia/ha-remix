import type { Company, EmployeeGroup } from '@prisma/client'
import type { EmployeeGroupInputSchema } from './employee-group.schema'

import { prisma } from '~/db.server'
import { connectMany, setMany } from '~/utils/relationships'
import { badRequest } from '~/utils/responses'

export const getEmployeeGroupsByCompanyId = async (
  companyId: Company['id']
) => {
  return prisma.employeeGroup.findMany({
    where: {
      companyId,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      name: true,
      id: true,
      benefits: {
        select: {
          _count: true,
        },
      },
      country: {
        select: {
          id: true,
          name: true,
        },
      },
      state: {
        select: {
          id: true,
          name: true,
        },
      },
      gender: {
        select: {
          id: true,
          name: true,
        },
      },
      ageRange: {
        select: {
          id: true,
          minAge: true,
          maxAge: true,
        },
      },
      salaryRange: {
        select: {
          id: true,
          minValue: true,
          maxValue: true,
        },
      },
    },
  })
}

export const getEmployeeGroupById = async (id: EmployeeGroup['id']) => {
  return prisma.employeeGroup.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      benefits: {
        select: {
          id: true,
          name: true,
        },
      },
      country: {
        select: {
          id: true,
          name: true,
        },
      },
      state: {
        select: {
          id: true,
          name: true,
        },
      },
      gender: {
        select: {
          id: true,
          name: true,
        },
      },
      ageRange: {
        select: {
          id: true,
          minAge: true,
          maxAge: true,
        },
      },
      salaryRange: {
        select: {
          id: true,
          minValue: true,
          maxValue: true,
        },
      },
    },
  })
}

export const createEmployeeGroup = async (
  data: EmployeeGroupInputSchema,
  companyId: Company['id']
) => {
  const {
    name,
    benefitsIds,
    countryId,
    stateId,
    genderId,
    ageRangeId,
    salaryRangeId,
  } = data

  try {
    return prisma.employeeGroup.create({
      data: {
        name,
        benefits: connectMany(benefitsIds),
        companyId,
        countryId,
        stateId,
        genderId,
        ageRangeId,
        salaryRangeId,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message:
        'Ha ocurrido un error durante la creación del grupo de empleados',
      redirect: null,
    })
  }
}

export const updateEmployeeGroupById = async (
  data: EmployeeGroupInputSchema,
  id: EmployeeGroup['id']
) => {
  const {
    name,
    benefitsIds,
    countryId,
    stateId,
    genderId,
    ageRangeId,
    salaryRangeId,
  } = data

  try {
    return prisma.employeeGroup.update({
      where: {
        id,
      },
      data: {
        name,
        benefits: setMany(benefitsIds),
        countryId,
        stateId,
        genderId,
        ageRangeId,
        salaryRangeId,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message:
        'Ha ocurrido un error durante la actualización del grupo de empleados',
      redirect: null,
    })
  }
}

export const deleteEmployeeGroupById = async (id: EmployeeGroup['id']) => {
  try {
    return prisma.employeeGroup.delete({
      where: {
        id,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ha ocurrido un error al eliminar el grupo de colaboradores',
      redirect: null,
    })
  }
}
