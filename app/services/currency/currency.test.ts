import { prisma } from '~/db.server'
import { CurrencyFactory } from './currency.factory'
import { getCurrencies } from './currency.server'

describe('getCurrencies', () => {
  it('returns an array of currencies', async () => {
    const currencies = CurrencyFactory.buildList(3)
    vi.spyOn(prisma.currency, 'findMany').mockResolvedValue(currencies)
    expect(await getCurrencies()).toEqual(currencies)
  })
})
