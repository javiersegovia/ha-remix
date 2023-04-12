import { prisma } from '~/db.server'
import { BenefitCategoryFactory } from './benefit-category.factory'
import {
  createBenefitCategory,
  deleteBenefitCategoryById,
  getBenefitCategoriesWithoutCompanies,
  getBenefitCategoryById,
  updateBenefitCategoryById,
} from './benefit-category.server'

describe('getBenefitCategoriesWithoutCompanies', () => {
  it('returns an array of Benefit Categories', async () => {
    // Arrange
    const expectedBenefits = BenefitCategoryFactory.buildList(3)

    vi.spyOn(prisma.benefitCategory, 'findMany').mockResolvedValueOnce(
      expectedBenefits
    )

    // Act
    const result = await getBenefitCategoriesWithoutCompanies()

    // Assert
    expect(prisma.benefitCategory.findMany).toHaveBeenCalledOnce()

    expect(result).toEqual(expectedBenefits)
  })
})

describe('getBenefitCategoryById', () => {
  it('returns a BenefitCategory', async () => {
    // Arrange
    const expectedBenefit = BenefitCategoryFactory.build()
    vi.spyOn(prisma.benefitCategory, 'findUnique').mockResolvedValueOnce(
      expectedBenefit
    )

    // Act
    const result = await getBenefitCategoryById(expectedBenefit.id)

    // Assert
    expect(result).toEqual(expectedBenefit)
  })
})

describe('createBenefitCategory', () => {
  it('creates and returns a BenefitCategory', async () => {
    // Arrange
    const expectedBenefit = BenefitCategoryFactory.build()

    vi.spyOn(prisma.benefitCategory, 'create').mockResolvedValueOnce(
      expectedBenefit
    )

    // Act
    const result = await createBenefitCategory({
      name: expectedBenefit.name,
    })

    // Assert
    expect(result).toEqual(expectedBenefit)
  })
})

describe('updateBenefitCategoryById', () => {
  it('updates and returns a BenefitCategory', async () => {
    // Arrange
    const existingBenefit = BenefitCategoryFactory.build()
    const newBenefit = BenefitCategoryFactory.build()

    vi.spyOn(prisma.benefitCategory, 'update').mockResolvedValueOnce(newBenefit)

    // Act
    const result = await updateBenefitCategoryById(existingBenefit.id, {
      name: newBenefit.name,
    })

    // Assert
    expect(result).toEqual(newBenefit)
  })
})

describe('deleteBenefitCategoryById', () => {
  it('deletes a BenefitCategory and returns the id', async () => {
    // Arrange
    const existingBenefit = BenefitCategoryFactory.build()

    vi.spyOn(prisma.benefitCategory, 'delete').mockResolvedValueOnce(
      existingBenefit
    )

    // Act
    const result = await deleteBenefitCategoryById(existingBenefit.id)

    // Assert
    expect(result).toEqual(existingBenefit.id)
  })
})
