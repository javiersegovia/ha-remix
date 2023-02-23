import type { BankAccountType } from '@prisma/client'
import type { BankAccountTypeInputSchema } from './bank-account-type.schema'

import { validationError } from 'remix-validated-form'
import { badRequest } from 'remix-utils'
import { prisma } from '~/db.server'

export const getBankAccountTypes = () => {
  return prisma.bankAccountType.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}

export const getBankAccountTypeById = async (id: BankAccountType['id']) => {
  return prisma.bankAccountType.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createBankAccountType = async (
  data: BankAccountTypeInputSchema
) => {
  const { name } = data
  return prisma.bankAccountType.create({
    data: { name },
  })
}

export const updateBankAccountTypeById = async (
  id: BankAccountType['id'],
  data: BankAccountTypeInputSchema
) => {
  const { name } = data
  try {
    return prisma.bankAccountType.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest('No se encontró el ID del tipo de cuenta bancaria')
  }
}

export const deleteBankAccountTypeById = async (id: BankAccountType['id']) => {
  try {
    const deletedBankAccountType = await prisma.bankAccountType.delete({
      where: {
        id,
      },
    })

    return deletedBankAccountType.id
  } catch (e) {
    console.error(e)
    throw badRequest('No se encontró el ID del tipo de cuenta bancaria')
  }
}
