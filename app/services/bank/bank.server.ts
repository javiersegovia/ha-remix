import type { Bank } from '@prisma/client'
import type { EmployeeSchemaInput } from '~/services/employee/employee.schema'
import type { BankInputSchema } from './bank.schema'

import { validationError } from 'remix-validated-form'
import { badRequest } from 'remix-utils'
import { prisma } from '~/db.server'

export const getBanks = () => {
  return prisma.bank.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getBankById = async (id: Bank['id']) => {
  return prisma.bank.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createBank = async (data: BankInputSchema) => {
  const { name } = data
  return prisma.bank.create({
    data: { name },
  })
}

export const updateBankById = async (id: Bank['id'], data: BankInputSchema) => {
  const { name } = data
  try {
    return prisma.bank.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest('No se encontró el ID del banco')
  }
}

export const deleteBankById = async (id: Bank['id']) => {
  try {
    const deletedBank = await prisma.bank.delete({
      where: {
        id,
      },
    })

    return deletedBank.id
  } catch (e) {
    console.error(e)
    throw badRequest('No se encontró el ID del banco')
  }
}

export const validateBankAccount = (
  bankAccount: EmployeeSchemaInput['bankAccount'],
  formId?: string
) => {
  const { bankId, accountNumber, accountTypeId, identityDocument } = bankAccount
  const { value, documentTypeId } = identityDocument || {}

  const values = [bankId, accountNumber, accountTypeId, value, documentTypeId]

  // If at least one value is truthy, all of them should be truthy
  // If that's not the case, then we return the validationError.
  // ! This should be removed when we refactor the BankAccounts...
  // ! We should be able to save the data partially.

  if (values.some(Boolean) !== values.every(Boolean)) {
    return validationError({
      fieldErrors: {
        ...(!bankId && { 'bankAccount.bankId': 'Seleccione un banco' }),

        ...(!accountNumber && {
          'bankAccount.accountNumber': 'Ingrese un número de cuenta',
        }),

        ...(!accountTypeId && {
          'bankAccount.accountTypeId': 'Seleccione el tipo de cuenta',
        }),

        ...(!documentTypeId && {
          'bankAccount.identityDocument.documentTypeId':
            'Seleccione el tipo de cuenta',
        }),

        ...(!value && {
          'bankAccount.identityDocument.value':
            'Ingrese el documento de identidad',
        }),
      },
      formId,
    })
  }
}
