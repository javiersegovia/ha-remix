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
    const ageRanges = AgeRangeFactory.buildList(3)

    vi.spyOn(prisma.ageRange, 'findMany').mockResolvedValue(ageRanges)

    const result = await getAgeRanges()

    expect(prisma.ageRange.findMany).toHaveBeenCalledOnce()
    expect(result).toEqual(ageRanges)
  })
})

describe('getAgeRangeById', () => {
  it('returns a age range', async () => {
    const ageRanges = AgeRangeFactory.build()

    vi.spyOn(prisma.ageRange, 'findUnique').mockResolvedValueOnce(ageRanges)

    const result = await getAgeRangeById(ageRanges.id)

    expect(prisma.ageRange.findUnique).toHaveBeenCalledOnce()
    expect(result).toEqual(ageRanges)
  })
})

describe('createAgeRange', () => {
  it('creates and returns a Age Range', async () => {
    const ageRanges = AgeRangeFactory.build()

    vi.spyOn(prisma.ageRange, 'create').mockResolvedValueOnce(ageRanges)

    const result = await createAgeRange({
      minAge: ageRanges.minAge,
      maxAge: ageRanges.maxAge,
    })

    expect(result).toEqual(ageRanges)
  })
})

describe('updateAgeRangeById', () => {
  it('updates and returns a Age Range', async () => {
    const existingAgeRange = AgeRangeFactory.build()
    const newAgeRange = AgeRangeFactory.build()

    vi.spyOn(prisma.ageRange, 'update').mockResolvedValueOnce(newAgeRange)

    const result = await updateAgeRangeById(existingAgeRange.id, {
      minAge: newAgeRange.minAge,
      maxAge: newAgeRange.maxAge,
    })

    expect(result).toEqual(newAgeRange)
  })
})

describe('deleteAgeRangeById', () => {
  it('deletes a Age Range and returns the id', async () => {
    const existingAgeRange = AgeRangeFactory.build()

    vi.spyOn(prisma.ageRange, 'delete').mockResolvedValueOnce(existingAgeRange)

    const result = await deleteAgeRangeById(existingAgeRange.id)

    expect(result).toEqual(existingAgeRange.id)
  })
})
