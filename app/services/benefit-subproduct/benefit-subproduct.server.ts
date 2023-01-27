import type { Benefit, BenefitSubproduct } from '@prisma/client'
import { prisma } from '~/db.server'
import { connect } from '~/utils/relationships'
import type { BenefitSubproductInputSchema } from './benefit-subproduct.schema'

export const getBenefitSubproductsByBenefitId = (benefitId: Benefit['id']) => {
  return prisma.benefitSubproduct.findMany({
    where: {
      benefitId,
    },
    select: {
      id: true,
      name: true,
      discount: true,
    },
    orderBy: {
      name: 'asc',
    },
  })
}

export const getBenefitSubproductById = (id: BenefitSubproduct['id']) => {
  return prisma.benefitSubproduct.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      discount: true,
    },
  })
}

export const createBenefitSubproduct = (
  data: BenefitSubproductInputSchema,
  benefitId: Benefit['id']
) => {
  const { name, discount } = data
  return prisma.benefitSubproduct.create({
    data: {
      name,
      discount,
      benefit: connect(benefitId),
    },
  })
}

export const updateBenefitSubproductById = (
  id: BenefitSubproduct['id'],
  data: BenefitSubproductInputSchema
) => {
  const { name, discount = null } = data
  return prisma.benefitSubproduct.update({
    where: {
      id,
    },
    data: {
      name,
      discount,
    },
  })
}

export const deleteBenefitSubproductById = (id: BenefitSubproduct['id']) => {
  return prisma.benefitSubproduct.delete({
    where: {
      id,
    },
  })
}
