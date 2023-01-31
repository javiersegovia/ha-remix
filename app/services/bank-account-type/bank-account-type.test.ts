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
