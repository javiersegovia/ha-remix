import { prisma } from '~/db.server'
import { CompanyCategoryFactory } from './company-category.factory'
import * as companyCategoryService from './company-category.server'

afterAll(() => {
  vi.restoreAllMocks()
})

describe('getCompanyCategories', () => {
  test('should return an array of companyCategories', async () => {
    const companyCategories = CompanyCategoryFactory.buildList(3)

    vi.spyOn(prisma.companyCategory, 'findMany').mockResolvedValueOnce(
      companyCategories
    )

    const result = await companyCategoryService.getCompanyCategories()
    expect(result).toEqual(companyCategories)
  })
})
