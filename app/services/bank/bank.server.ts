import type { Bank } from '@prisma/client'
import { validationError } from 'remix-validated-form'
import { prisma } from '~/db.server'
import type { EmployeeSchemaInput } from '~/services/employee/employee.schema'
import type { BankSchema } from './bank.schema'
import { badRequest } from 'remix-utils'

export const getBanks = () => {
  return prisma.bank.findMany({
    select: {
      id: true,
      name: true,
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

export const createBank = async (data: BankSchema) => {
  return prisma.bank.create({
    data,
  })
}

export const updateBankById = async (id: Bank['id'], data: BankSchema) => {
  try {
    return prisma.bank.update({
      where: {
        id,
      },
      data,
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
