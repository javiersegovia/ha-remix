import { prisma } from '~/db.server'
import { SalaryRangeFactory } from './salary-range.factory'
import * as salaryRangeService from './salary-range.server'
import {
  deleteSalaryRangeById,
  updateSalaryRangeById,
} from './salary-range.server'

describe('getSalaryRanges', () => {
  it('returns an array of salary ranges', async () => {
    const salaryRanges = SalaryRangeFactory.buildList(3)
    vi.spyOn(prisma.salaryRange, 'findMany').mockResolvedValueOnce(salaryRanges)
    expect(await salaryRangeService.getSalaryRanges()).toEqual(salaryRanges)
  })
})

describe('getSalaryRangeById', () => {
  it('returns a salaryRange', async () => {
    const expectedSalaryRange = SalaryRangeFactory.build()
    vi.spyOn(prisma.salaryRange, 'findUnique').mockResolvedValueOnce(
      expectedSalaryRange
    )

    const result = await salaryRangeService.getSalaryRangeById(
      expectedSalaryRange.id
    )

    expect(result).toEqual(expectedSalaryRange)
  })
})

describe('createSalaryRange', () => {
  it('creates and returns a SalaryRange', async () => {
    const expectedSalaryRange = SalaryRangeFactory.build()

    vi.spyOn(prisma.salaryRange, 'create').mockResolvedValueOnce(
      expectedSalaryRange
    )

    const result = await salaryRangeService.createSalaryRange({
      minValue: expectedSalaryRange.minValue,
      maxValue: expectedSalaryRange.maxValue,
    })

    expect(result).toEqual(expectedSalaryRange)
  })
})

describe('updateSalaryRangeById', () => {
  it('updates and returns a SalaryRange', async () => {
    const existingSalaryRange = SalaryRangeFactory.build()
    const newSalaryRange = SalaryRangeFactory.build()

    vi.spyOn(prisma.salaryRange, 'update').mockResolvedValueOnce(newSalaryRange)

    const result = await updateSalaryRangeById(existingSalaryRange.id, {
      minValue: newSalaryRange.minValue,
      maxValue: newSalaryRange.maxValue,
    })

    expect(result).toEqual(newSalaryRange)
  })
})

describe('deleteSalaryRangeById', () => {
  it('deletes a salaryRange and returns the id', async () => {
    const existingSalaryRange = SalaryRangeFactory.build()

    vi.spyOn(prisma.salaryRange, 'delete').mockResolvedValueOnce(
      existingSalaryRange
    )

    const result = await deleteSalaryRangeById(existingSalaryRange.id)

    expect(result).toEqual(existingSalaryRange.id)
  })
})
