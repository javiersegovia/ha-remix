import { prisma } from '~/db.server'
import { BenefitFactory } from './benefit.factory'
import * as benefitService from './benefit.server'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('getBenefits', () => {
  test('should return an array of benefits', async () => {
    const expectedBenefits = BenefitFactory.buildList(3)
    vi.spyOn(prisma.benefit, 'findMany').mockResolvedValueOnce(expectedBenefits)
    const result = await benefitService.getBenefits()
    expect(result).toMatchObject(expectedBenefits)
  })
})
