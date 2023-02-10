import { prisma } from '~/db.server'
import { BankFactory } from './bank.factory'
import * as bankService from './bank.server'
import { deleteBankById, updateBankById } from './bank.server'

describe('getBanks', () => {
  it('returns an array of banks', async () => {
    const banks = BankFactory.buildList(3)
    vi.spyOn(prisma.bank, 'findMany').mockResolvedValueOnce(banks)
    expect(await bankService.getBanks()).toEqual(banks)
  })
})

describe('getBankById', () => {
  it('returns a bank', async () => {
    const expectedBank = BankFactory.build()
    vi.spyOn(prisma.bank, 'findUnique').mockResolvedValueOnce(expectedBank)

    const result = await bankService.getBankById(expectedBank.id)

    expect(result).toEqual(expectedBank)
  })
})

describe('createBank', () => {
  it('creates and returns a Bank', async () => {
    const expectedBank = BankFactory.build()

    vi.spyOn(prisma.bank, 'create').mockResolvedValueOnce(expectedBank)

    const result = await bankService.createBank({
      name: expectedBank.name,
    })

    expect(result).toEqual(expectedBank)
  })
})

describe('updateBankById', () => {
  it('updates and returns a Bank', async () => {
    const existingBank = BankFactory.build()
    const newBank = BankFactory.build()

    vi.spyOn(prisma.bank, 'update').mockResolvedValueOnce(newBank)

    const result = await updateBankById(existingBank.id, {
      name: newBank.name,
    })

    expect(result).toEqual(newBank)
  })
})

describe('deleteBankById', () => {
  it('deletes a bank and returns the id', async () => {
    const existingBank = BankFactory.build()

    vi.spyOn(prisma.bank, 'delete').mockResolvedValueOnce(existingBank)

    const result = await deleteBankById(existingBank.id)

    expect(result).toEqual(existingBank.id)
  })
})
