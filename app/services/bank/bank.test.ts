import { prisma } from '~/db.server'
import { BankFactory } from './bank.factory'
import * as bankService from './bank.server'

afterAll(() => {
  vi.restoreAllMocks()
})

describe('getBanks', () => {
  test('should return an array of banks', async () => {
    const banks = BankFactory.buildList(3)
    vi.spyOn(prisma.bank, 'findMany').mockResolvedValueOnce(banks)
    expect(await bankService.getBanks()).toEqual(banks)
  })
})
