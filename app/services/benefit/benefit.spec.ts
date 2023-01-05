import { truncateDB } from 'test/helpers/truncateDB'
import { prisma } from '~/db.server'
import { BenefitFactory } from '~/services/benefit/benefit.factory'
import * as benefitService from '~/services/benefit/benefit.server'

beforeEach(async () => {
  await truncateDB()
})

describe('getBenefits', () => {
  test('should return an array of benefits', async () => {
    const expectedBenefits = (await BenefitFactory.createList(3))
      .map((benefit) => ({
        id: benefit.id,
        name: benefit.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const result = await benefitService.getBenefits()
    expect(result).toEqual(expectedBenefits)
  })
})

describe('getBenefitById', () => {
  test('should return a benefit', async () => {
    const existingBenefit = await BenefitFactory.create()

    const result = await benefitService.getBenefitById(existingBenefit.id)
    expect(result).toMatchObject<
      NonNullable<Awaited<ReturnType<typeof benefitService.getBenefitById>>>
    >({
      id: existingBenefit.id,
      name: existingBenefit.name,
      buttonHref: existingBenefit.buttonHref,
      buttonText: existingBenefit.buttonText,
      imageUrl: existingBenefit.imageUrl,
      slug: existingBenefit.slug,
    })
  })
})

describe('createBenefit', () => {
  test('should create a benefit and return it', async () => {
    const data = {
      name: 'Insurance',
    }

    const result = await benefitService.createBenefit(data)

    expect(result).toMatchObject<
      NonNullable<Awaited<ReturnType<typeof benefitService.createBenefit>>>
    >({
      id: expect.any(Number),
      name: data.name,
    })
  })
})

describe('updateBenefitById', () => {
  test('should update a benefit and return it', async () => {
    const existingBenefit = await BenefitFactory.create()

    const data = {
      name: 'Travel',
    }

    const result = await benefitService.updateBenefitById(
      data,
      existingBenefit.id
    )

    expect(result).toMatchObject<
      NonNullable<Awaited<ReturnType<typeof benefitService.updateBenefitById>>>
    >({
      id: expect.any(Number),
      name: data.name,
    })
  })
})

describe('deleteBenefitById', () => {
  test('should delete a benefit and return the id', async () => {
    const existingBenefit = await BenefitFactory.create()

    const result = await benefitService.deleteBenefitById(existingBenefit.id)

    expect(result).toEqual(existingBenefit.id)
    expect(
      await prisma.benefit.findFirst({ where: { id: existingBenefit.id } })
    ).toEqual(null)
  })
})
