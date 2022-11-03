import { prisma } from '~/db.server'
import { CryptocurrencyFactory } from './crypto-currency.factory'
import { getCryptocurrencies } from './crypto-currency.server'

afterAll(async () => {
  vi.restoreAllMocks()
})

describe('getCryptocurrencies', () => {
  test('should return an array of cryptocurrencies', async () => {
    const cryptocurrencies = CryptocurrencyFactory.buildList(3)

    vi.spyOn(prisma.cryptocurrency, 'findMany').mockResolvedValue(
      cryptocurrencies
    )

    expect(await getCryptocurrencies()).toEqual(cryptocurrencies)
  })
})
