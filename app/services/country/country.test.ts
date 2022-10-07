import { prisma } from '~/db.server'
import { getCountries } from './country.server'

afterAll(async () => {
  vi.restoreAllMocks()
})

describe('getCountries', () => {
  test('should return an array of countries', async () => {
    vi.spyOn(prisma.country, 'findMany').mockResolvedValue([])
    expect(await getCountries()).toEqual([])
  })
})
