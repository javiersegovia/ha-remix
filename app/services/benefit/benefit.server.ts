import type { Benefit, Company, Prisma } from '@prisma/client'
import type { BenefitInputSchema } from './benefit.schema'

import { prisma } from '~/db.server'
import { badRequest, notFound } from '~/utils/responses'
import { getS3ObjectUrl } from '../aws/s3.server'
import { connect, connectOrDisconnect } from '~/utils/relationships'
import { deleteImageByKey } from '../image/image.server'

export const getBenefits = async (
  options?: Pick<Prisma.BenefitFindManyArgs, 'take' | 'skip' | 'cursor'>
) => {
  const { take, skip } = options || {}
  return prisma.benefit.findMany({
    where: {
      companyBenefit: null,
    },
    take,
    skip,
    select: {
      id: true,
      name: true,
      isHighlighted: true,
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
      buttonText: true,
      buttonHref: true,
      slug: true,
      cost: true,
      benefitCategoryId: true,
      description: true,
      shortDescription: true,
      instructions: true,
      isHighlighted: true,
      mainImage: {
        select: {
          id: true,
          key: true,
          url: true,
        },
      },
      benefitHighlight: {
        select: {
          id: true,
          title: true,
          buttonHref: true,
          buttonText: true,
          description: true,
          isActive: true,
          image: {
            select: {
              id: true,
              key: true,
              url: true,
            },
          },
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

export const createBenefit = async (
  data: BenefitInputSchema,
  companyId?: Company['id']
) => {
  const {
    name,
    buttonText,
    buttonHref,
    slug,
    cost,
    mainImageKey,
    benefitCategoryId,
    shortDescription,
    description,
    instructions,
    isHighlighted,
    benefitHighlight,
  } = data

  const createMainImage: Prisma.BenefitCreateInput['mainImage'] = mainImageKey
    ? {
        create: {
          key: mainImageKey,
          url: getS3ObjectUrl(mainImageKey),
        },
      }
    : undefined

  let createBenefitHighlight: Prisma.BenefitCreateInput['benefitHighlight'] =
    undefined

  if (benefitHighlight) {
    const { title, description, imageKey } = benefitHighlight

    if (!imageKey) {
      throw badRequest({
        message: 'Por favor, sube una imagen para el beneficio destacado',
        redirect: null,
      })
    }

    createBenefitHighlight = {
      create: {
        title,
        description,
        buttonHref: benefitHighlight.buttonHref,
        buttonText: benefitHighlight.buttonText,
        image: {
          create: {
            key: imageKey,
            url: getS3ObjectUrl(imageKey),
          },
        },
      },
    }
  }

  try {
    return prisma.benefit.create({
      data: {
        name,
        buttonText,
        buttonHref,
        slug,
        cost,
        benefitCategory: connect(benefitCategoryId),
        shortDescription,
        description,
        instructions: {
          set: instructions?.filter((i): i is string => Boolean(i)) || [],
        },
        isHighlighted,
        mainImage: createMainImage,
        benefitHighlight: createBenefitHighlight,
        companyBenefit: companyId
          ? {
              create: {
                companyId,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        name: true,
      },
    })
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ocurrió un error inesperado al crear el beneficio',
      redirect: null,
    })
  }
}

// todo: refactor this function and move all the logic of creating/updating a BenefitHighlight
// to another service (benefit-highlight.server.ts)

export const updateBenefitById = async (
  data: BenefitInputSchema,
  benefitId: Benefit['id'],
  redirectTo: string = '/admin/dashboard/benefits'
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
      benefitHighlight: {
        select: {
          id: true,
          image: {
            select: {
              key: true,
            },
          },
        },
      },
    },
  })

  if (!benefitToUpdate) {
    throw notFound({
      message: 'No se pudo encontrar el beneficio a actualizar',
      redirect: redirectTo,
    })
  }

  const {
    name,
    buttonText,
    buttonHref,
    slug,
    cost,
    mainImageKey,
    isHighlighted,
    benefitCategoryId,
    benefitHighlight,
    description,
    shortDescription,
    instructions,
  } = data

  const deletePromises: Promise<any>[] = []

  /** If we have a current image, we will check if the current key is different from the received value.
   *  If it is different, then we will delete the current image, because we will set a new value (a new key, or an empty value).
   *
   * If we don't have a current image, we will check if we have a received value.
   * If we have a received value, we will set a new image.
   * If we don't have a received value, we will not set a new image.
   */
  const currentMainImageKey = benefitToUpdate.mainImage?.key
  const isNewMainImageKey = currentMainImageKey
    ? currentMainImageKey !== mainImageKey
    : Boolean(mainImageKey)

  if (currentMainImageKey && currentMainImageKey !== mainImageKey) {
    deletePromises.push(deleteImageByKey(currentMainImageKey))
  }

  const currentBenefitHighlightImageKey =
    benefitToUpdate.benefitHighlight?.image?.key

  const isNewBenefitHighlightImageKey = currentBenefitHighlightImageKey
    ? currentBenefitHighlightImageKey !== benefitHighlight?.imageKey
    : Boolean(benefitHighlight?.imageKey)

  if (
    currentBenefitHighlightImageKey &&
    currentBenefitHighlightImageKey !== benefitHighlight?.imageKey
  ) {
    deletePromises.push(deleteImageByKey(currentBenefitHighlightImageKey))
  }

  await Promise.all(deletePromises)

  const createMainImage: Prisma.BenefitUpdateInput['mainImage'] =
    isNewMainImageKey && mainImageKey
      ? {
          create: {
            key: mainImageKey,
            url: getS3ObjectUrl(mainImageKey),
          },
        }
      : undefined

  let upsertBenefitHighlight: Prisma.BenefitUpdateInput['benefitHighlight'] = {
    delete: Boolean(benefitToUpdate.benefitHighlight?.id),
  }

  if (benefitHighlight) {
    const { title, description, imageKey } = benefitHighlight

    // If we DON'T have an existing BenefitHighlight, we should create it.
    // Hence, we should throw an error if we don't have an imageKey.
    // todo check this
    if (!benefitToUpdate.benefitHighlight && !imageKey) {
      throw badRequest({
        message: 'Por favor, sube una imagen para el beneficio destacado',
        redirect: null,
      })
    }

    upsertBenefitHighlight = !benefitToUpdate.benefitHighlight
      ? {
          create: {
            title,
            description,
            buttonHref: benefitHighlight.buttonHref,
            buttonText: benefitHighlight.buttonText,
            image: {
              create: {
                key: imageKey as string,
                url: getS3ObjectUrl(imageKey as string),
              },
            },
          },
        }
      : {
          update: {
            title,
            description,
            buttonHref: benefitHighlight.buttonHref,
            buttonText: benefitHighlight.buttonText,
            image:
              imageKey && isNewBenefitHighlightImageKey
                ? {
                    create: {
                      key: imageKey,
                      url: getS3ObjectUrl(imageKey),
                    },
                  }
                : undefined,
          },
        }
  }

  return prisma.benefit.update({
    where: {
      id: benefitToUpdate.id,
    },
    data: {
      name,
      buttonText: buttonText || null,
      buttonHref: buttonHref || null,
      slug: slug || null,
      cost: cost || null,
      mainImage: createMainImage,
      shortDescription,
      isHighlighted,
      description,
      instructions: {
        set: instructions?.filter((i): i is string => Boolean(i)) || [],
      },

      benefitCategory: connectOrDisconnect(
        benefitCategoryId,
        Boolean(benefitToUpdate.benefitCategoryId)
      ),

      benefitHighlight: upsertBenefitHighlight,
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
      benefitHighlight: {
        select: {
          image: {
            select: {
              id: true,
              key: true,
            },
          },
        },
      },
    },
  })

  if (!benefitToDelete) {
    return null
  }

  const deletePromises: Promise<any>[] = []

  if (benefitToDelete.mainImage) {
    deletePromises.push(deleteImageByKey(benefitToDelete.mainImage.key))
  }

  if (benefitToDelete.benefitHighlight?.image) {
    deletePromises.push(
      deleteImageByKey(benefitToDelete.benefitHighlight.image.key)
    )
  }

  try {
    await Promise.all(deletePromises)

    const deleted = await prisma.benefit.delete({
      where: {
        id: benefitId,
      },
    })

    return deleted.id
  } catch (e) {
    console.error(e)
    throw badRequest({
      message: 'Ocurrió un error inesperado al eliminar el beneficio',
      redirect: null,
    })
  }
}

export const getCompanyBenefitsByCompanyId = async (
  companyId: Company['id'],
  options?: Pick<Prisma.EmployeeFindManyArgs, 'take' | 'skip' | 'cursor'>
) => {
  const { take, skip } = options || {}

  return prisma.benefit.findMany({
    where: {
      companyBenefit: {
        companyId,
      },
    },
    take,
    skip,
    select: {
      id: true,
      name: true,
      isHighlighted: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getAvailableBenefitsByCompanyId = async (
  companyId: Company['id']
) => {
  const enabledBenefits = await prisma.company.findUnique({
    where: { id: companyId },
    select: {
      benefits: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  const companyBenefits = await prisma.benefit.findMany({
    where: {
      companyBenefit: {
        companyId,
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  return [...(enabledBenefits?.benefits || []), ...companyBenefits].sort(
    (a, b) => a.name.localeCompare(b.name)
  )
}
