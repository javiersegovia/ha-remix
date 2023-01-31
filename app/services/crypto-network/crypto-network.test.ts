import { prisma } from '~/db.server'
import { CryptoNetworkFactory } from './crypto-network.factory'
import { getCryptoNetworks } from './crypto-network.server'

describe('getCurrencies', () => {
  it('returns an array of currencies', async () => {
    const cryptoNetworks = CryptoNetworkFactory.buildList(3)
    vi.spyOn(prisma.cryptoNetwork, 'findMany').mockResolvedValue(cryptoNetworks)
    expect(await getCryptoNetworks()).toEqual(cryptoNetworks)
  })
})
