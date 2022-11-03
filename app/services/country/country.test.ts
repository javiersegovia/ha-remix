import { prisma } from '~/db.server'
import { CountryFactory } from './country.factory'
import { getCountries } from './country.server'

afterAll(async () => {
  vi.restoreAllMocks()
})

describe('getCountries', () => {
  test('should return an array of countries', async () => {
    const countries = CountryFactory.buildList(3)
    vi.spyOn(prisma.country, 'findMany').mockResolvedValue(countries)
    expect(await getCountries()).toEqual(countries)
  })
})
