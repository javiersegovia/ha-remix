import type { BenefitInputSchema } from './benefit.schema'
import { prisma } from '~/db.server'
import { badRequest, notFound } from 'remix-utils'
import type { Benefit } from '@prisma/client'

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
}: BenefitInputSchema) => {
  try {
    return prisma.benefit.create({
      data: {
        name,
        imageUrl,
        buttonText,
        buttonHref,
        slug,
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
  const benefit = await prisma.benefit.findFirst({
    where: {
      id: benefitId,
    },
  })

  if (!benefit) {
    throw notFound(null, {
      statusText: 'No se pudo encontrar el beneficio a actualizar',
    })
  }

  const { name, imageUrl, buttonText, buttonHref, slug, subproducts } = data

  const benefitSubproducts = await prisma.benefitSubproduct.findMany({
    where: {
      benefitId: benefit.id,
    },
    select: {
      id: true,
      name: true,
    },
  })

  const benefitSubproductNames = benefitSubproducts.map((benefitSubproduct) =>
    benefitSubproduct.name.toLowerCase()
  )

  const newSubproducts = subproducts?.filter(
    (subproduct) =>
      benefitSubproductNames.includes(subproduct.toLowerCase()) === false
  )

  const subproductsToDelete = benefitSubproducts.filter(
    (benefitSubproduct) =>
      Boolean(
        subproducts?.some(
          (subproduct) =>
            subproduct.toLowerCase() === benefitSubproduct.name.toLowerCase()
        )
      ) === false
  )

  return prisma.benefit.update({
    where: {
      id: benefit.id,
    },
    data: {
      name,
      imageUrl: imageUrl || null,
      buttonText: buttonText || null,
      buttonHref: buttonHref || null,
      slug: slug || null,

      subproducts: {
        createMany: newSubproducts?.length
          ? {
              data: newSubproducts.map((newSubproduct) => ({
                name: newSubproduct,
              })),
            }
          : undefined,

        deleteMany: subproductsToDelete?.length
          ? subproductsToDelete.map((subproduct) => ({ id: subproduct.id }))
          : undefined,
      },
    },
    select: {
      id: true,
      name: true,
    },
  })
}

export const deleteBenefitById = async (benefitId: Benefit['id']) => {
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
