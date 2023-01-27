import type { BenefitSubproduct } from '@prisma/client'

import { prisma } from '~/db.server'
import { BenefitSubproductFactory } from './benefit-subproduct.factory'
import {
  getBenefitSubproductById,
  getBenefitSubproductsByBenefitId,
} from './benefit-subproduct.server'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getBenefitSubproductsByBenefitId', () => {
  test('should return an array of BenefitSubproducts', async () => {
    const expectedBenefitSubproducts = BenefitSubproductFactory.buildList(3)

    vi.spyOn(prisma.benefitSubproduct, 'findMany').mockResolvedValueOnce(
      expectedBenefitSubproducts
    )
    const result = await getBenefitSubproductsByBenefitId(123)
    expect(result).toEqual<BenefitSubproduct[]>(expectedBenefitSubproducts)
  })
})

describe('getBenefitSubproductById', () => {
  test('should return a BenefitSubproduct', async () => {
    const expectedBenefitSubproduct = BenefitSubproductFactory.build()

    vi.spyOn(prisma.benefitSubproduct, 'findUnique').mockResolvedValueOnce(
      expectedBenefitSubproduct
    )
    const result = await getBenefitSubproductById(123)
    expect(result).toEqual<BenefitSubproduct>(expectedBenefitSubproduct)
  })
})
