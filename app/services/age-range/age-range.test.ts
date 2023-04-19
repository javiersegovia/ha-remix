import { prisma } from '~/db.server'
import { AgeRangeFactory } from './age-range.factory'
import {
  createAgeRange,
  deleteAgeRangeById,
  getAgeRangeById,
  getAgeRanges,
  updateAgeRangeById,
} from './age-range.server'

describe('getAgeRanges', () => {
  it('returns an array of age ranges', async () => {
    // Arrange
    const ageRanges = AgeRangeFactory.buildList(3)

    vi.spyOn(prisma.ageRange, 'findMany').mockResolvedValue(ageRanges)

    // Act

    const result = await getAgeRanges()

    // Assert

    expect(prisma.ageRange.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        minAge: true,
        maxAge: true,
      },
      orderBy: {
        minAge: 'asc',
      },
    })
    expect(result).toEqual(ageRanges)
  })
})

describe('getAgeRangeById', () => {
  it('returns a age range', async () => {
    // Arrange

    const ageRanges = AgeRangeFactory.build()

    vi.spyOn(prisma.ageRange, 'findUnique').mockResolvedValueOnce(ageRanges)

    // Act

    const result = await getAgeRangeById(ageRanges.id)

    // Assert

    expect(prisma.ageRange.findUnique).toHaveBeenCalledOnce()
    expect(result).toEqual(ageRanges)
  })
})

describe('createAgeRange', () => {
  it('creates and returns a Age Range', async () => {
    // Arrange

    const ageRanges = AgeRangeFactory.build()

    vi.spyOn(prisma.ageRange, 'create').mockResolvedValueOnce(ageRanges)

    // Act

    const result = await createAgeRange({
      minAge: ageRanges.minAge,
      maxAge: ageRanges.maxAge,
    })

    // Asserve

    expect(result).toEqual(ageRanges)
  })
})

describe('updateAgeRangeById', () => {
  it('updates and returns a Age Range', async () => {
    // Arrange

    const existingAgeRange = AgeRangeFactory.build()
    const newAgeRange = AgeRangeFactory.build()

    vi.spyOn(prisma.ageRange, 'update').mockResolvedValueOnce(newAgeRange)

    // Act

    const result = await updateAgeRangeById(existingAgeRange.id, {
      minAge: newAgeRange.minAge,
      maxAge: newAgeRange.maxAge,
    })

    // Assert

    expect(result).toEqual(newAgeRange)
  })
})

describe('deleteAgeRangeById', () => {
  it('deletes a Age Range and returns the id', async () => {
    // Arrange

    const existingAgeRange = AgeRangeFactory.build()

    vi.spyOn(prisma.ageRange, 'delete').mockResolvedValueOnce(existingAgeRange)

    // Act

    const result = await deleteAgeRangeById(existingAgeRange.id)

    // Assert

    expect(result).toEqual(existingAgeRange.id)
  })
})
