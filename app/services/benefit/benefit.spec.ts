import { truncateDB } from 'test/helpers/truncateDB'
import { prisma } from '~/db.server'
import { BenefitFactory } from '~/services/benefit/benefit.factory'
import * as benefitService from '~/services/benefit/benefit.server'
import { BenefitSubproductFactory } from '../benefit-subproduct/benefit-subproduct.factory'

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
    const existingBenefitSubproduct = await BenefitSubproductFactory.create(
      undefined,
      {
        associations: { benefit: existingBenefit },
      }
    )

    const { id, name, buttonHref, buttonText, imageUrl, slug } = existingBenefit

    const result = await benefitService.getBenefitById(existingBenefit.id)
    expect(result).toEqual<
      NonNullable<Awaited<ReturnType<typeof benefitService.getBenefitById>>>
    >({
      id,
      name,
      buttonHref,
      buttonText,
      imageUrl,
      slug,
      subproducts: [
        {
          id: existingBenefitSubproduct.id,
          name: existingBenefitSubproduct.name,
        },
      ],
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

    await benefitService.updateBenefitById(data, existingBenefit.id)

    const updatedBenefit = await prisma.benefit.findUnique({
      where: { id: existingBenefit.id },
      include: { subproducts: true },
    })

    expect(updatedBenefit?.name).toEqual(data.name)
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
  test('should delete the benefitSubproducts too', async () => {
    const existingBenefit = await BenefitFactory.create()

    await BenefitSubproductFactory.createList(3, undefined, {
      associations: { benefit: existingBenefit },
    })

    const result = await benefitService.deleteBenefitById(existingBenefit.id)

    expect(result).toEqual(existingBenefit.id)

    expect(
      await prisma.benefit.findFirst({ where: { id: existingBenefit.id } })
    ).toEqual(null)

    expect(
      await prisma.benefitSubproduct.findFirst({
        where: { benefitId: existingBenefit.id },
      })
    ).toEqual(null)
  })
})
