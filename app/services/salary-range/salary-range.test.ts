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
  it('creates and returns a Bank', async () => {
    const expectedSalaryRange = SalaryRangeFactory.build()

    vi.spyOn(prisma.salaryRange, 'create').mockResolvedValueOnce(
      expectedSalaryRange
    )

    const result = await salaryRangeService.createSalaryRange({
      name: expectedSalaryRange.name,
    })

    expect(result).toEqual(expectedSalaryRange)
  })
})

describe('updateSalaryRangeById', () => {
  it('updates and returns a Bank', async () => {
    const existingBank = SalaryRangeFactory.build()
    const newBank = SalaryRangeFactory.build()

    vi.spyOn(prisma.salaryRange, 'update').mockResolvedValueOnce(newBank)

    const result = await updateSalaryRangeById(existingBank.id, {
      name: newBank.name,
    })

    expect(result).toEqual(newBank)
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
