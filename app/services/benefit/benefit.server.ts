import type { Benefit, Prisma } from '@prisma/client'
import type { BenefitInputSchema } from './benefit.schema'

import { prisma } from '~/db.server'
import { badRequest, notFound } from 'remix-utils'
import { getS3ObjectUrl } from '../aws/s3.server'
import { connect, connectOrDisconnect } from '~/utils/relationships'
import { deleteImageByKey } from '../image/image.server'

export const getBenefits = async () => {
  return prisma.benefit.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getBenefitById = async (benefitId: Benefit['id']) => {
  return prisma.benefit.findFirst({
    where: {
      id: benefitId,
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      buttonText: true,
      buttonHref: true,
      slug: true,
      benefitCategoryId: true,
      mainImage: {
        select: {
          id: true,
          key: true,
          url: true,
        },
      },
      subproducts: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

export const createBenefit = async ({
  name,
  imageUrl,
  buttonText,
  buttonHref,
  slug,
  mainImageKey,
  benefitCategoryId,
}: BenefitInputSchema) => {
  const mainImage: Prisma.BenefitCreateInput['mainImage'] = mainImageKey
    ? {
        create: {
          key: mainImageKey,
          url: getS3ObjectUrl(mainImageKey),
        },
      }
    : undefined

  try {
    return prisma.benefit.create({
      data: {
        name,
        imageUrl,
        buttonText,
        buttonHref,
        slug,
        benefitCategory: connect(benefitCategoryId),
        mainImage,
      },
      select: {
        id: true,
        name: true,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest(null, {
      statusText: 'Ocurrió un error inesperado al crear el beneficio',
    })
  }
}

export const updateBenefitById = async (
  data: BenefitInputSchema,
  benefitId: Benefit['id']
) => {
  const benefitToUpdate = await prisma.benefit.findFirst({
    where: {
      id: benefitId,
    },
    select: {
      id: true,
      benefitCategoryId: true,
      mainImage: {
        select: {
          id: true,
          key: true,
          url: true,
        },
      },
    },
  })

  if (!benefitToUpdate) {
    throw notFound(null, {
      statusText: 'No se pudo encontrar el beneficio a actualizar',
    })
  }

  const {
    name,
    imageUrl,
    buttonText,
    buttonHref,
    slug,
    mainImageKey,
    benefitCategoryId,
    delete_mainImage,
  } = data
  const existingMainImage = benefitToUpdate.mainImage

  /** We will delete the existingMainImage ONLY if we receive a new mainImageKey or the delete_mainImage checkbox field as true. (Check ImageInput Component)
   */
  if (existingMainImage && (mainImageKey || delete_mainImage)) {
    await deleteImageByKey(existingMainImage.key)
  }

  const mainImage: Prisma.BenefitUpdateInput['mainImage'] = mainImageKey
    ? {
        create: {
          key: mainImageKey,
          url: getS3ObjectUrl(mainImageKey),
        },
      }
    : undefined

  return prisma.benefit.update({
    where: {
      id: benefitToUpdate.id,
    },
    data: {
      name,
      imageUrl: imageUrl || null,
      buttonText: buttonText || null,
      buttonHref: buttonHref || null,
      slug: slug || null,
      mainImage,
      benefitCategory: connectOrDisconnect(
        benefitCategoryId,
        Boolean(benefitToUpdate.benefitCategoryId)
      ),
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const deleteBenefitById = async (benefitId: Benefit['id']) => {
  const benefitToDelete = await prisma.benefit.findUnique({
    where: {
      id: benefitId,
    },
    select: {
      id: true,
      mainImage: {
        select: {
          id: true,
          key: true,
        },
      },
    },
  })

  if (!benefitToDelete) {
    return null
  }

  if (benefitToDelete.mainImage) {
    await deleteImageByKey(benefitToDelete.mainImage.key)
  }

  try {
    const deleted = await prisma.benefit.delete({
      where: {
        id: benefitId,
      },
    })

    return deleted.id
  } catch (e) {
    console.error(e)
    throw badRequest(null, {
      statusText: 'Ocurrió un error inesperado al eliminar el beneficio',
    })
  }
}
