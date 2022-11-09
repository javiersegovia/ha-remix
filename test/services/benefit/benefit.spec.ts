import { truncateDB } from 'test/helpers/truncateDB'
import { BenefitFactory } from '~/services/benefit/benefit.factory'
import * as benefitService from '~/services/benefit/benefit.server'

beforeEach(async () => {
  await truncateDB()
})

describe('getBenefits', () => {
  test('should return an array of benefits', async () => {
    const expectedBenefits = (await BenefitFactory.createList(3))
      .map((benefit) => ({
        id: benefit.id,
        name: benefit.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    const result = await benefitService.getBenefits()
    expect(result).toEqual(expectedBenefits)
  })
})
