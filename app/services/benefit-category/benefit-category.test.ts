import { prisma } from '~/db.server'
import { BenefitCategoryFactory } from './benefit-category.factory'

describe('getBenefitCategories', () => {
  test('should return an array of Benefit Categories', async () => {
    // Arrange
    const expectedBenefits = BenefitCategoryFactory.buildList(3)
    vi.spyOn(prisma.benefitCategory, 'findMany').mockResolvedValueOnce(
      expectedBenefits
    )

    // Act
    // const result = await getBenefitCategories()

    // Assert
    // expect(result).toEqual(expectedBenefits)
  })
})
