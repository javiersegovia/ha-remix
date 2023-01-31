import type { Benefit } from '@prisma/client'

import { prisma } from '~/db.server'
import { BenefitFactory } from './benefit.factory'
import * as benefitService from './benefit.server'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getBenefits', () => {
  it('returns an array of benefits', async () => {
    const expectedBenefits = BenefitFactory.buildList(3)
    vi.spyOn(prisma.benefit, 'findMany').mockResolvedValueOnce(expectedBenefits)
    const result = await benefitService.getBenefits()
    expect(result).toEqual<Benefit[]>(expectedBenefits)
  })
})

describe('getBenefitById', () => {
  it('returns a benefit', async () => {
    const expectedBenefit = BenefitFactory.build()
    vi.spyOn(prisma.benefit, 'findFirst').mockResolvedValueOnce(expectedBenefit)
    const result = await benefitService.getBenefitById(expectedBenefit.id)
    expect(result).toEqual<Benefit>(expectedBenefit)
  })
})

describe('createBenefit', () => {
  it('returns a created benefit', async () => {
    const expectedBenefit = BenefitFactory.build()
    vi.spyOn(prisma.benefit, 'create').mockResolvedValueOnce(expectedBenefit)

    const result = await benefitService.createBenefit({
      name: expectedBenefit.name,
    })
    expect(result).toEqual<Benefit>(expectedBenefit)
  })
})

describe('updateBenefitById', () => {
  it('returns an updated benefit', async () => {
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

    expect(result).toEqual<Benefit>(expectedBenefit)
  })

  // TODO: Test error path
  // test('when the benefitId is not found', () => {
  //   test('should throw a NotFoundError', async () => {})
  // })
})

describe('deleteBenefitById', () => {
  it('returns a deleted benefit id', async () => {
    const deletedBenefit = BenefitFactory.build()
    vi.spyOn(prisma.benefit, 'delete').mockResolvedValueOnce(deletedBenefit)
    const result = await benefitService.deleteBenefitById(deletedBenefit.id)
    expect(result).toEqual(deletedBenefit.id)
  })
})
