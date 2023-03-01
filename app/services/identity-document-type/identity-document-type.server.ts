import type { IdentityDocumentType } from '@prisma/client'
import type { IdentityDocumentTypeInputSchema } from './identity-document-type.schema'

import { badRequest } from '~/utils/responses'
import { prisma } from '~/db.server'

export const getIdentityDocumentTypes = () => {
  return prisma.identityDocumentType.findMany({
    select: {
      id: true,
      name: true,
    },
  })
}

export const getIdentityDocumentTypeById = async (
  id: IdentityDocumentType['id']
) => {
  return prisma.identityDocumentType.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const createIdentityDocumentType = async (
  data: IdentityDocumentTypeInputSchema
) => {
  const { name } = data
  return prisma.identityDocumentType.create({
    data: { name },
  })
}

export const updateIdentityDocumentTypeById = async (
  id: IdentityDocumentType['id'],
  data: IdentityDocumentTypeInputSchema
) => {
  const { name } = data
  try {
    return prisma.identityDocumentType.update({
      where: {
        id,
      },
      data: { name },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'No se encontró el ID del tipo de documento de identidad',
      redirect: null,
    })
  }
}

export const deleteIdentityDocumentTypeById = async (
  id: IdentityDocumentType['id']
) => {
  try {
    const deletedIdentityDocumentType =
      await prisma.identityDocumentType.delete({
        where: {
          id,
        },
      })

    return deletedIdentityDocumentType.id
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'No se encontró el ID del tipo de documento de identidad',
      redirect: null,
    })
  }
}
