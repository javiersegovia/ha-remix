import { prisma } from '~/db.server'
import { PremiumAdvanceFactory } from './premium-advance.factory'
import {
  getPremiumAdvanceById,
  getPremiumAdvances,
} from './premium-advance.server'

describe('getPremiumAdvances', () => {
  it('returns a list of premium advances', async () => {
    const mockPremiumAdvances = PremiumAdvanceFactory.buildList(3)

    vi.spyOn(prisma.premiumAdvance, 'findMany').mockResolvedValue(
      mockPremiumAdvances
    )

    const result = await getPremiumAdvances()
    expect(result).toEqual(mockPremiumAdvances)
  })
})

describe('getPremiumAdvanceById', () => {
  it('returns a PremiumAdvance', async () => {
    const mockPremiumAdvance = PremiumAdvanceFactory.build()

    vi.spyOn(prisma.premiumAdvance, 'findUnique').mockResolvedValue(
      mockPremiumAdvance
    )

    const result = await getPremiumAdvanceById(mockPremiumAdvance.id)
    expect(result).toEqual(mockPremiumAdvance)
  })
})
