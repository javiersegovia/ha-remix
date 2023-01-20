import type { Benefit } from '@prisma/client'

import { prisma } from '~/db.server'
import { BenefitSubproductFactory } from '../benefit-subproduct/benefit-subproduct.factory'
import { BenefitFactory } from './benefit.factory'
import * as benefitService from './benefit.server'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getBenefits', () => {
  test('should return an array of benefits', async () => {
    const expectedBenefits = BenefitFactory.buildList(3)
    vi.spyOn(prisma.benefit, 'findMany').mockResolvedValueOnce(expectedBenefits)
    const result = await benefitService.getBenefits()
    expect(result).toMatchObject<Benefit[]>(expectedBenefits)
  })
})

describe('getBenefitById', () => {
  test('should return a benefit', async () => {
    const expectedBenefit = BenefitFactory.build()
    vi.spyOn(prisma.benefit, 'findFirst').mockResolvedValueOnce(expectedBenefit)
    const result = await benefitService.getBenefitById(expectedBenefit.id)
    expect(result).toMatchObject<Benefit>(expectedBenefit)
  })
})

describe('createBenefit', () => {
  test('should create and return a benefit', async () => {
    const expectedBenefit = BenefitFactory.build()
    vi.spyOn(prisma.benefit, 'create').mockResolvedValueOnce(expectedBenefit)

    const result = await benefitService.createBenefit({
      name: expectedBenefit.name,
    })
    expect(result).toMatchObject<Benefit>(expectedBenefit)
  })
})

describe('updateBenefitById', () => {
  test('should update and return a benefit', async () => {
    const existingBenefit = BenefitFactory.build()
    const expectedBenefit = BenefitFactory.build()

    vi.spyOn(prisma.benefit, 'findFirst').mockResolvedValueOnce(existingBenefit)
    vi.spyOn(prisma.benefit, 'update').mockResolvedValueOnce(expectedBenefit)

    const result = await benefitService.updateBenefitById(
      {
        name: expectedBenefit.name,
      },
      expectedBenefit.id
    )

    expect(result).toMatchObject<Benefit>(expectedBenefit)
  })

  test('should update the existing subproducts', async () => {
    const existingBenefit = BenefitFactory.build()
    const expectedBenefit = BenefitFactory.build()

    const existingBenefitSubproducts = BenefitSubproductFactory.buildList(3)

    vi.spyOn(prisma.benefit, 'findFirst').mockResolvedValueOnce(existingBenefit)
    vi.spyOn(prisma.benefit, 'update').mockResolvedValueOnce(expectedBenefit)

    vi.spyOn(prisma.benefitSubproduct, 'findMany').mockResolvedValueOnce(
      existingBenefitSubproducts
    )

    const result = await benefitService.updateBenefitById(
      {
        name: expectedBenefit.name,
      },
      expectedBenefit.id
    )

    expect(result).toMatchObject<Benefit>(expectedBenefit)
  })

  // TODO: Test error path
  // test('when the benefitId is not found', () => {
  //   test('should throw a NotFoundError', async () => {})
  // })
})

describe('deleteBenefitById', () => {
  test('should return the benefit', async () => {
    const deletedBenefit = BenefitFactory.build()
    vi.spyOn(prisma.benefit, 'delete').mockResolvedValueOnce(deletedBenefit)
    const result = await benefitService.deleteBenefitById(deletedBenefit.id)
    expect(result).toEqual(deletedBenefit.id)
  })
})
