import { prisma } from '~/db.server'
import { BankAccountTypeFactory } from './bank-account-type.factory'
import * as bankAccountTypeService from './bank-account-type.server'

describe('getBankAccountTypes', () => {
  it('returns an array of bankAccountTypes', async () => {
    const bankAccountTypes = BankAccountTypeFactory.buildList(3)

    vi.spyOn(prisma.bankAccountType, 'findMany').mockResolvedValueOnce(
      bankAccountTypes
    )

    const result = await bankAccountTypeService.getBankAccountTypes()
    expect(result).toEqual(bankAccountTypes)
  })
})

describe('getBankAccountTypeById', () => {
  it('returns a bank account type', async () => {
    const expectedBankAccountType = BankAccountTypeFactory.build()
    vi.spyOn(prisma.bankAccountType, 'findUnique').mockResolvedValueOnce(
      expectedBankAccountType
    )

    const result = await bankAccountTypeService.getBankAccountTypeById(
      expectedBankAccountType.id
    )

    expect(result).toEqual(expectedBankAccountType)
  })
})

describe('createBankAccountType', () => {
  it('creates and returns a Bank', async () => {
    const expectedBankAccountType = BankAccountTypeFactory.build()

    vi.spyOn(prisma.bankAccountType, 'create').mockResolvedValueOnce(
      expectedBankAccountType
    )

    const result = await bankAccountTypeService.createBankAccountType({
      name: expectedBankAccountType.name,
    })

    expect(result).toEqual(expectedBankAccountType)
  })
})

describe('updateBankById', () => {
  it('updates and returns a Bank', async () => {
    const existingBankAccountType = BankAccountTypeFactory.build()
    const newBankAccountType = BankAccountTypeFactory.build()

    vi.spyOn(prisma.bankAccountType, 'update').mockResolvedValueOnce(
      newBankAccountType
    )

    const result = await bankAccountTypeService.updateBankAccountTypeById(
      existingBankAccountType.id,
      {
        name: newBankAccountType.name,
      }
    )

    expect(result).toEqual(newBankAccountType)
  })
})

describe('deleteBankAccountTypeById', () => {
  it('deletes a bank and returns the id', async () => {
    const existingBankAccountType = BankAccountTypeFactory.build()

    vi.spyOn(prisma.bankAccountType, 'delete').mockResolvedValueOnce(
      existingBankAccountType
    )

    const result = await bankAccountTypeService.deleteBankAccountTypeById(
      existingBankAccountType.id
    )

    expect(result).toEqual(existingBankAccountType.id)
  })
})
