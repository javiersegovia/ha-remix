import { truncateDB } from 'test/helpers/truncateDB'
import { prisma } from '~/db.server'
import { BenefitFactory } from '~/services/benefit/benefit.factory'
import * as benefitService from '~/services/benefit/benefit.server'
import { BenefitSubproductFactory } from '../benefit-subproduct/benefit-subproduct.factory'

beforeEach(async () => {
  await truncateDB()
})

describe('getBenefits', () => {
  it('returns an array of benefits', async () => {
    const expectedBenefits = (await BenefitFactory.createList(3))
      .map((benefit) => ({
        id: benefit.id,
        name: benefit.name,
        benefitHighlight: null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const result = await benefitService.getBenefits()
    expect(result).toEqual(expectedBenefits)
  })
})

describe('getBenefitById', () => {
  it('returns a benefit', async () => {
    const existingBenefit = await BenefitFactory.create()
    const existingBenefitSubproduct = await BenefitSubproductFactory.create(
      undefined,
      {
        associations: { benefit: existingBenefit },
      }
    )

    const { id, name, buttonHref, buttonText, slug, benefitCategoryId } =
      existingBenefit

    const result = await benefitService.getBenefitById(existingBenefit.id)
    expect(result).toEqual<
      NonNullable<Awaited<ReturnType<typeof benefitService.getBenefitById>>>
    >({
      id,
      name,
      buttonHref,
      buttonText,
      slug,
      isHighlighted: false,
      description: null,
      shortDescription: null,
      instructions: [],
      mainImage: null,
      benefitHighlight: null,
      benefitCategoryId,
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
  it('creates a benefit and returns it', async () => {
    const data = {
      name: 'Insurance',
    }

    const result = await benefitService.createBenefit(data)

    expect(result).toEqual<
      NonNullable<Awaited<ReturnType<typeof benefitService.createBenefit>>>
    >({
      id: expect.any(Number),
      name: data.name,
    })
  })
})

describe('updateBenefitById', () => {
  it('updates a benefit and returns it', async () => {
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
  it('deletes a benefit and return the id', async () => {
    const existingBenefit = await BenefitFactory.create()

    const result = await benefitService.deleteBenefitById(existingBenefit.id)

    expect(result).toEqual(existingBenefit.id)
    expect(
      await prisma.benefit.findFirst({ where: { id: existingBenefit.id } })
    ).toEqual(null)
  })

  it('deletes the benefitSubproducts', async () => {
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
