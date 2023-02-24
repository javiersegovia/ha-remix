import { prisma } from '~/db.server'
import { GenderFactory } from './gender.factory'
import {
  createGender,
  deleteGenderById,
  getGenderById,
  getGenders,
  updateGenderById,
} from './gender.server'

describe('getGenders', () => {
  it('returns an array of genders', async () => {
    // Arrange
    const genders = GenderFactory.buildList(3)

    vi.spyOn(prisma.gender, 'findMany').mockResolvedValue(genders)

    // Act

    const result = await getGenders()

    // Assert

    expect(prisma.gender.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    expect(result).toEqual(genders)
  })
})

describe('getGenderById', () => {
  it('Returns a Gender', async () => {
    // Arrange

    const genders = GenderFactory.build()

    vi.spyOn(prisma.gender, 'findUnique').mockResolvedValueOnce(genders)

    // Act

    const result = await getGenderById(genders.id)

    // Assert

    expect(prisma.gender.findUnique).toHaveBeenCalledOnce()
    expect(result).toEqual(genders)
  })
})

describe('createGender', () => {
  it('creates and returns a Gender', async () => {
    // Arrange

    const genders = GenderFactory.build()

    vi.spyOn(prisma.gender, 'create').mockResolvedValueOnce(genders)

    // Act

    const result = await createGender({
      name: genders.name,
    })

    // Asserve

    expect(result).toEqual(genders)
  })
})

describe('updateGenderById', () => {
  it('updates and returns a Gender', async () => {
    // Arrange

    const existingGender = GenderFactory.build()
    const newGender = GenderFactory.build()

    vi.spyOn(prisma.gender, 'update').mockResolvedValueOnce(newGender)

    // Act

    const result = await updateGenderById(existingGender.id, {
      name: newGender.name,
    })

    // Assert

    expect(result).toEqual(newGender)
  })
})

describe('deleteGenderById', () => {
  it('deletes a Gender and returns the id', async () => {
    //Arrange

    const existingGender = GenderFactory.build()

    vi.spyOn(prisma.gender, 'delete').mockResolvedValueOnce(existingGender)

    // Act

    const result = await deleteGenderById(existingGender.id)

    // Assert

    expect(result).toEqual(existingGender.id)
  })
})
