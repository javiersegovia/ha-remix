import { prisma } from '~/db.server'
import { CompanyCategoryFactory } from './company-category.factory'
import {
  getCompanyCategories,
  getCompanyCategoryById,
  createCompanyCategory,
  updateCompanyCategoryById,
  deleteCompanyCategoryById,
} from './company-category.server'

describe('getCompanyCategories', () => {
  it('Returns an array of company categories', async () => {
    // Arrange
    const companyCategories = CompanyCategoryFactory.buildList(3)

    vi.spyOn(prisma.companyCategory, 'findMany').mockResolvedValueOnce(
      companyCategories
    )

    // Act

    const result = await getCompanyCategories()

    //Assert
    expect(prisma.companyCategory.findMany).toHaveBeenCalledOnce()
    expect(prisma.companyCategory.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    expect(result).toEqual(companyCategories)
  })
})

describe('getCompanyCategoryById', () => {
  it('Returns a Company Category', async () => {
    // Arrange
    const companyCategories = CompanyCategoryFactory.build()

    vi.spyOn(prisma.companyCategory, 'findUnique').mockResolvedValueOnce(
      companyCategories
    )

    // Act
    const result = await getCompanyCategoryById(companyCategories.id)

    // Assert
    expect(prisma.companyCategory.findUnique).toHaveBeenCalledOnce()
    expect(result).toEqual(companyCategories)
  })
})

describe('createCompanyCategory', () => {
  it('creates and returns a Company Category', async () => {
    // Arrange
    const companyCategories = CompanyCategoryFactory.build()

    vi.spyOn(prisma.companyCategory, 'create').mockResolvedValueOnce(
      companyCategories
    )

    // Act
    const result = await createCompanyCategory({
      name: companyCategories.name,
    })

    // Asserve
    expect(result).toEqual(companyCategories)
  })
})

describe('updateCompanyCategoryById', () => {
  it('updates and returns a Company Category', async () => {
    // Arrange
    const existingCompanyCategory = CompanyCategoryFactory.build()
    const newCompanyCategory = CompanyCategoryFactory.build()

    vi.spyOn(prisma.companyCategory, 'update').mockResolvedValueOnce(
      newCompanyCategory
    )
    // Act
    const result = await updateCompanyCategoryById(existingCompanyCategory.id, {
      name: newCompanyCategory.name,
    })

    // Assert

    expect(result).toEqual(newCompanyCategory)
  })
})

describe('deleteCompanyCategoryById', () => {
  it('deletes a Company Category and returns the id', async () => {
    // Arrange
    const existingCompanyCategory = CompanyCategoryFactory.build()

    vi.spyOn(prisma.companyCategory, 'delete').mockResolvedValueOnce(
      existingCompanyCategory
    )

    // Act
    const result = await deleteCompanyCategoryById(existingCompanyCategory.id)

    // Assert
    expect(result).toEqual(existingCompanyCategory.id)
  })
})
